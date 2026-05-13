import Link from "next/link";
import { Building2, Plus, ArrowUpRight } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardBody } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { store } from "@/lib/data/store";
import { formatRelative, formatDate } from "@/lib/utils/format";

export default function TenantsListPage() {
  const tenants = [...store.tenants].sort(
    (a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Tenants"
        description="Empresas que usan la plataforma. Cada tenant tiene su propio workspace."
        actions={
          <Link href="/platform/tenants/new">
            <Button size="sm" pill leftIcon={<Plus className="h-3.5 w-3.5" />}>
              Nuevo tenant
            </Button>
          </Link>
        }
      />

      {tenants.length === 0 ? (
        <Card>
          <EmptyState
            icon={Building2}
            title="Sin tenants"
            description="Aún no hay empresas registradas en la plataforma."
            action={
              <Link href="/platform/tenants/new">
                <Button
                  size="sm"
                  pill
                  leftIcon={<Plus className="h-3.5 w-3.5" />}
                >
                  Crear el primero
                </Button>
              </Link>
            }
          />
        </Card>
      ) : (
        <Card>
          <CardBody className="p-2">
            <ul className="space-y-1">
              {tenants.map((tenant) => {
                const sub = store.subscriptions.find(
                  (s) => s.tenantId === tenant.id,
                );
                const plan = sub
                  ? store.plans.find((p) => p.id === sub.planId)
                  : null;
                const lastReport = [...store.reports]
                  .filter((r) => r.tenantId === tenant.id)
                  .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];
                const verticals = store.tenantVerticals
                  .filter((tv) => tv.tenantId === tenant.id)
                  .map((tv) =>
                    store.verticals.find((v) => v.id === tv.verticalId),
                  )
                  .filter((v): v is NonNullable<typeof v> => Boolean(v));
                const clientCount = store.clients.filter(
                  (c) => c.tenantId === tenant.id,
                ).length;
                const equipmentCount = store.equipment.filter(
                  (e) => e.tenantId === tenant.id,
                ).length;

                return (
                  <li key={tenant.id}>
                    <Link
                      href={`/platform/tenants/${tenant.id}`}
                      className="flex items-center justify-between gap-4 px-3 py-3.5 rounded-xl hover:bg-[var(--bg-hover)]"
                    >
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[var(--info-bg)] text-[var(--info-fg)]">
                          <Building2 className="h-4 w-4" />
                        </span>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 min-w-0">
                            <p className="truncate text-sm font-medium text-[var(--text-primary)]">
                              {tenant.name}
                            </p>
                            {tenant.status === "suspended" && (
                              <Badge tone="danger" size="sm">
                                Suspendido
                              </Badge>
                            )}
                          </div>
                          <p className="truncate text-2xs text-[var(--text-tertiary)]">
                            {tenant.slug} · creado{" "}
                            {formatRelative(tenant.createdAt)}
                          </p>
                        </div>
                      </div>

                      <div className="hidden md:flex items-center gap-1.5 max-w-[260px] overflow-hidden">
                        {verticals.slice(0, 2).map((v) => (
                          <Badge key={v.id} size="sm">
                            {v.name}
                          </Badge>
                        ))}
                        {verticals.length > 2 && (
                          <Badge size="sm">+{verticals.length - 2}</Badge>
                        )}
                      </div>

                      <div className="hidden lg:flex items-center gap-6 shrink-0 tabular text-xs text-[var(--text-tertiary)]">
                        <div className="text-right">
                          <p className="text-[var(--text-primary)] font-medium">{clientCount}</p>
                          <p className="text-2xs">clientes</p>
                        </div>
                        <div className="text-right">
                          <p className="text-[var(--text-primary)] font-medium">{equipmentCount}</p>
                          <p className="text-2xs">equipos</p>
                        </div>
                        <div className="text-right">
                          <p className="text-[var(--text-primary)] font-medium">
                            {lastReport ? formatRelative(lastReport.date) : "—"}
                          </p>
                          <p className="text-2xs">último reporte</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {plan && <Badge tone="neutral">{plan.name}</Badge>}
                        {sub?.status === "past_due" && (
                          <Badge tone="danger">Pago vencido</Badge>
                        )}
                        {sub?.status === "trialing" && (
                          <Badge tone="info">Trial</Badge>
                        )}
                        {sub?.status === "active" && (
                          <Badge tone="success" dot>Activo</Badge>
                        )}
                        {sub?.status === "canceled" && (
                          <Badge tone="neutral">Cancelado</Badge>
                        )}
                        <ArrowUpRight className="h-3.5 w-3.5 text-[var(--text-tertiary)]" />
                      </div>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </CardBody>
        </Card>
      )}
    </div>
  );
}
