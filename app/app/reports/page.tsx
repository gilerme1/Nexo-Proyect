import Link from "next/link";
import { redirect } from "next/navigation";
import { FileText, Plus, ArrowUpRight } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardBody } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Avatar } from "@/components/ui/Avatar";
import { EmptyState } from "@/components/ui/EmptyState";
import { ReportsFilterClient } from "@/components/reports/ReportsFilterClient";
import { getSession } from "@/lib/auth/get-session";
import { store } from "@/lib/data/store";
import { formatRelative } from "@/lib/utils/format";

export default async function ReportsPage() {
  const session = await getSession();
  if (session.workspace.kind !== "tenant") redirect("/");
  const tenantId = session.workspace.tenantId;
  const userId = session.userId;

  const reports = store.reports
    .filter((r) => r.tenantId === tenantId)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const clients = store.clients.filter((c) => c.tenantId === tenantId);
  const equipment = store.equipment.filter((e) => e.tenantId === tenantId);
  const users = store.users;

  const enriched = reports.map((r) => ({
    ...r,
    clientName: clients.find((c) => c.id === r.clientId)?.name ?? "—",
    equipmentName: equipment.find((e) => e.id === r.equipmentId)?.name ?? "—",
    techName: users.find((u) => u.id === r.technicianId)?.name ?? "—",
    technicianId: r.technicianId,
  }));

  return (
    <div className="space-y-6">
      <PageHeader
        title="Reportes"
        description="Historial de mantenimientos correctivos y preventivos."
        actions={
          <Link href="/app/reports/new">
            <Button size="sm" pill leftIcon={<Plus className="h-3.5 w-3.5" />}>
              Nuevo reporte
            </Button>
          </Link>
        }
      />

      {enriched.length === 0 ? (
        <Card>
          <EmptyState
            icon={FileText}
            title="Sin reportes aún"
            description="Creá el primer reporte de mantenimiento."
            action={
              <Link href="/app/reports/new">
                <Button size="sm" pill leftIcon={<Plus className="h-3.5 w-3.5" />}>
                  Crear reporte
                </Button>
              </Link>
            }
          />
        </Card>
      ) : (
        <ReportsFilterClient reports={enriched} userId={userId} />
      )}
    </div>
  );
}
