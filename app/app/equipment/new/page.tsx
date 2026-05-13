import { redirect } from "next/navigation";
import { Suspense } from "react";
import { NewEquipmentForm } from "@/components/tenant/NewEquipmentForm";
import { getSession } from "@/lib/auth/get-session";
import { store } from "@/lib/data/store";

export default async function NewEquipmentPage() {
  const session = await getSession();
  if (session.workspace.kind !== "tenant") redirect("/");
  const tenantId = session.workspace.tenantId;

  // Find equipment types relevant to this tenant's verticals
  const tenantVerticalIds = store.tenantVerticals
    .filter((tv) => tv.tenantId === tenantId)
    .map((tv) => tv.verticalId);
  const equipmentTypes = store.equipmentTypes.filter((t) =>
    tenantVerticalIds.includes(t.verticalId),
  );

  return (
    <Suspense fallback={null}>
      <NewEquipmentForm
        clients={store.clients.filter((c) => c.tenantId === tenantId)}
        locations={store.locations.filter((l) => l.tenantId === tenantId)}
        equipmentTypes={equipmentTypes}
      />
    </Suspense>
  );
}
