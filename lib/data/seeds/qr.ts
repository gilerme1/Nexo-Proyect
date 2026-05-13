import type { QrBatch, QrTag } from "@/lib/types";

const BASE_URL = "https://maintly.app";

// Helper to generate deterministic short codes
function makeCode(prefix: string, n: number): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  let seed = n * 7919 + 1337;
  for (let i = 0; i < 8; i++) {
    code += chars[seed % chars.length];
    seed = (seed * 6364136223846793005 + 1442695040888963407) % 2 ** 32;
  }
  return `${prefix}-${code.slice(0, 4)}-${code.slice(4, 8)}`;
}

// ============================================================================
// Batch 1 — Seguridad Norte — 30 tags, printed, 20 assigned + 10 free
// ============================================================================
export const batch1: QrBatch = {
  id: "batch_norte_1",
  scope: "tenant",
  tenantId: "tenant_norte",
  name: "Lote inicial cámaras Q1 2026",
  size: 30,
  format: "avery_5160",
  prefix: "SN",
  status: "printed",
  createdBy: "user_admin",
  createdAt: "2026-02-10T10:00:00Z",
};

// ============================================================================
// Batch 2 — ClimaVisión — 15 tags, distributed, 5 assigned + 10 free
// ============================================================================
export const batch2: QrBatch = {
  id: "batch_clima_1",
  scope: "tenant",
  tenantId: "tenant_clima",
  name: "Equipos hotel temporada alta",
  size: 15,
  format: "avery_5160",
  prefix: "CV",
  status: "distributed",
  createdBy: "user_admin",
  createdAt: "2026-02-20T10:00:00Z",
};

export const mockQrBatches: QrBatch[] = [batch1, batch2];

// ============================================================================
// Tags batch 1 — Seguridad Norte (30 tags)
// ============================================================================
const norte_tags: QrTag[] = Array.from({ length: 30 }, (_, i) => {
  const n = i + 1;
  const code = makeCode("SN", n);
  const isBound = n <= 3; // first 3 map to the 3 existing equipment
  const equipmentIds = ["eq_norte_1", "eq_norte_2", "eq_norte_3"];
  return {
    id: `qtag_norte_${n}`,
    tenantId: "tenant_norte",
    batchId: "batch_norte_1",
    code,
    url: `${BASE_URL}/q/${code}`,
    status: isBound ? "bound" : "free",
    equipmentId: isBound ? equipmentIds[n - 1] : undefined,
    boundAt: isBound ? "2026-02-15T14:00:00Z" : undefined,
    claimedAt: isBound ? "2026-02-15T13:55:00Z" : undefined,
    claimedBy: isBound ? "user_admin" : undefined,
    createdAt: "2026-02-10T10:00:00Z",
  };
});

// ============================================================================
// Tags batch 2 — ClimaVisión (15 tags)
// ============================================================================
const clima_tags: QrTag[] = Array.from({ length: 15 }, (_, i) => {
  const n = i + 1;
  const code = makeCode("CV", n);
  const isBound = n === 1; // only first tag is bound
  return {
    id: `qtag_clima_${n}`,
    tenantId: "tenant_clima",
    batchId: "batch_clima_1",
    code,
    url: `${BASE_URL}/q/${code}`,
    status: isBound ? "bound" : "free",
    equipmentId: isBound ? "eq_clima_1" : undefined,
    boundAt: isBound ? "2026-02-26T10:00:00Z" : undefined,
    claimedAt: isBound ? "2026-02-26T09:58:00Z" : undefined,
    claimedBy: isBound ? "user_admin" : undefined,
    createdAt: "2026-02-20T10:00:00Z",
  };
});

export const mockQrTags: QrTag[] = [...norte_tags, ...clima_tags];
