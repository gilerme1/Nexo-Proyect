import Link from "next/link";
import { notFound } from "next/navigation";
import {
  Building2,
  ArrowLeft,
  CheckCircle2,
  Pause,
  Play,
} from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardBody } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { StatCard } from "@/components/domain/StatCard";
import { Tabs } from "@/components/ui/Tabs";
import { Avatar } from "@/components/ui/Avatar";
import { store } from "@/lib/data/store";
import { formatDate, formatRelative, formatNumber } from "@/lib/utils/format";
import { getTenantLimitsSnapshot, METRIC_LABEL } from "@/lib/billing/limits";
import { toggleTenantStatus, changeTenantPlan } from "@/lib/actions/tenants";
import { TenantPlanChanger } from "@/components/platform/TenantPlanChanger";
import { TenantVerticalsEditor } from "@/components/platform/TenantVerticalsEditor";

export default async function TenantDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const tenant = store.tenants.find((t) => t.id === id);
  if (!tenant) notFound();

  const sub = store.subscriptions.find((s) => s.tenantId === tenant.id);
  const plan = sub ? store.plans.find((p) => p.id === sub.planId) : undefined;
  const tenantVerticals = store.tenantVerticals
    .filter((tv) => tv.tenantId === tenant.id)
    .map((tv) => store.verticals.find((v) => v.id === tv.verticalId))
    .filter((v): v is NonNullable<typeof v> => Boolean(v));

  const clients = store.clients.filter((c) => c.tenantId === tenant.id);
  const equipment = store.equipment.filter((e) => e.tenantId === tenant.id);
  const reports = store.reports.filter((r) => r.tenantId === tenant.id);
  const users = store.memberships
    .filter((m) => m.tenantId === tenant.id)
    .map((m) => ({
      ...m,
      user: store.users.find((u) => u.id === m.userId),
    }))
    .filter((m) => m.user);

  const { statuses } = getTenantLimitsSnapshot(tenant.id);

  // Tabs
  const overviewTab = (
    <div className="space-y-6">
      {/* Plan + key metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          label="Plan"
          value={plan?.name ?? "—"}
          hint={
            sub?.status === "trialing"
              ? "Trial"
              : sub?.billingCycle === "yearly"
                ? "Anual"
                : "Mensual"
          }
          icon={CheckCircle2}
          tone={sub?.status === "trialing" ? "info" : "success"}
        />
        <StatCard label="Clientes" value={clients.length} />
        <StatCard label="Equipos" value={formatNumber(equipment.length)} />
        <StatCard label="Reportes mes" value={formatNumber(reports.length)} />
      </div>

      {/* Limits snapshot */}
      <Card>
        <div className="px-6 py-5 border-b border-[var(--border-subtle)]">
          <h3 className="text-sm font-semibold text-[var(--text-primary)]">
            Uso vs límites del plan
          </h3>
        </div>
        <CardBody className="space-y-4">
          {statuses.map((s) => {
            const isUnlimited = s.state === "unlimited";
            const danger = s.state === "exceeded" || s.state === "at_limit";
            const warn = s.state === "warning";
            const colorClass = danger
              ? "bg-[var(--danger-fg)]"
              : warn
                ? "bg-[var(--warning-fg)]"
                : "bg-[var(--accent-500)]";
            return (
              <div key={s.metric}>
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="text-[var(--text-secondary)]">
                    {METRIC_LABEL[s.metric]}
                  </span>
                  <span className="tabular text-[var(--text-primary)] font-medium">
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
                <div className="h-1.5 bg-[var(--bg-hover)] rounded-full overflow-hidden">
                  {!isUnlimited && (
                    <div
                      className={`h-full rounded-full ${colorClass}`}
                      style={{ width: `${s.percent}%` }}
                    />
                  )}
                  {isUnlimited && (
                    <div className="h-full w-full bg-gradient-to-r from-transparent via-[var(--accent-400)] to-transparent opacity-60" />
                  )}
                </div>
              </div>
            );
          })}
        </CardBody>
      </Card>

      {/* Subscription detail */}
      {sub && plan && (
        <Card>
          <div className="px-6 py-5 border-b border-[var(--border-subtle)] flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-[var(--text-primary)]">
                Suscripción
              </h3>
              <p className="text-2xs text-[var(--text-tertiary)] mt-0.5">
                Cambios manuales del Super Admin
              </p>
            </div>
          </div>
          <CardBody className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <p className="text-2xs text-[var(--text-tertiary)] mb-1">
                  Estado
                </p>
                <p className="text-[var(--text-primary)] capitalize font-medium">
                  {sub.status}
                </p>
              </div>
              <div>
                <p className="text-2xs text-[var(--text-tertiary)] mb-1">
                  Inicio del período
                </p>
                <p className="text-[var(--text-primary)] font-medium">
                  {formatDate(sub.currentPeriodStart)}
                </p>
              </div>
              <div>
                <p className="text-2xs text-[var(--text-tertiary)] mb-1">
                  Fin del período
                </p>
                <p className="text-[var(--text-primary)] font-medium">
                  {formatDate(sub.currentPeriodEnd)}
                </p>
              </div>
              <div>
                <p className="text-2xs text-[var(--text-tertiary)] mb-1">
                  Proveedor
                </p>
                <p className="text-[var(--text-primary)] font-medium">
                  {sub.externalProvider === "mercadopago"
                    ? "Mercado Pago"
                    : "Manual"}
                </p>
              </div>
            </div>
            <div className="pt-4 border-t border-[var(--border-subtle)]">
              <TenantPlanChanger
                tenantId={tenant.id}
                currentPlanId={plan.id}
                plans={store.plans}
                action={changeTenantPlan}
              />
            </div>
          </CardBody>
        </Card>
      )}
    </div>
  );

  const verticalsTab = (
    <TenantVerticalsEditor
      tenantId={tenant.id}
      assignedVerticalIds={tenantVerticals.map((v) => v.id)}
      allVerticals={store.verticals}
    />
  );

  const usersTab = (
    <Card>
      <div className="px-6 py-5 border-b border-[var(--border-subtle)]">
        <h3 className="text-sm font-semibold text-[var(--text-primary)]">
          Usuarios del tenant
        </h3>
        <p className="text-2xs text-[var(--text-tertiary)] mt-0.5">
          Miembros con acceso a este workspace
        </p>
      </div>
      <CardBody className="p-2">
        {users.length === 0 ? (
          <p className="px-4 py-8 text-center text-sm text-[var(--text-tertiary)]">
            Sin usuarios.
          </p>
        ) : (
          <ul className="space-y-1">
            {users.map((m) => (
              <li
                key={m.id}
                className="flex items-center justify-between gap-4 px-3 py-3 rounded-xl hover:bg-[var(--bg-hover)]"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <Avatar name={m.user!.name} size="md" />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-[var(--text-primary)]">
                      {m.user!.name}
                    </p>
                    <p className="truncate text-2xs text-[var(--text-tertiary)]">
                      {m.user!.email}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge tone="neutral">
                    {m.role === "tenant_admin"
                      ? "Admin"
                      : m.role === "technician"
                        ? "Técnico"
                        : m.role}
                  </Badge>
                  {m.active ? (
                    <Badge tone="success" dot>
                      Activo
                    </Badge>
                  ) : (
                    <Badge tone="neutral">Inactivo</Badge>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardBody>
    </Card>
  );

  const dataTab = (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
      <StatCard label="Clientes" value={clients.length} />
      <StatCard label="Equipos" value={equipment.length} />
      <StatCard label="Reportes" value={reports.length} />
    </div>
  );

  return (
    <div className="space-y-6">
      <Link
        href="/platform/tenants"
        className="inline-flex items-center gap-1.5 text-2xs text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]"
      >
        <ArrowLeft className="h-3 w-3" />
        Volver a tenants
      </Link>

      <PageHeader
        title={
          <span className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-2xl bg-[var(--info-bg)] text-[var(--info-fg)]">
              <Building2 className="h-5 w-5" />
            </span>
            <span className="flex items-center gap-2.5">
              {tenant.name}
              {tenant.status === "suspended" && (
                <Badge tone="danger">Suspendido</Badge>
              )}
            </span>
          </span>
        }
        description={
          <>
            <span className="font-mono text-2xs">{tenant.slug}</span>
            <span className="mx-2">·</span>
            Creado {formatRelative(tenant.createdAt)}
          </>
        }
        actions={
          <form action={toggleTenantStatus}>
            <input type="hidden" name="id" value={tenant.id} />
            <Button
              type="submit"
              variant="secondary"
              size="sm"
              pill
              leftIcon={
                tenant.status === "active" ? (
                  <Pause className="h-3.5 w-3.5" />
                ) : (
                  <Play className="h-3.5 w-3.5" />
                )
              }
            >
              {tenant.status === "active" ? "Suspender" : "Reactivar"}
            </Button>
          </form>
        }
      />

      <Tabs
        tabs={[
          { id: "overview", label: "Resumen", content: overviewTab },
          {
            id: "verticals",
            label: "Rubros",
            badge: tenantVerticals.length,
            content: verticalsTab,
          },
          {
            id: "users",
            label: "Usuarios",
            badge: users.length,
            content: usersTab,
          },
          { id: "data", label: "Datos", content: dataTab },
        ]}
      />
    </div>
  );
}
