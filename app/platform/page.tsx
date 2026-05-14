import Link from "next/link";
import {
  Building2,
  Layers,
  TrendingUp,
  DollarSign,
  ArrowUpRight,
  ChevronRight,
  CheckCircle2,
  Activity,
} from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { HeroStat, StatCard } from "@/components/domain/StatCard";
import { SparkArea, SparkBars } from "@/components/domain/SparkArea";
import { Card, CardBody } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { LocationMap } from "@/components/widgets/LocationMap";
import { store } from "@/lib/data/store";
import { formatNumber } from "@/lib/utils/format";
import {
  lastNMonths,
  equipmentCumulativeByMonth,
  reportsByMonth,
  mrrByMonth,
} from "@/lib/metrics/series";

export default function PlatformDashboardPage() {
  const totalTenants = store.tenants.length;
  const activeTenants = store.tenants.filter((t) => t.status === "active").length;
  const totalEquipment = store.equipment.length;
  const clientsById = new Map(store.clients.map((client) => [client.id, client]));
  const tenantsById = new Map(store.tenants.map((tenant) => [tenant.id, tenant]));

  // Real time series
  const months = lastNMonths(12);
  const mrrTrend = mrrByMonth(store.subscriptions, store.plans, months);
  const equipmentTrend = equipmentCumulativeByMonth(store.equipment, months);
  const reportsTrend = reportsByMonth(store.reports, months);

  const currentMrr = mrrTrend[mrrTrend.length - 1] ?? 0;
  const currentMonthReports = reportsTrend[reportsTrend.length - 1] ?? 0;

  const tenantsByPlan = store.plans.map((plan) => ({
    plan,
    count: store.subscriptions.filter((s) => s.planId === plan.id).length,
  }));

  // 10 visually distinct colors for tenant map markers
  const TENANT_PALETTE = [
    "#3b6cff", // azul
    "#22c55e", // verde
    "#f97316", // naranja
    "#a855f7", // violeta
    "#ef4444", // rojo
    "#14b8a6", // teal
    "#eab308", // amarillo
    "#ec4899", // rosa
    "#06b6d4", // cyan
    "#84cc16", // lima
  ];

  // Derive a stable color from tenant ID so it never changes regardless of array position
  function tenantColor(tenantId: string): string {
    let hash = 0;
    for (let i = 0; i < tenantId.length; i++) {
      hash = (hash * 31 + tenantId.charCodeAt(i)) >>> 0;
    }
    return TENANT_PALETTE[hash % TENANT_PALETTE.length];
  }

  const platformMapPoints = store.locations
    .filter((l) => l.latitude && l.longitude)
    .map((l) => {
      const client = clientsById.get(l.clientId);
      const tenant = tenantsById.get(l.tenantId);
      return {
        id: l.id,
        name: l.name,
        subtitle: `${client?.name ?? "—"} · ${tenant?.name ?? "—"}`,
        latitude: l.latitude,
        longitude: l.longitude,
        color: tenantColor(l.tenantId),
        href: `/platform/tenants/${l.tenantId}`,
      };
    });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Vista global"
        description="Resumen de toda la plataforma. Tenants, ingresos y salud del sistema."
        actions={
          <Button variant="secondary" size="sm" pill>
            Esta semana
          </Button>
        }
      />

      {/* Hero row */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-5">
        <HeroStat
          label="Ingreso mensual (MRR)"
          caption="Suscripciones activas"
          value={`$${formatNumber(currentMrr)}`}
          unit="USD"
          icon={DollarSign}
          iconColor="info"
          href="/platform/billing"
          valueTooltip={`MRR del mes corriente: suma de planes activos y trials, prorrateado mensual.`}
        >
          <SparkArea
            data={mrrTrend}
            labels={months.map((m) => m.label)}
            color="accent"
            height={80}
            valuePrefix="$"
            valueSuffix=" USD"
            axisLabels={[months[0].label, months[5].label, months[11].label]}
          />
        </HeroStat>

        <HeroStat
          label="Equipos en la plataforma"
          caption="Cross-tenant"
          value={formatNumber(totalEquipment)}
          icon={TrendingUp}
          iconColor="info"
          href="/platform/tenants"
        >
          <SparkArea
            data={equipmentTrend}
            labels={months.map((m) => m.label)}
            color="accent"
            height={80}
            valueSuffix=" equipos"
            axisLabels={[months[0].label, months[5].label, months[11].label]}
          />
        </HeroStat>

        <HeroStat
          label="Reportes este mes"
          caption="Cross-tenant"
          value={formatNumber(currentMonthReports)}
          icon={Activity}
          iconColor="success"
        >
          <SparkBars
            data={reportsTrend}
            labels={months.map((m) => m.label.slice(0, 1))}
            highlightIndex={reportsTrend.length - 1}
            height={80}
            valueSuffix=" reportes"
          />
        </HeroStat>

        <HeroStat
          label="Tenants activos"
          caption={`${totalTenants} en total`}
          value={activeTenants}
          icon={Building2}
          iconColor="info"
          href="/platform/tenants"
        />
      </div>

      {/* Compact KPIs */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          label="Tenants activos"
          value={`${activeTenants} / ${totalTenants}`}
          icon={Building2}
          tone="info"
          href="/platform/tenants"
        />
        <StatCard
          label="Rubros disponibles"
          value={store.verticals.length}
          hint={`${store.equipmentTypes.length} tipos de equipo`}
          icon={Layers}
          href="/platform/verticals"
        />
        <StatCard
          label="Clientes totales"
          value={formatNumber(store.clients.length)}
          hint="cross-tenant"
        />
        <StatCard
          label="Ubicaciones"
          value={formatNumber(store.locations.length)}
          icon={CheckCircle2}
        />
      </div>

      {/* Platform coverage map */}
      <div>
        <div className="flex items-center justify-between mb-3 px-1">
          <div>
            <h3 className="text-sm font-semibold text-[var(--text-primary)]">
              Cobertura geográfica
            </h3>
            <p className="text-2xs text-[var(--text-tertiary)] mt-0.5">
              {platformMapPoints.length} ubicaciones · colores por tenant
            </p>
          </div>
          <div className="hidden sm:flex items-center gap-4">
            {store.tenants.map((t) => (
              <span key={t.id} className="flex items-center gap-1.5 text-2xs text-[var(--text-secondary)]">
                <span
                  className="inline-block h-2.5 w-2.5 rounded-full border-2 border-white shadow-sm"
                  style={{ background: tenantColor(t.id) }}
                />
                {t.name}
              </span>
            ))}
          </div>
        </div>
        <LocationMap
          points={platformMapPoints}
          height={380}
          emptyMessage="No hay ubicaciones con coordenadas en la plataforma aún."
        />
      </div>

      {/* Bottom: tenants list + plan distribution + currency widget */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <div className="flex items-center justify-between px-6 py-5 border-b border-[var(--border-subtle)]">
            <div>
              <h3 className="text-base font-semibold text-[var(--text-primary)]">
                Tenants
              </h3>
              <p className="text-2xs text-[var(--text-tertiary)] mt-0.5">
                {totalTenants} empresas usando la plataforma
              </p>
            </div>
            <Link
              href="/platform/tenants"
              className="flex items-center gap-1 text-2xs font-medium text-[var(--accent-400)] hover:text-[var(--accent-300)]"
            >
              Ver todos
              <ChevronRight className="h-3 w-3" />
            </Link>
          </div>
          <CardBody className="p-2">
            <ul className="space-y-1">
              {store.tenants.map((tenant) => {
                const sub = store.subscriptions.find(
                  (s) => s.tenantId === tenant.id,
                );
                const plan = sub
                  ? store.plans.find((p) => p.id === sub.planId)
                  : null;
                const clientCount = store.clients.filter(
                  (c) => c.tenantId === tenant.id,
                ).length;

                return (
                  <li key={tenant.id}>
                    <Link
                      href={`/platform/tenants/${tenant.id}`}
                      className="flex items-center justify-between gap-4 px-3 py-3 rounded-xl hover:bg-[var(--bg-hover)]"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[var(--info-bg)] text-[var(--info-fg)]">
                          <Building2 className="h-4 w-4" />
                        </span>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium text-[var(--text-primary)]">
                            {tenant.name}
                          </p>
                          <p className="truncate text-2xs text-[var(--text-tertiary)]">
                            {tenant.slug} · {clientCount} clientes
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        {plan && <Badge tone="neutral">{plan.name}</Badge>}
                        {sub?.status === "trialing" && (
                          <Badge tone="info">Trial</Badge>
                        )}
                        {sub?.status === "active" && (
                          <Badge tone="success" dot>
                            Activo
                          </Badge>
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

        <div className="space-y-6">
          <Card>
            <div className="px-6 py-5 border-b border-[var(--border-subtle)]">
              <h3 className="text-base font-semibold text-[var(--text-primary)]">
                Por plan
              </h3>
              <p className="text-2xs text-[var(--text-tertiary)] mt-0.5">
                Distribución de tenants
              </p>
            </div>
            <CardBody className="space-y-4">
              {tenantsByPlan.map(({ plan, count }) => {
                const percent =
                  totalTenants > 0 ? (count / totalTenants) * 100 : 0;
                return (
                  <div key={plan.id}>
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <span className="font-medium text-[var(--text-primary)]">
                        {plan.name}
                      </span>
                      <span className="text-[var(--text-tertiary)] tabular">
                        {count}
                      </span>
                    </div>
                    <div className="h-1.5 bg-[var(--bg-hover)] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[var(--accent-500)] rounded-full"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
}
