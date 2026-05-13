export * from "./seeds/verticals";

import { store } from "./store";

export function getVerticalById(id: string) {
  return store.verticals.find((v) => v.id === id);
}

export function getEquipmentTypesByVertical(verticalId: string) {
  return store.equipmentTypes.filter((t) => t.verticalId === verticalId);
}

export function getVerticalsByTenant(tenantId: string) {
  const ids = store.tenantVerticals
    .filter((tv) => tv.tenantId === tenantId)
    .map((tv) => tv.verticalId);
  return store.verticals.filter((v) => ids.includes(v.id));
}

export function getTenantsByVertical(verticalId: string) {
  return store.tenantVerticals.filter((tv) => tv.verticalId === verticalId);
}
