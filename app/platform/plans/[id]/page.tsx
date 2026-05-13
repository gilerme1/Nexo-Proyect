import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Sparkles, Building2 } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardBody } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { store } from "@/lib/data/store";
import { PlanEditForm } from "@/components/platform/PlanEditForm";

export default async function PlanDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const plan = store.plans.find((p) => p.id === id);
  if (!plan) notFound();

  const tenantsOnPlan = store.subscriptions
    .filter((s) => s.planId === plan.id)
    .map((s) => store.tenants.find((t) => t.id === s.tenantId))
    .filter((t): t is NonNullable<typeof t> => Boolean(t));

  return (
    <div className="space-y-6">
      <Link
        href="/platform/plans"
        className="inline-flex items-center gap-1.5 text-2xs text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]"
      >
        <ArrowLeft className="h-3 w-3" />
        Volver a planes
      </Link>

      <PageHeader
        title={
          <span className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-2xl bg-[var(--info-bg)] text-[var(--info-fg)]">
              <Sparkles className="h-5 w-5" />
            </span>
            Plan {plan.name}
            <Badge tone={plan.isPublic ? "success" : "neutral"}>
              {plan.isPublic ? "Público" : "Privado"}
            </Badge>
          </span>
        }
        description={`${tenantsOnPlan.length} tenant${tenantsOnPlan.length === 1 ? "" : "s"} usando este plan actualmente.`}
      />

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <PlanEditForm plan={plan} />
        </div>

        <div className="space-y-6">
          <Card>
            <div className="px-6 py-5 border-b border-[var(--border-subtle)]">
              <h3 className="text-sm font-semibold text-[var(--text-primary)]">
                Tenants en este plan
              </h3>
              <p className="text-2xs text-[var(--text-tertiary)] mt-0.5">
                Cualquier cambio impacta a estos
              </p>
            </div>
            <CardBody className="p-2">
              {tenantsOnPlan.length === 0 ? (
                <p className="px-4 py-6 text-center text-sm text-[var(--text-tertiary)]">
                  Ningún tenant usa este plan aún.
                </p>
              ) : (
                <ul className="space-y-1">
                  {tenantsOnPlan.map((t) => (
                    <li key={t.id}>
                      <Link
                        href={`/platform/tenants/${t.id}`}
                        className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-[var(--bg-hover)]"
                      >
                        <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-[var(--info-bg)] text-[var(--info-fg)]">
                          <Building2 className="h-3.5 w-3.5" />
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium text-[var(--text-primary)]">
                            {t.name}
                          </p>
                          <p className="truncate text-2xs text-[var(--text-tertiary)] font-mono">
                            {t.slug}
                          </p>
                        </div>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
}
