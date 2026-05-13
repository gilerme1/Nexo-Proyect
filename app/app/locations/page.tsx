import Link from "next/link";
import { redirect } from "next/navigation";
import { MapPin, ChevronRight, Wrench, Building2 } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardBody } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { getSession } from "@/lib/auth/get-session";
import { store } from "@/lib/data/store";

export default async function LocationsPage() {
  const session = await getSession();
  if (session.workspace.kind !== "tenant") redirect("/");
  if (session.role !== "tenant_admin") redirect("/app");
  const tenantId = session.workspace.tenantId;

  const clients = store.clients.filter((c) => c.tenantId === tenantId);
  const total = store.locations.filter((l) => l.tenantId === tenantId).length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Ubicaciones"
        description="Todas las ubicaciones agrupadas por cliente. Para crear ubicaciones nuevas, andá al detalle del cliente."
      />

      {total === 0 ? (
        <Card>
          <EmptyState
            icon={MapPin}
            title="Sin ubicaciones"
            description="Las ubicaciones se crean desde el detalle de cada cliente."
          />
        </Card>
      ) : (
        <div className="space-y-4">
          {clients.map((client) => {
            const locs = store.locations.filter(
              (l) => l.clientId === client.id,
            );
            if (locs.length === 0) return null;

            return (
              <Card key={client.id}>
                <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border-subtle)]">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-[var(--info-bg)] text-[var(--info-fg)]">
                      <Building2 className="h-3.5 w-3.5" />
                    </span>
                    <span className="text-sm font-semibold text-[var(--text-primary)] truncate">
                      {client.name}
                    </span>
                    <Badge tone="neutral">
                      {locs.length} {locs.length === 1 ? "ubicación" : "ubicaciones"}
                    </Badge>
                  </div>
                  <Link
                    href={`/app/clients/${client.id}`}
                    className="flex items-center gap-1 text-2xs font-medium text-[var(--accent-400)] hover:text-[var(--accent-300)]"
                  >
                    Ver cliente
                    <ChevronRight className="h-3 w-3" />
                  </Link>
                </div>
                <CardBody className="p-2">
                  <ul className="space-y-1">
                    {locs.map((loc) => {
                      const eqCount = store.equipment.filter(
                        (e) => e.locationId === loc.id,
                      ).length;
                      return (
                        <li
                          key={loc.id}
                          className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-[var(--bg-hover)]"
                        >
                          <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-[var(--bg-hover)] text-[var(--text-secondary)]">
                            <MapPin className="h-3 w-3" />
                          </span>
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-medium text-[var(--text-primary)]">
                              {loc.name}
                            </p>
                            <p className="truncate text-2xs text-[var(--text-tertiary)]">
                              {loc.address}
                              {loc.city && `, ${loc.city}`}
                            </p>
                          </div>
                          <span className="flex items-center gap-1 text-2xs text-[var(--text-tertiary)] tabular shrink-0">
                            <Wrench className="h-3 w-3" />
                            {eqCount}
                          </span>
                        </li>
                      );
                    })}
                  </ul>
                </CardBody>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
