import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { FileText, CalendarClock } from "lucide-react";
import { EquipmentDetailEditor } from "@/components/tenant/EquipmentDetailEditor";
import { getSession } from "@/lib/auth/get-session";
import { store } from "@/lib/data/store";

export default async function EquipmentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await getSession();
  if (session.workspace.kind !== "tenant") redirect("/");
  const tenantId = session.workspace.tenantId;

  const equipment = store.equipment.find(
    (e) => e.id === id && e.tenantId === tenantId,
  );
  if (!equipment) notFound();

  const tenantVerticalIds = store.tenantVerticals
    .filter((tv) => tv.tenantId === tenantId)
    .map((tv) => tv.verticalId);
  const equipmentTypes = store.equipmentTypes.filter((t) =>
    tenantVerticalIds.includes(t.verticalId),
  );

  const createdByUser = equipment.createdBy
    ? store.users.find((u) => u.id === equipment.createdBy)
    : undefined;

  const reports = [...store.reports]
    .filter((r) => r.equipmentId === id)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <>
      <EquipmentDetailEditor
        equipment={equipment}
        clients={store.clients.filter((c) => c.tenantId === tenantId)}
        locations={store.locations.filter((l) => l.tenantId === tenantId)}
        equipmentTypes={equipmentTypes}
        createdByUser={createdByUser}
        reports={reports}
      />

      {/* Spacer so content isn't hidden behind the sticky footer on mobile */}
      <div className="h-20 lg:hidden" aria-hidden="true" />

      {/* Mobile sticky footer — sits above the bottom nav (4rem) + iPhone safe area */}
      <div className="fixed bottom-[calc(4rem+env(safe-area-inset-bottom))] left-0 right-0 z-40 lg:hidden px-4 pb-3 pt-2 bg-[var(--bg-page)] border-t border-[var(--border-subtle)]">
        <div className="flex gap-3">
          <Link
            href={`/app/reports/new?equipmentId=${equipment.id}`}
            className="flex-1 flex items-center justify-center gap-2 rounded-2xl bg-[var(--accent-500)] py-3 text-sm font-semibold text-white"
          >
            <FileText className="h-4 w-4" />
            Generar reporte
          </Link>
          <Link
            href={`/app/maintenances/new?equipmentId=${equipment.id}`}
            className="flex-1 flex items-center justify-center gap-2 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-subtle)] py-3 text-sm font-semibold text-[var(--text-primary)]"
          >
            <CalendarClock className="h-4 w-4" />
            Programar
          </Link>
        </div>
      </div>
    </>
  );
}
