export * from "./seeds/operations";

import { store } from "./store";

export function getClientsByTenant(tenantId: string) {
  return store.clients.filter((c) => c.tenantId === tenantId);
}

export function getEquipmentByTenant(tenantId: string) {
  return store.equipment.filter((e) => e.tenantId === tenantId);
}

export function getReportsByTenant(tenantId: string) {
  return store.reports.filter((r) => r.tenantId === tenantId);
}
