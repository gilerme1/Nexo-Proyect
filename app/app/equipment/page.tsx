import { redirect } from "next/navigation";
import { EquipmentListClient } from "@/components/tenant/EquipmentListClient";
import { getSession } from "@/lib/auth/get-session";
import { store } from "@/lib/data/store";

export default async function EquipmentListPage({
  searchParams,
}: {
  searchParams?: Promise<{ clientId?: string }>;
}) {
  const params = await searchParams;
  const clientId = params?.clientId ?? null;

  const session = await getSession();
  if (session.workspace.kind !== "tenant") redirect("/");
  const tenantId = session.workspace.tenantId;

  return (
    <EquipmentListClient
      equipment={store.equipment.filter((e) => e.tenantId === tenantId)}
      clients={store.clients.filter((c) => c.tenantId === tenantId)}
      locations={store.locations.filter((l) => l.tenantId === tenantId)}
      equipmentTypes={store.equipmentTypes}
      preselectedClientId={clientId}
    />
  );
}
