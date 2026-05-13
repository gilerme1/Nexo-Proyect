export * from "./seeds/subscriptions";

import { store } from "./store";

export function getSubscriptionByTenant(tenantId: string) {
  return store.subscriptions.find((s) => s.tenantId === tenantId);
}

export function getUsageByTenant(tenantId: string) {
  return store.usageCounters.filter((u) => u.tenantId === tenantId);
}

export function currentMonthPeriod(): string {
  const now = new Date("2026-04-26"); // pinned for demo
  return `month_${now.getUTCFullYear()}_${String(now.getUTCMonth() + 1).padStart(2, "0")}`;
}
