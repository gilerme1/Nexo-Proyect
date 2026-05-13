"use server";

import { revalidatePath } from "next/cache";
import { store, newId } from "@/lib/data/store";
import { getSession } from "@/lib/auth/get-session";
import type { QrBatch, QrTag } from "@/lib/types";

// ============================================================================
// Generate a human-readable, unambiguous code (no O/0/I/1/l)
// ============================================================================
const CHARSET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

function randomCode(prefix: string, length = 8): string {
  let code = "";
  const arr = new Uint8Array(length);
  // crypto.getRandomValues works in Node 20
  crypto.getRandomValues(arr);
  for (const byte of arr) {
    code += CHARSET[byte % CHARSET.length];
  }
  return `${prefix}-${code.slice(0, 4)}-${code.slice(4, 8)}`;
}

function ensureUnique(prefix: string): string {
  let code: string;
  let attempts = 0;
  do {
    code = randomCode(prefix);
    attempts++;
  } while (
    store.qrTags.some((t) => t.code === code) && attempts < 100
  );
  return code;
}

// ============================================================================
// CREATE BATCH
// ============================================================================

export interface CreateBatchResult {
  ok: boolean;
  error?: string;
  batchId?: string;
}

export async function createQrBatch(
  formData: FormData,
): Promise<CreateBatchResult> {
  const session = await getSession();
  if (session.workspace.kind !== "tenant") {
    return { ok: false, error: "Sesión inválida." };
  }
  const tenantId = session.workspace.tenantId;

  const name = String(formData.get("name") ?? "").trim();
  const sizeRaw = parseInt(String(formData.get("size") ?? "30"), 10);
  const prefix = String(formData.get("prefix") ?? "MTL")
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "")
    .slice(0, 4);

  if (!name) return { ok: false, error: "Necesitás un nombre para el lote." };
  if (isNaN(sizeRaw) || sizeRaw < 1 || sizeRaw > 300) {
    return { ok: false, error: "La cantidad debe estar entre 1 y 300." };
  }

  const now = new Date().toISOString();
  const batchId = newId("batch");

  const batch: QrBatch = {
    id: batchId,
    scope: "tenant",
    tenantId,
    name,
    size: sizeRaw,
    format: "avery_5160",
    prefix: prefix || "MTL",
    status: "draft",
    createdBy: session.userId,
    createdAt: now,
  };

  // Generate all QR tags for this batch
  const tags: QrTag[] = Array.from({ length: sizeRaw }, () => {
    const code = ensureUnique(prefix || "MTL");
    return {
      id: newId("qtag"),
      tenantId,
      batchId,
      code,
      url: `https://maintly.app/q/${code}`,
      status: "free" as const,
      createdAt: now,
    };
  });

  store.qrBatches.push(batch);
  store.qrTags.push(...tags);

  // Mark batch as printing
  batch.status = "printing";

  revalidatePath("/app/qr-tags");
  return { ok: true, batchId };
}

// ============================================================================
// MARK BATCH AS PRINTED
// ============================================================================

export async function markBatchPrinted(formData: FormData) {
  const id = String(formData.get("batchId") ?? "");
  const batch = store.qrBatches.find((b) => b.id === id);
  if (batch) batch.status = "printed";
  revalidatePath("/app/qr-tags");
}

// ============================================================================
// BIND QR TAG TO EQUIPMENT
// ============================================================================

export async function bindQrTag(tagCode: string, equipmentId: string): Promise<{ ok: boolean; error?: string }> {
  const session = await getSession();
  const tag = store.qrTags.find((t) => t.code === tagCode);
  if (!tag) return { ok: false, error: "QR no encontrado." };
  if (tag.status === "bound") return { ok: false, error: "Este QR ya está asignado." };
  if (tag.status === "voided") return { ok: false, error: "Este QR fue anulado." };

  tag.status = "bound";
  tag.equipmentId = equipmentId;
  tag.boundAt = new Date().toISOString();
  tag.claimedAt = new Date().toISOString();
  tag.claimedBy = session.userId;

  // Also set qrCode on the equipment
  const eq = store.equipment.find((e) => e.id === equipmentId);
  if (eq) eq.qrCode = tagCode;

  revalidatePath("/app/qr-tags");
  revalidatePath(`/app/equipment/${equipmentId}`);
  return { ok: true };
}

// ============================================================================
// VOID QR TAG
// ============================================================================

export async function voidQrTag(formData: FormData) {
  const id = String(formData.get("tagId") ?? "");
  const reason = String(formData.get("reason") ?? "Anulado manualmente");
  const tag = store.qrTags.find((t) => t.id === id);
  if (tag) {
    tag.status = "voided";
    tag.voidedAt = new Date().toISOString();
    tag.voidedReason = reason;
  }
  revalidatePath("/app/qr-tags");
}
