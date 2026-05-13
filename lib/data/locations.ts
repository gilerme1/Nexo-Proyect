export * from "./seeds/locations";

import { store } from "./store";

export function getLocationById(id: string) {
  return store.locations.find((l) => l.id === id);
}

export function getLocationsByTenant(tenantId: string) {
  return store.locations.filter((l) => l.tenantId === tenantId);
}

export function getLocationsByClient(clientId: string) {
  return store.locations.filter((l) => l.clientId === clientId);
}
