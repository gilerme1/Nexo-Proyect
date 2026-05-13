import Link from "next/link";
import { redirect } from "next/navigation";
import { Building2, Plus, MapPin, Wrench, ArrowUpRight } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardBody } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { getSession } from "@/lib/auth/get-session";
import { store } from "@/lib/data/store";
import { formatRelative } from "@/lib/utils/format";

const TYPE_LABEL: Record<string, string> = {
  building: "Edificio",
  supermarket: "Supermercado",
  school: "Centro educativo",
  individual: "Particular",
  company: "Empresa",
  shop: "Comercio",
  institution: "Institución",
  industry: "Industria",
  store: "Local",
  complex: "Complejo",
  office: "Oficina",
};

export default async function ClientsListPage() {
  const session = await getSession();
  if (session.workspace.kind !== "tenant") redirect("/");
  const tenantId = session.workspace.tenantId;

  const clients = store.clients
    .filter((c) => c.tenantId === tenantId)
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Clientes"
        description="Empresas, edificios y particulares a los que prestás servicio."
        actions={
          <Link href="/app/clients/new">
            <Button size="sm" pill leftIcon={<Plus className="h-3.5 w-3.5" />}>
              Nuevo cliente
            </Button>
          </Link>
        }
      />

      {clients.length === 0 ? (
        <Card>
          <EmptyState
            icon={Building2}
            title="Sin clientes aún"
            description="Cargá tu primer cliente para empezar a registrar ubicaciones y equipos."
            action={
              <Link href="/app/clients/new">
                <Button size="sm" pill leftIcon={<Plus className="h-3.5 w-3.5" />}>
                  Crear cliente
                </Button>
              </Link>
            }
          />
        </Card>
      ) : (
        <Card>
          <CardBody className="p-2">
            <ul className="space-y-1">
              {clients.map((client) => {
                const locations = store.locations.filter(
                  (l) => l.clientId === client.id,
                );
                const equipment = store.equipment.filter(
                  (e) => e.clientId === client.id,
                );

                return (
                  <li key={client.id}>
                    <Link
                      href={`/app/clients/${client.id}`}
                      className="flex items-center justify-between gap-4 px-3 py-3.5 rounded-xl hover:bg-[var(--bg-hover)]"
                    >
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[var(--info-bg)] text-[var(--info-fg)]">
                          <Building2 className="h-4 w-4" />
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium text-[var(--text-primary)]">
                            {client.name}
                          </p>
                          <p className="truncate text-2xs text-[var(--text-tertiary)]">
                            {TYPE_LABEL[client.type] ?? client.type}
                            {client.contactName && ` · ${client.contactName}`}
                          </p>
                        </div>
                      </div>

                      <div className="hidden md:flex items-center gap-5 shrink-0 text-xs text-[var(--text-tertiary)]">
                        <span className="flex items-center gap-1.5">
                          <MapPin className="h-3 w-3" />
                          <span className="tabular">{locations.length}</span>
                        </span>
                        <span className="flex items-center gap-1.5">
                          <Wrench className="h-3 w-3" />
                          <span className="tabular">{equipment.length}</span>
                        </span>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {client.status === "active" ? (
                          <Badge tone="success" dot>
                            Activo
                          </Badge>
                        ) : client.status === "onboarding" ? (
                          <Badge tone="info">Onboarding</Badge>
                        ) : (
                          <Badge tone="neutral">Inactivo</Badge>
                        )}
                        <ArrowUpRight className="h-3.5 w-3.5 text-[var(--text-tertiary)]" />
                      </div>
                    </Link>
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
