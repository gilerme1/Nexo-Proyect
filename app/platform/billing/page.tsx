import Link from "next/link";
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  CalendarClock,
  AlertCircle,
  Building2,
} from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardBody } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { HeroStat, StatCard } from "@/components/domain/StatCard";
import { SparkArea } from "@/components/domain/SparkArea";
import { EmptyState } from "@/components/ui/EmptyState";
import { store } from "@/lib/data/store";
import { formatNumber, formatDate } from "@/lib/utils/format";

export default function PlatformBillingPage() {
  // MRR calculation
  const mrr = store.subscriptions.reduce((acc, sub) => {
    if (sub.status !== "active" && sub.status !== "trialing") return acc;
    const plan = store.plans.find((p) => p.id === sub.planId);
    if (!plan) return acc;
    if (sub.billingCycle === "yearly") return acc + plan.yearlyPriceUsd / 12;
    return acc + plan.monthlyPriceUsd;
  }, 0);

  const arr = mrr * 12;

  // Counts
  const activeSubs = store.subscriptions.filter(
    (s) => s.status === "active",
  ).length;
  const trialSubs = store.subscriptions.filter(
    (s) => s.status === "trialing",
  ).length;
  const pastDueSubs = store.subscriptions.filter(
    (s) => s.status === "past_due",
  ).length;
  const canceledSubs = store.subscriptions.filter(
    (s) => s.status === "canceled",
  ).length;
  const totalSubs = store.subscriptions.length;

  // Churn (simulated): canceled / total in last 90 days
  const churnRate =
    totalSubs > 0 ? Math.round((canceledSubs / totalSubs) * 100) : 0;

  // MRR trend (simulated)
  const mrrTrend = [85, 92, 88, 105, 112, 118, 132, 128, 142, 156, 165, 178];

  // Upcoming renewals (next 14 days)
  const now = new Date("2026-04-26");
  const fortnightFromNow = new Date(now);
  fortnightFromNow.setDate(now.getDate() + 14);

  const upcomingRenewals = store.subscriptions
    .filter((s) => {
      const end = new Date(s.currentPeriodEnd);
      return (
        end >= now &&
        end <= fortnightFromNow &&
        (s.status === "active" || s.status === "trialing")
      );
    })
    .sort(
      (a, b) =>
        new Date(a.currentPeriodEnd).getTime() -
        new Date(b.currentPeriodEnd).getTime(),
    );

  const failedPayments = store.subscriptions.filter(
    (s) => s.status === "past_due",
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Facturación global"
        description="Métricas de ingresos, suscripciones y salud financiera de la plataforma."
      />

      {/* Hero stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <HeroStat
          label="Ingreso mensual (MRR)"
          caption="Recurring revenue"
          value={`$${formatNumber(Math.round(mrr))}`}
          unit="USD"
          icon={DollarSign}
          iconColor="info"
        >
          <SparkArea
            data={mrrTrend}
            color="accent"
            height={80}
            highlightIndex={mrrTrend.length - 1}
          />
        </HeroStat>

        <HeroStat
          label="Anualizado (ARR)"
          caption="Proyección a 12 meses"
          value={`$${formatNumber(Math.round(arr))}`}
          unit="USD"
          icon={TrendingUp}
          iconColor="success"
        />

        <HeroStat
          label="Churn rate"
          caption="Tenants cancelados últimos 90 días"
          value={`${churnRate}%`}
          icon={TrendingDown}
          iconColor={churnRate > 5 ? "danger" : "success"}
        />
      </div>

      {/* Subscription status breakdown */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Activas" value={activeSubs} tone="success" />
        <StatCard label="En trial" value={trialSubs} tone="info" />
        <StatCard
          label="Pago pendiente"
          value={pastDueSubs}
          tone={pastDueSubs > 0 ? "danger" : "default"}
        />
        <StatCard label="Canceladas" value={canceledSubs} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming renewals */}
        <Card>
          <div className="px-6 py-5 border-b border-[var(--border-subtle)] flex items-center gap-2">
            <CalendarClock className="h-4 w-4 text-[var(--text-tertiary)]" />
            <h3 className="text-sm font-semibold text-[var(--text-primary)]">
              Próximas renovaciones (14 días)
            </h3>
          </div>
          <CardBody className="p-2">
            {upcomingRenewals.length === 0 ? (
              <EmptyState
                title="Sin renovaciones próximas"
                description="No hay suscripciones que venzan en los próximos 14 días."
              />
            ) : (
              <ul className="space-y-1">
                {upcomingRenewals.map((sub) => {
                  const tenant = store.tenants.find(
                    (t) => t.id === sub.tenantId,
                  );
                  const plan = store.plans.find((p) => p.id === sub.planId);
                  if (!tenant || !plan) return null;
                  const amount =
                    sub.billingCycle === "yearly"
                      ? plan.yearlyPriceUsd
                      : plan.monthlyPriceUsd;

                  return (
                    <li key={sub.id}>
                      <Link
                        href={`/platform/tenants/${tenant.id}`}
                        className="flex items-center justify-between gap-3 px-3 py-3 rounded-xl hover:bg-[var(--bg-hover)]"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[var(--info-bg)] text-[var(--info-fg)]">
                            <Building2 className="h-3.5 w-3.5" />
                          </span>
                          <div className="min-w-0">
                            <p className="truncate text-sm font-medium text-[var(--text-primary)]">
                              {tenant.name}
                            </p>
                            <p className="truncate text-2xs text-[var(--text-tertiary)]">
                              Plan {plan.name} ·{" "}
                              {sub.billingCycle === "yearly"
                                ? "anual"
                                : "mensual"}
                            </p>
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-sm font-semibold text-[var(--text-primary)] tabular">
                            ${formatNumber(amount)}
                          </p>
                          <p className="text-2xs text-[var(--text-tertiary)]">
                            {formatDate(sub.currentPeriodEnd)}
                          </p>
                        </div>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            )}
          </CardBody>
        </Card>

        {/* Failed payments */}
        <Card>
          <div className="px-6 py-5 border-b border-[var(--border-subtle)] flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-[var(--danger-fg)]" />
            <h3 className="text-sm font-semibold text-[var(--text-primary)]">
              Pagos fallidos
            </h3>
          </div>
          <CardBody className="p-2">
            {failedPayments.length === 0 ? (
              <EmptyState
                title="Todo al día"
                description="No hay pagos fallidos. Bien jugado."
              />
            ) : (
              <ul className="space-y-1">
                {failedPayments.map((sub) => {
                  const tenant = store.tenants.find(
                    (t) => t.id === sub.tenantId,
                  );
                  if (!tenant) return null;
                  return (
                    <li key={sub.id}>
                      <Link
                        href={`/platform/tenants/${tenant.id}`}
                        className="flex items-center justify-between gap-3 px-3 py-3 rounded-xl hover:bg-[var(--bg-hover)]"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[var(--danger-bg)] text-[var(--danger-fg)]">
                            <Building2 className="h-3.5 w-3.5" />
                          </span>
                          <div className="min-w-0">
                            <p className="truncate text-sm font-medium text-[var(--text-primary)]">
                              {tenant.name}
                            </p>
                            <p className="truncate text-2xs text-[var(--text-tertiary)]">
                              Pago pendiente desde {formatDate(sub.updatedAt)}
                            </p>
                          </div>
                        </div>
                        <Badge tone="danger">Past due</Badge>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            )}
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
