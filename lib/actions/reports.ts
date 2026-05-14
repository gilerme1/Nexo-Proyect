"use server";

import { revalidatePath } from "next/cache";
import { store, newId } from "@/lib/data/store";
import { getSession } from "@/lib/auth/get-session";
import type {
  MaintenanceReport,
  ScheduledMaintenance,
  MaintenanceFrequency,
  ReportPhoto,
} from "@/lib/types";

// ============================================================================
// Helpers
// ============================================================================

function nextReportCode(tenantId: string): string {
  const existing = store.reports.filter((r) => r.tenantId === tenantId);
  const n = existing.length + 1;
  return `RPT-${String(n).padStart(4, "0")}`;
}

function addFrequency(from: Date, freq: MaintenanceFrequency): Date {
  const d = new Date(from);
  switch (freq) {
    case "weekly":      d.setDate(d.getDate() + 7); break;
    case "biweekly":    d.setDate(d.getDate() + 14); break;
    case "monthly":     d.setMonth(d.getMonth() + 1); break;
    case "bimonthly":   d.setMonth(d.getMonth() + 2); break;
    case "quarterly":   d.setMonth(d.getMonth() + 3); break;
    case "semiannual":  d.setMonth(d.getMonth() + 6); break;
    case "annual":      d.setFullYear(d.getFullYear() + 1); break;
  }
  return d;
}

// ============================================================================
// CREATE REPORT
// ============================================================================

export interface CreateReportResult {
  ok: boolean;
  error?: string;
  reportId?: string;
}

export async function createReport(
  formData: FormData,
): Promise<CreateReportResult> {
  const session = await getSession();
  if (session.workspace.kind !== "tenant") {
    return { ok: false, error: "Sesión inválida." };
  }
  const tenantId = session.workspace.tenantId;

  const equipmentId = String(formData.get("equipmentId") ?? "");
  const clientId = String(formData.get("clientId") ?? "");
  const locationId = String(formData.get("locationId") ?? "");
  const observations = String(formData.get("observations") ?? "").trim();
  const signatureDataUrl = String(formData.get("signatureDataUrl") ?? "").trim();
  const durationStr = String(formData.get("durationMinutes") ?? "");
  const durationMinutes = durationStr ? parseInt(durationStr, 10) : undefined;
  const scheduledMaintenanceId = String(formData.get("scheduledMaintenanceId") ?? "") || undefined;

  if (!equipmentId) return { ok: false, error: "Equipo requerido." };
  if (!clientId) return { ok: false, error: "Cliente requerido." };

  // Collect photos
  let photos: ReportPhoto[] = [];
  const photosJson = String(formData.get("photosJson") ?? "");
  if (photosJson) {
    try {
      const raw = JSON.parse(photosJson);
      photos = raw.map((p: any) => ({
        id: newId("photo"),
        url: p.url,
        caption: p.caption ?? "",
        takenAt: new Date().toISOString(),
      }));
    } catch { /* ignore */ }
  }

  // Collect checklists
  let checklists: import("@/lib/types").ReportChecklist[] = [];
  const checklistsJson = String(formData.get("checklistsJson") ?? "");
  if (checklistsJson) {
    try {
      checklists = JSON.parse(checklistsJson);
    } catch { /* ignore */ }
  }

  const now = new Date().toISOString();
  const report: MaintenanceReport = {
    id: newId("rep"),
    tenantId,
    code: nextReportCode(tenantId),
    clientId,
    locationId: locationId || undefined,
    equipmentId,
    reportTemplateId: "tpl_default",
    reportTemplateVersionId: "v1",
    reportKind: "corrective",
    status: signatureDataUrl ? "completed" : "pending",
    date: now,
    durationMinutes,
    technicianId: session.userId,
    data: {},
    observations: observations || undefined,
    signatureDataUrl: signatureDataUrl || undefined,
    photos: photos.length > 0 ? photos : undefined,
    checklists: checklists.length > 0 ? checklists : undefined,
    scheduledMaintenanceId,
    createdAt: now,
  };

  store.reports.push(report);

  // If linked to scheduled maintenance, mark it as completed + schedule next
  if (scheduledMaintenanceId) {
    const sm = store.scheduledMaintenances.find((m) => m.id === scheduledMaintenanceId);
    if (sm) {
      sm.lastCompletedAt = now;
      sm.status = "completed";
      // Create next occurrence
      const nextDue = addFrequency(new Date(now), sm.frequency);
      const next: ScheduledMaintenance = {
        ...sm,
        id: newId("sm"),
        status: "scheduled",
        nextDueAt: nextDue.toISOString(),
        lastCompletedAt: undefined,
        createdAt: now,
      };
      store.scheduledMaintenances.push(next);
    }
  }

  // Update equipment lastMaintenanceAt
  const eq = store.equipment.find((e) => e.id === equipmentId);
  if (eq) eq.lastMaintenanceAt = now;

  revalidatePath("/app/reports");
  revalidatePath(`/app/equipment/${equipmentId}`);
  revalidatePath("/app");
  return { ok: true, reportId: report.id };
}

// ============================================================================
// CREATE SCHEDULED MAINTENANCE
// ============================================================================

export interface CreateScheduleResult {
  ok: boolean;
  error?: string;
  scheduleId?: string;
}

export async function createScheduledMaintenance(
  formData: FormData,
): Promise<CreateScheduleResult> {
  const session = await getSession();
  if (session.workspace.kind !== "tenant") {
    return { ok: false, error: "Sesión inválida." };
  }
  const tenantId = session.workspace.tenantId;

  const equipmentId = String(formData.get("equipmentId") ?? "");
  const clientId = String(formData.get("clientId") ?? "");
  const locationId = String(formData.get("locationId") ?? "");
  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const frequency = String(formData.get("frequency") ?? "monthly") as MaintenanceFrequency;
  const nextDueAt = String(formData.get("nextDueAt") ?? "");
  const assignedTo = String(formData.get("assignedTo") ?? "") || undefined;

  if (!equipmentId) return { ok: false, error: "Equipo requerido." };
  if (!title) return { ok: false, error: "Título requerido." };
  if (!nextDueAt) return { ok: false, error: "Fecha requerida." };

  const sm: ScheduledMaintenance = {
    id: newId("sm"),
    tenantId,
    equipmentId,
    clientId,
    locationId: locationId || undefined,
    title,
    description: description || undefined,
    frequency,
    nextDueAt: new Date(nextDueAt).toISOString(),
    assignedTo,
    status: "scheduled",
    createdAt: new Date().toISOString(),
  };

  // Also update equipment.nextMaintenanceAt if earlier
  const eq = store.equipment.find((e) => e.id === equipmentId);
  if (eq) {
    if (!eq.nextMaintenanceAt || sm.nextDueAt < eq.nextMaintenanceAt) {
      eq.nextMaintenanceAt = sm.nextDueAt;
    }
  }

  store.scheduledMaintenances.push(sm);

  revalidatePath("/app/maintenances");
  revalidatePath(`/app/equipment/${equipmentId}`);
  revalidatePath("/app");
  return { ok: true, scheduleId: sm.id };
}

// ============================================================================
// UPDATE REPORT
// ============================================================================

export async function updateReport(formData: FormData): Promise<{ ok: boolean; error?: string }> {
  const session = await getSession();
  if (session.workspace.kind !== "tenant") return { ok: false, error: "Sesión inválida." };
  const tenantId = session.workspace.tenantId;

  const id = String(formData.get("id") ?? "");
  const report = store.reports.find((r) => r.id === id && r.tenantId === tenantId);
  if (!report) return { ok: false, error: "Reporte no encontrado." };

  const status = String(formData.get("status") ?? "").trim();
  if (status) report.status = status as import("@/lib/types").ReportStatus;

  const reportKind = String(formData.get("reportKind") ?? "").trim();
  if (reportKind) report.reportKind = reportKind as import("@/lib/types").ReportKind;

  const date = String(formData.get("date") ?? "").trim();
  if (date) report.date = new Date(date).toISOString();

  const durRaw = parseInt(String(formData.get("durationMinutes") ?? ""), 10);
  if (!isNaN(durRaw) && durRaw > 0) report.durationMinutes = durRaw;
  else if (String(formData.get("durationMinutes") ?? "").trim() === "") report.durationMinutes = undefined;

  const observations = String(formData.get("observations") ?? "").trim();
  report.observations = observations || undefined;

  revalidatePath(`/app/reports/${id}`);
  revalidatePath("/app/reports");
  revalidatePath("/app");
  return { ok: true };
}

// ============================================================================
// COMPLETE SCHEDULED MAINTENANCE (quick action from list)
// ============================================================================

export async function completeScheduledMaintenance(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const sm = store.scheduledMaintenances.find((m) => m.id === id);
  if (!sm) return;

  const now = new Date().toISOString();
  sm.lastCompletedAt = now;
  sm.status = "completed";

  // Schedule next
  const nextDue = addFrequency(new Date(now), sm.frequency);
  store.scheduledMaintenances.push({
    ...sm,
    id: newId("sm"),
    status: "scheduled",
    nextDueAt: nextDue.toISOString(),
    lastCompletedAt: undefined,
    createdAt: now,
  });

  const eq = store.equipment.find((e) => e.id === sm.equipmentId);
  if (eq) {
    eq.lastMaintenanceAt = now;
    eq.nextMaintenanceAt = nextDue.toISOString();
  }

  revalidatePath("/app/maintenances");
  revalidatePath("/app");
}
