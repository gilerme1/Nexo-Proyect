import { Suspense } from "react";
import { redirect } from "next/navigation";
import { NewReportForm } from "@/components/reports/NewReportForm";
import { getSession } from "@/lib/auth/get-session";
import { store } from "@/lib/data/store";

export default async function NewReportPage() {
  const session = await getSession();
  if (session.workspace.kind !== "tenant") redirect("/");
  const tenantId = session.workspace.tenantId;

  const tenantVerticalIds = store.tenantVerticals
    .filter((tv) => tv.tenantId === tenantId)
    .map((tv) => tv.verticalId);
  const equipmentTypes = store.equipmentTypes.filter((t) =>
    tenantVerticalIds.includes(t.verticalId),
  );

  return (
    <Suspense fallback={null}>
      <NewReportForm
        equipment={store.equipment.filter((e) => e.tenantId === tenantId)}
        clients={store.clients.filter((c) => c.tenantId === tenantId)}
        locations={store.locations.filter((l) => l.tenantId === tenantId)}
        equipmentTypes={equipmentTypes}
        scheduledMaintenances={store.scheduledMaintenances.filter(
          (m) => m.tenantId === tenantId && (m.status === "scheduled" || m.status === "overdue"),
        )}
      />
    </Suspense>
  );
}
