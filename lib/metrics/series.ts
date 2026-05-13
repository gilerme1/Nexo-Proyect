// ============================================================================
// Real metrics calculator
// ============================================================================
// Computes time series from actual store data (createdAt timestamps),
// not hardcoded numbers. Used in dashboards.

import type { Equipment, MaintenanceReport, Subscription, Plan, ISODate } from "@/lib/types";

/**
 * Returns the last N months as ISO strings YYYY-MM, oldest first.
 * Anchored to the demo "current date" so seeds line up.
 */
export function lastNMonths(n: number, anchor: Date = new Date("2026-04-30")): { key: string; label: string }[] {
  const months: { key: string; label: string }[] = [];
  const labels = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
  const cur = new Date(anchor.getFullYear(), anchor.getMonth(), 1);
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(cur);
    d.setMonth(cur.getMonth() - i);
    const y = d.getFullYear();
    const m = d.getMonth();
    months.push({
      key: `${y}-${String(m + 1).padStart(2, "0")}`,
      label: labels[m],
    });
  }
  return months;
}

function monthKey(iso: ISODate): string {
  const d = new Date(iso);
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
}

function dayKey(iso: ISODate): string {
  return new Date(iso).toISOString().slice(0, 10);
}

/**
 * Cumulative count of equipment per month (creates → growing line).
 * Returns an array of numbers parallel to lastNMonths(n).
 */
export function equipmentCumulativeByMonth(
  equipment: Equipment[],
  months: { key: string; label: string }[],
): number[] {
  return months.map((m) => {
    const lastDay = endOfMonth(m.key);
    return equipment.filter((e) => new Date(e.createdAt) <= lastDay).length;
  });
}

/**
 * Reports created per month (count, not cumulative).
 */
export function reportsByMonth(
  reports: MaintenanceReport[],
  months: { key: string; label: string }[],
): number[] {
  const grouped = new Map<string, number>();
  for (const r of reports) {
    const k = monthKey(r.createdAt);
    grouped.set(k, (grouped.get(k) ?? 0) + 1);
  }
  return months.map((m) => grouped.get(m.key) ?? 0);
}

/**
 * Reports per day for the last 7 days.
 */
export function reportsByDay(
  reports: MaintenanceReport[],
  anchor: Date = new Date("2026-04-30"),
): { labels: string[]; values: number[] } {
  const dayLabels = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];
  const labels: string[] = [];
  const values: number[] = [];

  // Find the most recent Monday (or today if Mon)
  const start = new Date(anchor);
  // JS: 0=Sunday, 1=Monday … shift so Monday=0
  const dow = (start.getDay() + 6) % 7;
  start.setDate(start.getDate() - dow);
  start.setHours(0, 0, 0, 0);

  const grouped = new Map<string, number>();
  for (const r of reports) {
    grouped.set(dayKey(r.date), (grouped.get(dayKey(r.date)) ?? 0) + 1);
  }

  for (let i = 0; i < 7; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    const key = d.toISOString().slice(0, 10);
    labels.push(dayLabels[i]);
    values.push(grouped.get(key) ?? 0);
  }
  return { labels, values };
}

/**
 * MRR over the last N months.
 * For each month: sum monthly-equivalent revenue from subs that were
 * active or trialing at that month's end.
 */
export function mrrByMonth(
  subscriptions: Subscription[],
  plans: Plan[],
  months: { key: string; label: string }[],
): number[] {
  return months.map((m) => {
    const monthEnd = endOfMonth(m.key);
    let total = 0;
    for (const sub of subscriptions) {
      const start = new Date(sub.createdAt);
      const periodEnd = new Date(sub.currentPeriodEnd);
      // Was the sub active at month end?
      if (start > monthEnd) continue;
      if (sub.status === "canceled" && periodEnd < monthEnd) continue;
      const plan = plans.find((p) => p.id === sub.planId);
      if (!plan) continue;
      const monthly =
        sub.billingCycle === "yearly" ? plan.yearlyPriceUsd / 12 : plan.monthlyPriceUsd;
      total += monthly;
    }
    return Math.round(total);
  });
}

/**
 * Tenants count over time (cumulative).
 */
export function tenantsCumulative(
  tenants: { createdAt: ISODate }[],
  months: { key: string; label: string }[],
): number[] {
  return months.map((m) => {
    const lastDay = endOfMonth(m.key);
    return tenants.filter((t) => new Date(t.createdAt) <= lastDay).length;
  });
}

function endOfMonth(monthKey: string): Date {
  const [y, m] = monthKey.split("-").map(Number);
  return new Date(Date.UTC(y, m, 0, 23, 59, 59));
}
