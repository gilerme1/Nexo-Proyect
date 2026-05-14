import Link from "next/link";
import {
  Building2,
  Wrench,
  FileText,
  CalendarClock,
  ArrowUpRight,
  Plus,
  QrCode,
  CheckCircle2,
  Activity,
  ChevronRight,
  AlertCircle,
  AlertTriangle,
  Search,
} from "lucide-react";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/get-session";
import { getTenantById } from "@/lib/data/users";
import { store } from "@/lib/data/store";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardBody } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { HeroStat, StatCard } from "@/components/domain/StatCard";
import { SparkArea, SparkBars } from "@/components/domain/SparkArea";
import { PlanUsageWidget } from "@/components/billing/PlanUsageWidget";
import { Avatar } from "@/components/ui/Avatar";
import { LocationMap } from "@/components/widgets/LocationMap";
import { EquipmentStatusBadge } from "@/components/ui/EquipmentStatusBadge";
import { MobileScanAction } from "@/components/layout/MobileScanAction";
import { InspectionButton } from "@/components/mobile/InspectionButton";
import { TechnicianDashboard } from "@/components/tenant/TechnicianDashboard";
import {
  getClientsByTenant,
  getEquipmentByTenant,
  getReportsByTenant,
} from "@/lib/data/operations";
import { getLocationsByTenant } from "@/lib/data/locations";
import { getTenantLimitsSnapshot } from "@/lib/billing/limits";
import { formatRelative, formatDate } from "@/lib/utils/format";
import {
  lastNMonths,
  equipmentCumulativeByMonth,
  reportsByMonth,
  reportsByDay,
} from "@/lib/metrics/series";

export default async function TenantDashboardPage() {
  const session = await getSession();
  if (session.workspace.kind !== "tenant") redirect("/");

  const tenant = getTenantById(session.workspace.tenantId);
  if (!tenant) redirect("/");

  const tenantId = tenant.id;

  const clients = getClientsByTenant(tenantId);
  const equipment = getEquipmentByTenant(tenantId);
  const reports = getReportsByTenant(tenantId);
  const locations = getLocationsByTenant(tenantId);
  const clientsById = new Map(clients.map((client) => [client.id, client]));
  const equipmentById = new Map(equipment.map((item) => [item.id, item]));
  const usersById = new Map(store.users.map((item) => [item.id, item]));

  const currentUser = store.users.find((u) => u.id === session.userId);
  const myReports = [...reports]
    .filter((r) => r.technicianId === session.userId)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  // Technician role → simplified field-work dashboard
  if (session.role === "technician") {
    return (
      <TechnicianDashboard
        userName={currentUser?.name ?? "Técnico"}
        equipmentById={equipmentById}
        locations={locations}
        equipment={equipment}
      />
    );
  }

  let operational = 0;
  let observed = 0;
  for (const item of equipment) {
    if (item.status === "operational") operational += 1;
    if (item.status === "observed" || item.status === "critical") observed += 1;
  }

  const overdueCount = store.scheduledMaintenances.filter(
    (m) => m.tenantId === tenantId && m.status === "overdue",
  ).length;

  const alertEquipment = equipment
    .filter((e) => e.status === "critical" || e.status === "observed")
    .slice(0, 4);

  const upcoming = equipment
    .filter((e) => e.nextMaintenanceAt)
    .sort(
      (a, b) =>
        new Date(a.nextMaintenanceAt!).getTime() -
        new Date(b.nextMaintenanceAt!).getTime(),
    )
    .slice(0, 4);

  const recentReports = [...reports]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  // Mobile: pending maintenances
  const mobileMaintenances = store.scheduledMaintenances
    .filter(
      (m) =>
        m.tenantId === tenantId &&
        (m.status === "overdue" || m.status === "scheduled"),
    )
    .sort(
      (a, b) =>
        new Date(a.nextDueAt).getTime() - new Date(b.nextDueAt).getTime(),
    )
    .slice(0, 3);

  const { plan, subscription, statuses } = getTenantLimitsSnapshot(tenantId);

  const months = lastNMonths(12);
  const equipmentTrend = equipmentCumulativeByMonth(equipment, months);
  const reportsTrend = reportsByMonth(reports, months);
  const week = reportsByDay(reports);

  let validMapPointCount = 0;
  const mapPoints = locations.map((l) => {
    if (typeof l.latitude === "number" && typeof l.longitude === "number") {
      validMapPointCount += 1;
    }
    const client = clientsById.get(l.clientId);
    return {
      id: l.id,
      name: `${client?.name ?? "—"} · ${l.name}`,
      latitude: l.latitude,
      longitude: l.longitude,
      status: l.status,
      href: `/app/clients/${l.clientId}`,
    };
  });

  return (
    <div className="space-y-6">
      {/* Mobile quick actions — hidden on desktop */}
      <div className="lg:hidden space-y-3">
        {/* Primary: scan */}
        <MobileScanAction />
        {/* Secondary row */}
        <div className="grid grid-cols-2 gap-3">
          <Link
            href="/app/equipment"
            className="group flex flex-col items-center justify-center gap-1.5 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-subtle)] py-4 text-sm font-medium text-[var(--text-primary)] hover:bg-[var(--bg-hover)] active:opacity-70 transition-all duration-150"
          >
            <Search className="h-5 w-5 text-[var(--text-tertiary)] group-hover:scale-110 transition-transform duration-150" />
            Buscar equipo
          </Link>
          <InspectionButton locations={locations} equipment={equipment} secondary />
        </div>
      </div>

      <PageHeader
        title="Dashboard"
        description={`Resumen operativo de ${tenant.name}.`}
        actions={
          <div className="flex items-center gap-2">
            <Link href="/app/qr-tags" className="hidden sm:block">
              <Button
                variant="secondary"
                size="sm"
                pill
                leftIcon={<QrCode className="h-3.5 w-3.5" />}
              >
                Generar QR
              </Button>
            </Link>
            <Link href="/app/reports/new" className="hidden sm:block">
              <Button
                size="sm"
                pill
                leftIcon={<Plus className="h-3.5 w-3.5" />}
              >
                Nuevo reporte
              </Button>
            </Link>
          </div>
        }
      />

      {/* Hero row — desktop only */}
      <div className="hidden lg:grid grid-cols-1 gap-5 lg:grid-cols-3">
        <HeroStat
          label="Equipos en gestión"
          caption={`${operational} operativos`}
          value={equipment.length}
          icon={Wrench}
          iconColor="info"
          href="/app/equipment"
          subtext={observed > 0 ? `${observed} requieren atención` : "Todos al día"}
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
          caption="Producción del equipo"
          value={reports.length}
          icon={FileText}
          iconColor="info"
          href="/app/reports"
        >
          <SparkArea
            data={reportsTrend}
            labels={months.map((m) => m.label)}
            color="accent"
            height={80}
            valueSuffix=" reportes"
            axisLabels={[months[0].label, months[5].label, months[11].label]}
          />
        </HeroStat>

        <HeroStat
          label="Reportes esta semana"
          caption="Por día"
          value={week.values.reduce((a, b) => a + b, 0)}
          unit="/ sem"
          icon={Activity}
          iconColor="success"
        >
          <SparkBars
            data={week.values}
            labels={week.labels}
            height={80}
            valueSuffix=" reportes"
          />
        </HeroStat>
      </div>

      {/* Compact KPIs — always visible */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          label="Clientes"
          value={clients.length}
          icon={Building2}
          href="/app/clients"
        />
        <StatCard
          label="Operativos"
          value={operational}
          tone="success"
          icon={CheckCircle2}
        />
        <StatCard
          label="Requieren atención"
          value={observed}
          tone={observed > 0 ? "warning" : "default"}
        />
        <StatCard
          label="Vencidos"
          value={overdueCount}
          tone={overdueCount > 0 ? "danger" : "default"}
          icon={CalendarClock}
          href="/app/maintenances"
        />
      </div>

      {/* Mobile sections — hidden on desktop */}
      <div className="lg:hidden space-y-4">
        <Card>
          <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--border-subtle)]">
            <h3 className="text-sm font-semibold text-[var(--text-primary)]">
              Mis últimos registros
            </h3>
            <Link href="/app/reports" className="text-2xs font-medium text-[var(--accent-400)]">
              Ver todos
            </Link>
          </div>
          <CardBody className="p-2">
            {myReports.length === 0 ? (
              <p className="px-4 py-6 text-center text-sm text-[var(--text-tertiary)]">
                No tenés reportes aún.
              </p>
            ) : (
              <ul className="space-y-1">
                {myReports.map((r) => {
                  const eq = equipmentById.get(r.equipmentId);
                  return (
                    <li key={r.id}>
                      <Link
                        href={`/app/reports/${r.id}`}
                        className="flex items-center justify-between gap-3 px-3 py-3 rounded-xl hover:bg-[var(--bg-hover)] active:bg-[var(--bg-hover)] active:opacity-70 transition-opacity duration-100"
                      >
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium text-[var(--text-primary)] tabular">
                            {r.code}
                          </p>
                          <p className="truncate text-2xs text-[var(--text-tertiary)]">
                            {eq?.name ?? "—"} · {formatRelative(r.date)}
                          </p>
                        </div>
                        <Badge
                          tone={r.status === "completed" ? "success" : r.status === "observed" ? "warning" : "neutral"}
                          dot
                        >
                          {r.status === "completed" ? "Listo" : r.status === "observed" ? "Obs." : r.status}
                        </Badge>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            )}
          </CardBody>
        </Card>

        {mobileMaintenances.length > 0 && (
          <Card>
            <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--border-subtle)]">
              <h3 className="text-sm font-semibold text-[var(--text-primary)]">
                Próximos mantenimientos
              </h3>
              <Link href="/app/maintenances" className="text-2xs font-medium text-[var(--accent-400)]">
                Ver todos
              </Link>
            </div>
            <CardBody className="p-2">
              <ul className="space-y-1">
                {mobileMaintenances.map((m) => {
                  const eq = equipmentById.get(m.equipmentId);
                  const isOverdue = m.status === "overdue";
                  return (
                    <li key={m.id}>
                      <Link
                        href={`/app/reports/new?equipmentId=${m.equipmentId}&scheduledId=${m.id}`}
                        className="flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-[var(--bg-hover)] active:bg-[var(--bg-hover)] active:opacity-70 transition-opacity duration-100"
                      >
                        <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-full ${isOverdue ? "bg-[var(--danger-bg)] text-[var(--danger-fg)]" : "bg-[var(--info-bg)] text-[var(--info-fg)]"}`}>
                          <CalendarClock className="h-3.5 w-3.5" />
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium text-[var(--text-primary)]">{m.title}</p>
                          <p className="truncate text-2xs text-[var(--text-tertiary)]">
                            {eq?.name ?? "—"} · {isOverdue ? "Vencido" : formatDate(m.nextDueAt)}
                          </p>
                        </div>
                        <Badge tone={isOverdue ? "danger" : "neutral"} size="sm">
                          {isOverdue ? "Vencido" : "Pendiente"}
                        </Badge>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </CardBody>
          </Card>
        )}
      </div>

      {/* Equipment alerts — always visible */}
      {alertEquipment.length > 0 && (
        <Card>
          <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border-subtle)]">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-[var(--warning-fg)]" />
              <h3 className="text-sm font-semibold text-[var(--text-primary)]">
                Equipos que requieren atención
              </h3>
            </div>
            <Link
              href="/app/equipment"
              className="flex items-center gap-1 text-2xs font-medium text-[var(--accent-400)] hover:text-[var(--accent-300)]"
            >
              Ver todos
              <ChevronRight className="h-3 w-3" />
            </Link>
          </div>
          <CardBody className="p-2">
            <ul className="space-y-1">
              {alertEquipment.map((eq) => {
                const client = clientsById.get(eq.clientId);
                return (
                  <li key={eq.id}>
                    <Link
                      href={`/app/equipment/${eq.id}`}
                      className="flex items-center justify-between gap-4 px-3 py-2.5 rounded-xl hover:bg-[var(--bg-hover)]"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-[var(--danger-bg)] text-[var(--danger-fg)]">
                          <AlertCircle className="h-3.5 w-3.5" />
                        </span>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium text-[var(--text-primary)]">
                            {eq.name}
                          </p>
                          <p className="truncate text-2xs text-[var(--text-tertiary)]">
                            {client?.name ?? "—"} · {eq.internalCode}
                          </p>
                        </div>
                      </div>
                      <EquipmentStatusBadge status={eq.status} />
                    </Link>
                  </li>
                );
              })}
            </ul>
          </CardBody>
        </Card>
      )}

      {/* Location map — desktop only */}
      <div className="hidden lg:block">
        <div className="flex items-center justify-between mb-3 px-1">
          <div>
            <h3 className="text-sm font-semibold text-[var(--text-primary)]">
              Cobertura de ubicaciones
            </h3>
            <p className="text-2xs text-[var(--text-tertiary)] mt-0.5">
              {validMapPointCount} ubicaciones en el mapa
            </p>
          </div>
        </div>
        <LocationMap
          points={mapPoints}
          height={360}
          emptyMessage="Aún no hay ubicaciones con coordenadas. Las direcciones nuevas se geocodifican automáticamente."
        />
      </div>

      {/* Desktop bottom grid — hidden on mobile */}
      <div className="hidden lg:grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <div className="flex items-center justify-between px-6 py-5 border-b border-[var(--border-subtle)]">
              <div>
                <h3 className="text-base font-semibold text-[var(--text-primary)]">
                  Reportes recientes
                </h3>
                <p className="text-2xs text-[var(--text-tertiary)] mt-0.5">
                  Últimos {recentReports.length} mantenimientos
                </p>
              </div>
              <Link
                href="/app/reports"
                className="flex items-center gap-1 text-2xs font-medium text-[var(--accent-400)] hover:text-[var(--accent-300)]"
              >
                Ver historial
                <ChevronRight className="h-3 w-3" />
              </Link>
            </div>
            <CardBody className="p-2">
              {recentReports.length === 0 ? (
                <p className="px-4 py-8 text-center text-sm text-[var(--text-tertiary)]">
                  Aún no hay reportes.
                </p>
              ) : (
                <ul className="space-y-1">
                  {recentReports.map((r) => {
                    const tech = usersById.get(r.technicianId);
                    const client = clientsById.get(r.clientId);
                    return (
                      <li key={r.id}>
                        <Link
                          href={`/app/reports/${r.id}`}
                          className="flex items-center justify-between gap-4 px-3 py-3 rounded-xl hover:bg-[var(--bg-hover)]"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[var(--bg-hover)] text-[var(--text-secondary)]">
                              <FileText className="h-4 w-4" />
                            </span>
                            <div className="min-w-0">
                              <p className="truncate text-sm font-medium text-[var(--text-primary)] tabular">
                                {r.code}
                              </p>
                              <p className="truncate text-2xs text-[var(--text-tertiary)]">
                                {client?.name} · {formatRelative(r.date)}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3 shrink-0">
                            {tech && <Avatar name={tech.name} size="sm" />}
                            <Badge
                              tone={
                                r.status === "completed"
                                  ? "success"
                                  : r.status === "observed"
                                    ? "warning"
                                    : "neutral"
                              }
                              dot
                            >
                              {r.status === "completed"
                                ? "Completado"
                                : r.status === "observed"
                                  ? "Observado"
                                  : r.status}
                            </Badge>
                          </div>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              )}
            </CardBody>
          </Card>

          <Card>
            <div className="flex items-center justify-between px-6 py-5 border-b border-[var(--border-subtle)]">
              <div>
                <h3 className="text-base font-semibold text-[var(--text-primary)]">
                  Próximos mantenimientos
                </h3>
                <p className="text-2xs text-[var(--text-tertiary)] mt-0.5">
                  Programados próximamente
                </p>
              </div>
              <Link
                href="/app/maintenances"
                className="flex items-center gap-1 text-2xs font-medium text-[var(--accent-400)] hover:text-[var(--accent-300)]"
              >
                Ver agenda
                <ChevronRight className="h-3 w-3" />
              </Link>
            </div>
            <CardBody className="p-2">
              {upcoming.length === 0 ? (
                <p className="px-4 py-8 text-center text-sm text-[var(--text-tertiary)]">
                  Sin mantenimientos programados.
                </p>
              ) : (
                <ul className="space-y-1">
                  {upcoming.map((eq) => (
                    <li key={eq.id}>
                      <div className="flex items-center justify-between gap-4 px-3 py-3 rounded-xl hover:bg-[var(--bg-hover)]">
                        <div className="flex items-center gap-3 min-w-0">
                          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[var(--bg-hover)] text-[var(--text-secondary)]">
                            <CalendarClock className="h-4 w-4" />
                          </span>
                          <div className="min-w-0">
                            <p className="truncate text-sm font-medium text-[var(--text-primary)]">
                              {eq.name}
                            </p>
                            <p className="truncate text-2xs text-[var(--text-tertiary)] tabular">
                              {eq.internalCode}
                            </p>
                          </div>
                        </div>
                        <Badge tone="neutral">
                          {formatDate(eq.nextMaintenanceAt)}
                        </Badge>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </CardBody>
          </Card>
        </div>

        {/* Right column */}
        <div className="space-y-6">
          {plan && subscription && (
            <PlanUsageWidget
              plan={plan}
              subscription={subscription}
              statuses={statuses}
              variant="compact"
            />
          )}

          <Card>
            <div className="px-6 py-5 border-b border-[var(--border-subtle)]">
              <h3 className="text-base font-semibold text-[var(--text-primary)]">
                Acciones rápidas
              </h3>
            </div>
            <CardBody className="p-2">
              <ul className="space-y-0.5">
                {[
                  { label: "Nuevo cliente", href: "/app/clients/new", icon: Building2 },
                  { label: "Nuevo equipo", href: "/app/equipment/new", icon: Wrench },
                  { label: "Nuevo reporte", href: "/app/reports/new", icon: FileText },
                  { label: "Generar QR", href: "/app/qr-tags", icon: QrCode },
                ].map((item) => {
                  const Icon = item.icon;
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        className="flex items-center justify-between gap-2 px-3 py-2.5 rounded-xl hover:bg-[var(--bg-hover)] group"
                      >
                        <div className="flex items-center gap-2.5">
                          <Icon className="h-3.5 w-3.5 text-[var(--text-tertiary)]" />
                          <span className="text-sm text-[var(--text-primary)]">
                            {item.label}
                          </span>
                        </div>
                        <ArrowUpRight className="h-3.5 w-3.5 text-[var(--text-tertiary)] group-hover:text-[var(--text-primary)]" />
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </CardBody>
          </Card>
        </div>
      </div>

    </div>
  );
}
