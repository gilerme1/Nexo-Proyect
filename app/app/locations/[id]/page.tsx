import { notFound, redirect } from "next/navigation";
import { getSession } from "@/lib/auth/get-session";
import { store } from "@/lib/data/store";
import { LocationDetailEditor } from "@/components/tenant/LocationDetailEditor";

export default async function LocationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await getSession();
  if (session.workspace.kind !== "tenant") redirect("/");

  const tenantId = session.workspace.tenantId;

  const location = store.locations.find(
    (l) => l.id === id && l.tenantId === tenantId,
  );
  if (!location) notFound();

  const client = store.clients.find((c) => c.id === location.clientId);
  const equipment = store.equipment.filter((e) => e.locationId === id && e.tenantId === tenantId);
  const reports = [...store.reports.filter((r) => r.locationId === id)].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  );

  return (
    <LocationDetailEditor
      location={location}
      client={client}
      equipment={equipment}
      reports={reports}
      users={store.users}
    />
  );
}
