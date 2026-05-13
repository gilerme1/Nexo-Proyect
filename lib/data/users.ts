// Re-export seeds (so existing imports of `mockUsers`, etc. keep working)
export * from "./seeds/users";

// Helpers read from the live store
import { store } from "./store";

export function getTenantById(id: string) {
  return store.tenants.find((t) => t.id === id);
}

export function getTenantBySlug(slug: string) {
  return store.tenants.find((t) => t.slug === slug);
}

export function getUserById(id: string) {
  return store.users.find((u) => u.id === id);
}

export function getMembershipsByTenant(tenantId: string) {
  return store.memberships.filter((m) => m.tenantId === tenantId);
}

export function getMembershipsByUser(userId: string) {
  return store.memberships.filter((m) => m.userId === userId);
}
