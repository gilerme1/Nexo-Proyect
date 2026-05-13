// ============================================================================
// Limit enforcement logic
// ============================================================================
//
// Single source of truth for "can this tenant do X?" questions.
// Used both in the UI (to show warnings/blocks) and in server actions
// (to actually prevent creation).

import type { Plan, Subscription, UsageCounter, UsageMetric } from "@/lib/types";
import { store } from "@/lib/data/store";
import {
  getSubscriptionByTenant,
  getUsageByTenant,
  currentMonthPeriod,
} from "@/lib/data/subscriptions";

export interface LimitStatus {
  metric: UsageMetric;
  used: number;
  limit: number | null; // null = unlimited
  percent: number; // 0-100, or 0 when unlimited
  state: "ok" | "warning" | "at_limit" | "exceeded" | "unlimited";
  remaining: number | null;
}

const PERIOD_BY_METRIC: Record<UsageMetric, "lifetime" | "month"> = {
  users: "lifetime",
  equipment: "lifetime",
  clients: "lifetime",
  reports: "month",
  qr_tags: "month",
};

const LIMIT_KEY_BY_METRIC: Record<UsageMetric, keyof Plan["limits"]> = {
  users: "users",
  equipment: "equipment",
  clients: "clients",
  reports: "reportsPerMonth",
  qr_tags: "qrTagsPerMonth",
};

function periodFor(metric: UsageMetric): string {
  return PERIOD_BY_METRIC[metric] === "lifetime"
    ? "lifetime"
    : currentMonthPeriod();
}

export function computeLimitStatus(
  plan: Plan,
  usage: UsageCounter[],
  metric: UsageMetric,
): LimitStatus {
  const period = periodFor(metric);
  const counter = usage.find((u) => u.metric === metric && u.period === period);
  const used = counter?.value ?? 0;
  const limit = plan.limits[LIMIT_KEY_BY_METRIC[metric]];

  if (limit === null) {
    return {
      metric,
      used,
      limit: null,
      percent: 0,
      state: "unlimited",
      remaining: null,
    };
  }

  const percent = Math.min(100, Math.round((used / Math.max(limit, 1)) * 100));
  let state: LimitStatus["state"];
  if (used > limit) state = "exceeded";
  else if (used === limit) state = "at_limit";
  else if (percent >= 80) state = "warning";
  else state = "ok";

  return {
    metric,
    used,
    limit,
    percent,
    state,
    remaining: Math.max(0, limit - used),
  };
}

/** Check all metrics for a tenant. Returns array of statuses. */
export function getTenantLimitsSnapshot(tenantId: string): {
  plan: Plan | undefined;
  subscription: Subscription | undefined;
  statuses: LimitStatus[];
} {
  const subscription = getSubscriptionByTenant(tenantId);
  const plan = subscription
    ? store.plans.find((p) => p.id === subscription.planId)
    : undefined;
  const usage = getUsageByTenant(tenantId);

  const metrics: UsageMetric[] = [
    "users",
    "equipment",
    "clients",
    "reports",
    "qr_tags",
  ];

  const statuses = plan
    ? metrics.map((m) => computeLimitStatus(plan, usage, m))
    : [];

  return { plan, subscription, statuses };
}

/** Can the tenant create one more of `metric`? */
export function canCreate(
  tenantId: string,
  metric: UsageMetric,
): { allowed: boolean; reason?: string; status: LimitStatus | null } {
  const { plan, subscription, statuses } = getTenantLimitsSnapshot(tenantId);
  if (!plan || !subscription) {
    return { allowed: false, reason: "no_subscription", status: null };
  }
  if (subscription.isReadOnly) {
    return {
      allowed: false,
      reason: subscription.readOnlyReason ?? "read_only",
      status: null,
    };
  }
  const status = statuses.find((s) => s.metric === metric);
  if (!status) return { allowed: true, status: null };
  if (status.state === "unlimited") return { allowed: true, status };
  if (status.state === "exceeded" || status.state === "at_limit") {
    return { allowed: false, reason: "limit_reached", status };
  }
  return { allowed: true, status };
}

/** Used for showing nice labels next to metrics */
export const METRIC_LABEL: Record<UsageMetric, string> = {
  users: "Usuarios",
  equipment: "Equipos",
  clients: "Clientes",
  reports: "Reportes (mes)",
  qr_tags: "QR generados (mes)",
};
