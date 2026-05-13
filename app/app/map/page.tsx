import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/get-session";
import { store } from "@/lib/data/store";
import { MobileMapView } from "@/components/mobile/MobileMapView";

export default async function MapPage() {
  const session = await getSession();
  if (session.workspace.kind !== "tenant") redirect("/app");
  const tenantId = session.workspace.tenantId;

  const clients = store.clients.filter((c) => c.tenantId === tenantId);
  const locations = store.locations.filter((l) => l.tenantId === tenantId);
  const equipment = store.equipment.filter((e) => e.tenantId === tenantId);

  return (
    <>
      <div className="lg:hidden">
        <MobileMapView clients={clients} locations={locations} equipment={equipment} />
      </div>
      <div className="hidden lg:flex items-center justify-center py-20">
        <p className="text-sm text-[var(--text-tertiary)]">
          Esta vista es solo para mobile.
        </p>
      </div>
    </>
  );
}
