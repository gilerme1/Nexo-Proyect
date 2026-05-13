import Link from "next/link";
import { Sparkles, AlertTriangle, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { formatNumber } from "@/lib/utils/format";
import { METRIC_LABEL, type LimitStatus } from "@/lib/billing/limits";
import type { Plan, Subscription } from "@/lib/types";

interface Props {
  plan: Plan;
  subscription: Subscription;
  statuses: LimitStatus[];
  variant?: "compact" | "full";
}

const stateColors: Record<
  LimitStatus["state"],
  { bar: string; text: string; bg: string }
> = {
  ok: {
    bar: "bg-[var(--text-tertiary)]",
    text: "text-[var(--text-secondary)]",
    bg: "bg-[var(--bg-hover)]",
  },
  warning: {
    bar: "bg-[var(--warning-fg)]",
    text: "text-[var(--warning-fg)]",
    bg: "bg-[var(--warning-bg)]",
  },
  at_limit: {
    bar: "bg-[var(--danger-fg)]",
    text: "text-[var(--danger-fg)]",
    bg: "bg-[var(--danger-bg)]",
  },
  exceeded: {
    bar: "bg-[var(--danger-fg)]",
    text: "text-[var(--danger-fg)]",
    bg: "bg-[var(--danger-bg)]",
  },
  unlimited: {
    bar: "bg-[var(--accent-400)]",
    text: "text-[var(--accent-400)]",
    bg: "bg-[var(--info-bg)]",
  },
};

export function PlanUsageWidget({
  plan,
  subscription,
  statuses,
  variant = "compact",
}: Props) {
  const isCompact = variant === "compact";
  const visibleStatuses = isCompact
    ? statuses.filter((s) => s.metric !== "qr_tags").slice(0, 4)
    : statuses;

  const renewLabel =
    subscription.status === "trialing"
      ? "Trial termina"
      : subscription.cancelAtPeriodEnd
        ? "Termina"
        : "Renueva";
  const renewDate = new Date(subscription.currentPeriodEnd).toLocaleDateString(
    "es",
    { day: "numeric", month: "short" },
  );

  const hasWarning = statuses.some(
    (s) => s.state === "exceeded" || s.state === "at_limit",
  );

  return (
    <Card className="overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 border-b border-[var(--border-subtle)] flex items-center justify-between">
        <div className="flex items-center gap-2.5 min-w-0">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[var(--accent-500)] text-white">
            <Sparkles className="h-4 w-4" />
          </span>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-[var(--text-primary)] truncate">
              Plan {plan.name}
            </p>
            <p className="text-2xs text-[var(--text-tertiary)] truncate">
              {renewLabel} el {renewDate}
            </p>
          </div>
        </div>
        {subscription.status === "trialing" && (
          <Badge tone="info">Trial</Badge>
        )}
      </div>

      <div className="p-5 space-y-4">
        {visibleStatuses.map((s) => {
          const colors = stateColors[s.state];
          const isUnlimited = s.state === "unlimited";
          return (
            <div key={s.metric}>
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="text-[var(--text-secondary)]">
                  {METRIC_LABEL[s.metric]}
                </span>
                <span className={cn("tabular font-semibold", colors.text)}>
                  {formatNumber(s.used)}
                  {!isUnlimited && (
                    <span className="text-[var(--text-tertiary)] font-normal">
                      {" / "}
                      {formatNumber(s.limit ?? 0)}
                    </span>
                  )}
                  {isUnlimited && (
                    <span className="text-[var(--text-tertiary)] font-normal ml-1">
                      / ∞
                    </span>
                  )}
                </span>
              </div>
              {!isUnlimited && (
                <div
                  className={cn(
                    "h-1.5 rounded-full overflow-hidden",
                    colors.bg,
                  )}
                >
                  <div
                    className={cn("h-full rounded-full", colors.bar)}
                    style={{ width: `${s.percent}%` }}
                  />
                </div>
              )}
              {isUnlimited && (
                <div className="h-1.5 rounded-full overflow-hidden bg-[var(--info-bg)]">
                  <div className="h-full w-full bg-gradient-to-r from-transparent via-[var(--accent-400)] to-transparent opacity-60" />
                </div>
              )}
            </div>
          );
        })}

        {hasWarning && (
          <div className="rounded-xl bg-[var(--danger-bg)] border border-[var(--danger-border)] px-3.5 py-2.5 flex items-start gap-2">
            <AlertTriangle className="h-3.5 w-3.5 text-[var(--danger-fg)] shrink-0 mt-0.5" />
            <p className="text-2xs text-[var(--danger-fg)] leading-relaxed">
              Llegaste al límite en algún recurso. Subí de plan para seguir
              creando.
            </p>
          </div>
        )}

        <Link
          href="/app/billing"
          className="flex items-center justify-between gap-2 pt-2 group"
        >
          <span className="text-2xs font-medium text-[var(--text-secondary)] group-hover:text-[var(--text-primary)]">
            Administrar plan
          </span>
          <ChevronRight className="h-3.5 w-3.5 text-[var(--text-tertiary)] group-hover:text-[var(--text-primary)]" />
        </Link>
      </div>
    </Card>
  );
}
