"use client";

import { useState } from "react";
import { Check, Zap, Building2, Rocket, Star } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardBody } from "@/components/ui/Card";
import { cn } from "@/lib/utils/cn";
import type { Plan, Subscription, UsageCounter } from "@/lib/types";

interface Props {
  currentPlan: Plan;
  subscription: Subscription;
  allPlans: Plan[];
  usage: UsageCounter[];
}

const PLAN_ICONS: Record<string, React.ElementType> = {
  starter:    Zap,
  pro:        Rocket,
  business:   Building2,
  enterprise: Star,
};

const STATUS_CONFIG: Record<string, { label: string; tone: "success" | "warning" | "neutral" | "info" }> = {
  active:    { label: "Activo",       tone: "success" },
  trialing:  { label: "Trial",        tone: "info" },
  past_due:  { label: "Pago vencido", tone: "warning" },
  canceled:  { label: "Cancelado",    tone: "neutral" },
  suspended: { label: "Suspendido",   tone: "warning" },
};

const METRIC_LABELS: Record<string, string> = {
  users:     "Usuarios",
  equipment: "Equipos",
  clients:   "Clientes",
  reports:   "Reportes / mes",
  qr_tags:   "QR tags / mes",
};

function UsageBar({ label, used, limit }: { label: string; used: number; limit: number | null }) {
  const pct = limit === null ? 0 : Math.min(100, Math.round((used / limit) * 100));
  const isHigh = pct >= 80;
  const isFull = pct >= 100;

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-sm">
        <span className="text-[var(--text-secondary)]">{label}</span>
        <span className={cn("font-medium tabular-nums", isFull ? "text-[var(--danger-fg)]" : isHigh ? "text-[var(--warning-fg)]" : "text-[var(--text-primary)]")}>
          {used}{limit !== null ? ` / ${limit}` : " (ilimitado)"}
        </span>
      </div>
      {limit !== null && (
        <div className="h-1.5 rounded-full bg-[var(--bg-hover)] overflow-hidden">
          <div
            className={cn(
              "h-full rounded-full transition-all",
              isFull  ? "bg-[var(--danger-fg)]"  :
              isHigh  ? "bg-[var(--warning-fg)]" :
                        "bg-[var(--accent-500)]",
            )}
            style={{ width: `${pct}%` }}
          />
        </div>
      )}
    </div>
  );
}

export function BillingClient({ currentPlan, subscription, allPlans, usage }: Props) {
  const [cycle, setCycle] = useState<"monthly" | "yearly">(subscription.billingCycle);

  const statusCfg = STATUS_CONFIG[subscription.status] ?? STATUS_CONFIG.active;
  const PlanIcon = PLAN_ICONS[currentPlan.slug] ?? Zap;

  const periodEnd = new Date(subscription.currentPeriodEnd);
  const periodLabel = periodEnd.toLocaleDateString("es-UY", {
    day: "numeric", month: "long", year: "numeric",
  });

  const publicPlans = allPlans.filter((p) => p.isPublic).sort((a, b) => a.sortOrder - b.sortOrder);

  const USAGE_METRICS: { metric: string; limit: number | null }[] = [
    { metric: "users",     limit: currentPlan.limits.users },
    { metric: "equipment", limit: currentPlan.limits.equipment },
    { metric: "clients",   limit: currentPlan.limits.clients },
    { metric: "reports",   limit: currentPlan.limits.reportsPerMonth },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-xl font-semibold text-[var(--text-primary)]">Plan y facturación</h1>
        <p className="text-sm text-[var(--text-tertiary)] mt-0.5">Tu suscripción actual y uso de recursos.</p>
      </div>

      {/* Current plan */}
      <Card>
        <CardBody className="p-5">
          <div className="flex items-start gap-4">
            <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-[var(--accent-500)]/10 text-[var(--accent-500)]">
              <PlanIcon className="h-6 w-6" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-lg font-semibold text-[var(--text-primary)]">Plan {currentPlan.name}</h2>
                <Badge tone={statusCfg.tone}>{statusCfg.label}</Badge>
              </div>
              <p className="text-sm text-[var(--text-tertiary)] mt-0.5">
                {subscription.billingCycle === "yearly" ? "Facturación anual" : "Facturación mensual"}
                {" · "}
                {subscription.status === "trialing"
                  ? `Trial hasta ${periodLabel}`
                  : `Próxima renovación: ${periodLabel}`}
              </p>
            </div>
            <div className="text-right shrink-0">
              <p className="text-2xl font-bold text-[var(--text-primary)]">
                {currentPlan.monthlyPriceUsd === 0
                  ? "Custom"
                  : `$${subscription.billingCycle === "yearly"
                      ? Math.round(currentPlan.yearlyPriceUsd / 12)
                      : currentPlan.monthlyPriceUsd}`}
              </p>
              {currentPlan.monthlyPriceUsd > 0 && (
                <p className="text-xs text-[var(--text-tertiary)]">USD/mes</p>
              )}
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Usage */}
      <div>
        <h3 className="text-sm font-semibold text-[var(--text-secondary)] uppercase tracking-wide mb-4">
          Uso actual
        </h3>
        <Card>
          <CardBody className="p-5 space-y-5">
            {USAGE_METRICS.map(({ metric, limit }) => {
              const counter = usage.find((u) => u.metric === metric);
              const used = counter?.value ?? 0;
              return (
                <UsageBar
                  key={metric}
                  label={METRIC_LABELS[metric] ?? metric}
                  used={used}
                  limit={limit}
                />
              );
            })}
          </CardBody>
        </Card>
      </div>

      {/* Plans comparison */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-[var(--text-secondary)] uppercase tracking-wide">
            Planes disponibles
          </h3>
          <div className="flex items-center gap-1 bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-full p-0.5">
            {(["monthly", "yearly"] as const).map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setCycle(c)}
                className={cn(
                  "px-3 h-7 rounded-full text-xs font-medium transition-colors",
                  cycle === c
                    ? "bg-[var(--bg-hover)] text-[var(--text-primary)]"
                    : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]",
                )}
              >
                {c === "monthly" ? "Mensual" : "Anual −17%"}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {publicPlans.map((plan) => {
            const isCurrent = plan.id === currentPlan.id;
            const PlanIco = PLAN_ICONS[plan.slug] ?? Zap;
            const price = cycle === "yearly"
              ? Math.round(plan.yearlyPriceUsd / 12)
              : plan.monthlyPriceUsd;

            return (
              <div
                key={plan.id}
                className={cn(
                  "relative rounded-2xl border p-4 flex flex-col gap-4",
                  isCurrent
                    ? "border-[var(--accent-500)] bg-[var(--accent-500)]/5"
                    : "border-[var(--border-subtle)] bg-[var(--bg-card)]",
                )}
              >
                {isCurrent && (
                  <span className="absolute top-3 right-3 text-[10px] font-bold uppercase tracking-wider text-[var(--accent-500)]">
                    Actual
                  </span>
                )}
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <PlanIco className="h-4 w-4 text-[var(--accent-500)]" />
                    <span className="text-sm font-semibold text-[var(--text-primary)]">{plan.name}</span>
                  </div>
                  <p className="text-2xl font-bold text-[var(--text-primary)]">
                    ${price}
                    <span className="text-sm font-normal text-[var(--text-tertiary)]">/mes</span>
                  </p>
                  {cycle === "yearly" && (
                    <p className="text-xs text-[var(--success-fg)]">Facturado ${plan.yearlyPriceUsd}/año</p>
                  )}
                </div>

                <ul className="space-y-1.5 flex-1">
                  {[
                    { label: `${plan.limits.users ?? "∞"} usuarios` },
                    { label: `${plan.limits.equipment ?? "∞"} equipos` },
                    { label: `${plan.limits.clients ?? "∞"} clientes` },
                    { label: `${plan.limits.reportsPerMonth ?? "∞"} reportes/mes` },
                    ...(plan.features.formBuilder ? [{ label: "Form builder" }] : []),
                    ...(plan.features.advancedAnalytics ? [{ label: "Analytics avanzado" }] : []),
                    ...(plan.features.prioritySupport ? [{ label: "Soporte prioritario" }] : []),
                  ].map((f) => (
                    <li key={f.label} className="flex items-center gap-2 text-xs text-[var(--text-secondary)]">
                      <Check className="h-3 w-3 text-[var(--accent-500)] shrink-0" />
                      {f.label}
                    </li>
                  ))}
                </ul>

                <Button
                  size="sm"
                  pill
                  variant={isCurrent ? "secondary" : "primary"}
                  disabled={isCurrent}
                  className="w-full"
                >
                  {isCurrent ? "Plan actual" : plan.sortOrder > currentPlan.sortOrder ? "Mejorar plan" : "Cambiar"}
                </Button>
              </div>
            );
          })}
        </div>
        <p className="text-xs text-[var(--text-tertiary)] text-center mt-3">
          Para cambiar de plan contactá a soporte. Próximamente disponible desde el portal.
        </p>
      </div>
    </div>
  );
}
