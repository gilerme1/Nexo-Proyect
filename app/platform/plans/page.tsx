import Link from "next/link";
import { Sparkles, Check, X, ChevronRight } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardBody } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { store } from "@/lib/data/store";

const FEATURE_LABELS: Record<string, string> = {
  formBuilder: "Form Builder",
  apiAccess: "API",
  customDomain: "Dominio propio",
  prioritySupport: "Soporte prioritario",
  qrPrintBatches: "Lotes de QR",
  advancedAnalytics: "Analytics avanzado",
};

export default function PlansListPage() {
  const plans = [...store.plans].sort((a, b) => a.sortOrder - b.sortOrder);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Planes"
        description="Editá precios, límites y features de cada plan. Cuando se conecte Mercado Pago, estos cambios se sincronizan."
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {plans.map((plan) => {
          const subsCount = store.subscriptions.filter(
            (s) => s.planId === plan.id,
          ).length;
          return (
            <Link key={plan.id} href={`/platform/plans/${plan.id}`}>
              <Card
                interactive
                className="h-full hover:border-[var(--border-default)]"
              >
                <CardBody className="space-y-4">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-base font-semibold text-[var(--text-primary)]">
                        {plan.name}
                      </p>
                      <p className="text-2xs text-[var(--text-tertiary)] font-mono">
                        {plan.slug}
                      </p>
                    </div>
                    {plan.isPublic ? (
                      <Badge tone="success" dot>
                        Público
                      </Badge>
                    ) : (
                      <Badge tone="neutral">Privado</Badge>
                    )}
                  </div>

                  <div className="tabular">
                    <span className="text-3xl font-semibold text-[var(--text-primary)]">
                      ${plan.monthlyPriceUsd}
                    </span>
                    <span className="text-sm text-[var(--text-tertiary)] ml-1">
                      / mes
                    </span>
                  </div>

                  <div className="space-y-1 text-2xs text-[var(--text-secondary)]">
                    <p>
                      <span className="tabular">
                        {plan.limits.users === null
                          ? "∞"
                          : plan.limits.users}
                      </span>{" "}
                      usuarios
                    </p>
                    <p>
                      <span className="tabular">
                        {plan.limits.equipment === null
                          ? "∞"
                          : plan.limits.equipment}
                      </span>{" "}
                      equipos
                    </p>
                    <p>
                      <span className="tabular">
                        {plan.limits.clients === null
                          ? "∞"
                          : plan.limits.clients}
                      </span>{" "}
                      clientes
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-[var(--border-subtle)] text-2xs">
                    <span className="text-[var(--text-tertiary)] tabular">
                      {subsCount} tenant{subsCount === 1 ? "" : "s"}
                    </span>
                    <span className="flex items-center gap-1 text-[var(--accent-400)]">
                      Editar
                      <ChevronRight className="h-3 w-3" />
                    </span>
                  </div>
                </CardBody>
              </Card>
            </Link>
          );
        })}
      </div>

      <Card>
        <div className="px-6 py-5 border-b border-[var(--border-subtle)]">
          <h3 className="text-sm font-semibold text-[var(--text-primary)]">
            Comparativa de features
          </h3>
        </div>
        <CardBody className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--border-subtle)]">
                  <th className="text-left px-6 py-3 text-2xs font-semibold text-[var(--text-tertiary)] uppercase tracking-wider">
                    Feature
                  </th>
                  {plans.map((p) => (
                    <th
                      key={p.id}
                      className="text-center px-6 py-3 text-2xs font-semibold text-[var(--text-tertiary)] uppercase tracking-wider"
                    >
                      {p.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {Object.keys(FEATURE_LABELS).map((featKey) => (
                  <tr
                    key={featKey}
                    className="border-b border-[var(--border-subtle)] last:border-0"
                  >
                    <td className="px-6 py-3 text-[var(--text-secondary)]">
                      {FEATURE_LABELS[featKey]}
                    </td>
                    {plans.map((p) => {
                      const enabled = (
                        p.features as unknown as Record<string, boolean>
                      )[featKey];
                      return (
                        <td key={p.id} className="px-6 py-3 text-center">
                          {enabled ? (
                            <Check className="h-4 w-4 text-[var(--success-fg)] inline" />
                          ) : (
                            <X className="h-4 w-4 text-[var(--text-tertiary)] inline" />
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
