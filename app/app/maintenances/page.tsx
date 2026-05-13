import Link from "next/link";
import { redirect } from "next/navigation";
import {
  CalendarClock, Plus, CheckCircle2, AlertCircle, Clock,
} from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardBody } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { MaintenanceCalendar } from "@/components/maintenances/MaintenanceCalendar";
import { MobileMaintenanceList } from "@/components/maintenances/MobileMaintenanceList";
import { NewMaintenanceForm } from "@/components/maintenances/NewMaintenanceForm";
import { completeScheduledMaintenance } from "@/lib/actions/reports";
import { getSession } from "@/lib/auth/get-session";
import { store } from "@/lib/data/store";
import { formatDate } from "@/lib/utils/format";

const FREQ_LABEL: Record<string, string> = {
  weekly: "Semanal", biweekly: "Quincenal", monthly: "Mensual",
  bimonthly: "Bimestral", quarterly: "Trimestral",
  semiannual: "Semestral", annual: "Anual",
};

export default async function MaintenancesPage() {
  const session = await getSession();
  if (session.workspace.kind !== "tenant") redirect("/");
  const tenantId = session.workspace.tenantId;

  const maintenances = store.scheduledMaintenances
    .filter((m) => m.tenantId === tenantId && m.status !== "completed")
    .sort((a, b) => new Date(a.nextDueAt).getTime() - new Date(b.nextDueAt).getTime());

  const equipment = store.equipment.filter((e) => e.tenantId === tenantId);
  const clients = store.clients.filter((c) => c.tenantId === tenantId);
  const locations = store.locations.filter((l) => l.tenantId === tenantId);

  const overdueCount = maintenances.filter((m) => m.status === "overdue").length;

  // Calendar events: next 3 months
  const calendarEvents = maintenances.map((m) => {
    const eq = equipment.find((e) => e.id === m.equipmentId);
    return {
      id: m.id,
      title: m.title,
      date: m.nextDueAt.slice(0, 10),
      status: m.status,
      equipmentName: eq?.name ?? "—",
    };
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Mantenimientos"
        description="Programá y seguí los mantenimientos preventivos de todos tus equipos."
        actions={
          <NewMaintenanceForm
            equipment={equipment}
            clients={clients}
            locations={locations}
          />
        }
      />

      {overdueCount > 0 && (
        <div className="rounded-2xl bg-[var(--danger-bg)] border border-[var(--danger-border)] px-5 py-4 flex items-center gap-3">
          <AlertCircle className="h-5 w-5 text-[var(--danger-fg)] shrink-0" />
          <div>
            <p className="text-sm font-semibold text-[var(--danger-fg)]">
              {overdueCount} {overdueCount === 1 ? "mantenimiento vencido" : "mantenimientos vencidos"}
            </p>
            <p className="text-2xs text-[var(--danger-fg)]/80 mt-0.5">
              Tenés mantenimientos que superaron su fecha. Atendelos lo antes posible.
            </p>
          </div>
        </div>
      )}

      {/* Calendar — desktop only */}
      <div className="hidden lg:block">
        <MaintenanceCalendar events={calendarEvents} />
      </div>

      {/* Mobile list with toggle — hidden on desktop */}
      <MobileMaintenanceList
        maintenances={maintenances}
        equipment={equipment}
        clients={clients}
      />

      {/* List */}
      {maintenances.length === 0 ? (
        <Card>
          <EmptyState
            icon={CalendarClock}
            title="Sin mantenimientos programados"
            description="Programá el primer mantenimiento preventivo para un equipo."
          />
        </Card>
      ) : (
        <Card>
          <div className="px-6 py-5 border-b border-[var(--border-subtle)]">
            <h3 className="text-sm font-semibold text-[var(--text-primary)]">
              Próximos mantenimientos
            </h3>
            <p className="text-2xs text-[var(--text-tertiary)] mt-0.5">
              {maintenances.length} programados · ordenados por fecha
            </p>
          </div>
          <CardBody className="p-2">
            <ul className="space-y-1">
              {maintenances.map((m) => {
                const eq = equipment.find((e) => e.id === m.equipmentId);
                const client = clients.find((c) => c.id === m.clientId);
                const isOverdue = m.status === "overdue";
                return (
                  <li key={m.id} className="flex items-center gap-4 px-3 py-3.5 rounded-xl hover:bg-[var(--bg-hover)]">
                    <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-full ${isOverdue ? "bg-[var(--danger-bg)] text-[var(--danger-fg)]" : "bg-[var(--info-bg)] text-[var(--info-fg)]"}`}>
                      {isOverdue ? <AlertCircle className="h-4 w-4" /> : <CalendarClock className="h-4 w-4" />}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-[var(--text-primary)] truncate">{m.title}</p>
                      <p className="text-2xs text-[var(--text-tertiary)] truncate mt-0.5">
                        {eq?.name ?? "—"} · {client?.name ?? "—"} · {FREQ_LABEL[m.frequency]}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <Badge tone={isOverdue ? "danger" : "neutral"}>
                        {isOverdue ? "Vencido" : formatDate(m.nextDueAt)}
                      </Badge>
                      <Link href={`/app/reports/new?equipmentId=${m.equipmentId}&scheduledId=${m.id}`}>
                        <Button variant="secondary" size="sm" pill>
                          Reportar
                        </Button>
                      </Link>
                    </div>
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
