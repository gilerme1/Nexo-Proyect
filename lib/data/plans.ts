export * from "./seeds/plans";

import { store } from "./store";

export function getPlanById(id: string) {
  return store.plans.find((p) => p.id === id);
}

export function getPlanBySlug(slug: string) {
  return store.plans.find((p) => p.slug === slug);
}

export function publicPlans() {
  return store.plans
    .filter((p) => p.isPublic)
    .sort((a, b) => a.sortOrder - b.sortOrder);
}
