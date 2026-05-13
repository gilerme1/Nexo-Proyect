"use server";

import { revalidatePath } from "next/cache";
import { store, newId } from "@/lib/data/store";
import { getSession } from "@/lib/auth/get-session";
import { canCreate } from "@/lib/billing/limits";
import type { Equipment, EquipmentStatus } from "@/lib/types";

export interface EquipmentActionResult {
  ok: boolean;
  error?: string;
  equipmentId?: string;
}

// ============================================================================
// CREATE EQUIPMENT (full or quick-from-QR-scan)
// ============================================================================

export async function createEquipment(
  formData: FormData,
): Promise<EquipmentActionResult> {
  const session = await getSession();
  if (session.workspace.kind !== "tenant") {
    return { ok: false, error: "Sesión inválida." };
  }
  const tenantId = session.workspace.tenantId;

  // Limit check
  const limit = canCreate(tenantId, "equipment");
  if (!limit.allowed) {
    return {
      ok: false,
      error: limit.reason ?? "Llegaste al límite de equipos de tu plan.",
    };
  }

  // Required fields (these 4 are the bare minimum even from on-site QR scan)
  const name = String(formData.get("name") ?? "").trim();
  const clientId = String(formData.get("clientId") ?? "");
  const locationId = String(formData.get("locationId") ?? "");
  const equipmentTypeId = String(formData.get("equipmentTypeId") ?? "");

  if (!name) return { ok: false, error: "El nombre es obligatorio." };
  if (!clientId) return { ok: false, error: "Tenés que elegir un cliente." };
  if (!locationId) return { ok: false, error: "Tenés que elegir una ubicación." };
  if (!equipmentTypeId)
    return { ok: false, error: "Tenés que elegir el tipo de equipo." };

  const client = store.clients.find((c) => c.id === clientId);
  if (!client || client.tenantId !== tenantId) {
    return { ok: false, error: "Cliente inválido." };
  }
  const location = store.locations.find((l) => l.id === locationId);
  if (!location || location.clientId !== clientId) {
    return { ok: false, error: "Ubicación inválida." };
  }
  const eqType = store.equipmentTypes.find((t) => t.id === equipmentTypeId);
  if (!eqType) return { ok: false, error: "Tipo de equipo inválido." };

  // Optional fields
  const internalCode =
    String(formData.get("internalCode") ?? "").trim() ||
    `EQ-${Date.now().toString(36).toUpperCase().slice(-6)}`;
  const isDraft = formData.get("isDraft") === "true";
  const qrCode = String(formData.get("qrCode") ?? "");
  const createdFromQrTagId = String(formData.get("createdFromQrTagId") ?? "");
  const notes = String(formData.get("notes") ?? "").trim();

  // Collect all data fields starting with "data_"
  const data: Record<string, unknown> = {};
  for (const [key, value] of formData.entries()) {
    if (key.startsWith("data_")) {
      const fieldId = key.slice(5);
      const v = String(value).trim();
      if (v) data[fieldId] = v;
    }
  }

  const now = new Date().toISOString();
  const equipment: Equipment = {
    id: newId("eq"),
    tenantId,
    clientId,
    locationId,
    equipmentTypeId,
    templateId: `template_${eqType.slug}`, // hardcoded template reference for now
    templateVersionId: "v1",
    internalCode,
    name,
    qrCode: qrCode || internalCode,
    status: "operational",
    data,
    notes: notes || undefined,
    isDraft: isDraft || undefined,
    createdBy: session.userId,
    createdFromQrTagId: createdFromQrTagId || undefined,
    createdAt: now,
  };

  store.equipment.push(equipment);

  revalidatePath("/app/equipment");
  revalidatePath(`/app/clients/${clientId}`);
  revalidatePath("/app");
  return { ok: true, equipmentId: equipment.id };
}

// ============================================================================
// UPDATE EQUIPMENT (full edit, also marks isDraft = false if it was draft)
// ============================================================================

export async function updateEquipment(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const equipment = store.equipment.find((e) => e.id === id);
  if (!equipment) return;

  const name = String(formData.get("name") ?? "").trim();
  if (name) equipment.name = name;

  const clientId = String(formData.get("clientId") ?? "");
  if (clientId) equipment.clientId = clientId;

  const locationId = String(formData.get("locationId") ?? "");
  if (locationId) equipment.locationId = locationId;

  const equipmentTypeId = String(formData.get("equipmentTypeId") ?? "");
  if (equipmentTypeId) equipment.equipmentTypeId = equipmentTypeId;

  const internalCode = String(formData.get("internalCode") ?? "").trim();
  if (internalCode) equipment.internalCode = internalCode;

  const status = String(formData.get("status") ?? "").trim();
  if (status) equipment.status = status as EquipmentStatus;

  const notes = String(formData.get("notes") ?? "").trim();
  equipment.notes = notes || undefined;

  // Update data fields
  const newData: Record<string, unknown> = { ...equipment.data };
  for (const [key, value] of formData.entries()) {
    if (key.startsWith("data_")) {
      const fieldId = key.slice(5);
      const v = String(value).trim();
      if (v) newData[fieldId] = v;
      else delete newData[fieldId];
    }
  }
  equipment.data = newData;

  // If draft and the user is completing, optionally clear isDraft
  const finalize = formData.get("finalize") === "true";
  if (finalize) equipment.isDraft = false;

  revalidatePath(`/app/equipment/${id}`);
  revalidatePath("/app/equipment");
}

// ============================================================================
// DELETE EQUIPMENT
// ============================================================================

export async function deleteEquipment(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  store.equipment = store.equipment.filter((e) => e.id !== id);
  revalidatePath("/app/equipment");
  revalidatePath("/app");
}

// ============================================================================
// QUICK-FINALIZE (mark draft as complete without other edits)
// ============================================================================

export async function finalizeDraft(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const eq = store.equipment.find((e) => e.id === id);
  if (eq) eq.isDraft = false;
  revalidatePath(`/app/equipment/${id}`);
  revalidatePath("/app/equipment");
}
