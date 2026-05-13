import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import {
  Building2,
  ArrowLeft,
  Mail,
  Phone,
  FileText,
  MapPin,
  Wrench,
  Plus,
} from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardBody } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { StatCard } from "@/components/domain/StatCard";
import { Tabs } from "@/components/ui/Tabs";
import { LocationMap } from "@/components/widgets/LocationMap";
import { ClientLocationsEditor } from "@/components/tenant/ClientLocationsEditor";
import { getSession } from "@/lib/auth/get-session";
import { store } from "@/lib/data/store";
import { formatRelative, formatDate } from "@/lib/utils/format";

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

export default async function ClientDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await getSession();
  if (session.workspace.kind !== "tenant") redirect("/");

  const { tenantId } = session.workspace as { kind: "tenant"; tenantId: string };
  const client = store.clients.find(
    (c) => c.id === id && c.tenantId === tenantId,
  );
  if (!client) notFound();

  const locations = store.locations.filter((l) => l.clientId === client.id);
  const equipment = store.equipment.filter((e) => e.clientId === client.id);
  const reports = store.reports.filter((r) => r.clientId === client.id);

  const mapPoints = locations.map((l) => ({
    id: l.id,
    name: l.name,
    latitude: l.latitude,
    longitude: l.longitude,
    status: l.status,
  }));

  const overviewTab = (
    <div className="space-y-6">
      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard
          label="Ubicaciones"
          value={locations.length}
          icon={MapPin}
        />
        <StatCard
          label="Equipos en gestión"
          value={equipment.length}
          icon={Wrench}
        />
        <StatCard
          label="Reportes históricos"
          value={reports.length}
          icon={FileText}
        />
      </div>

      {/* Contact */}
      {(client.contactName || client.contactEmail || client.contactPhone) && (
        <Card>
          <div className="px-6 py-5 border-b border-[var(--border-subtle)]">
            <h3 className="text-sm font-semibold text-[var(--text-primary)]">
              Contacto
            </h3>
          </div>
          <CardBody className="space-y-3">
            {client.contactName && (
              <div>
                <p className="text-2xs text-[var(--text-tertiary)]">Nombre</p>
                <p className="text-sm text-[var(--text-primary)]">
                  {client.contactName}
                </p>
              </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {client.contactEmail && (
                <div>
                  <p className="text-2xs text-[var(--text-tertiary)] flex items-center gap-1.5">
                    <Mail className="h-3 w-3" /> Email
                  </p>
                  <a
                    href={`mailto:${client.contactEmail}`}
                    className="text-sm text-[var(--text-primary)] hover:text-[var(--accent-400)]"
                  >
                    {client.contactEmail}
                  </a>
                </div>
              )}
              {client.contactPhone && (
                <div>
                  <p className="text-2xs text-[var(--text-tertiary)] flex items-center gap-1.5">
                    <Phone className="h-3 w-3" /> Teléfono
                  </p>
                  <a
                    href={`tel:${client.contactPhone}`}
                    className="text-sm text-[var(--text-primary)] hover:text-[var(--accent-400)]"
                  >
                    {client.contactPhone}
                  </a>
                </div>
              )}
            </div>
            {client.taxId && (
              <div>
                <p className="text-2xs text-[var(--text-tertiary)]">RUT / Tax ID</p>
                <p className="text-sm text-[var(--text-primary)] font-mono">
                  {client.taxId}
                </p>
              </div>
            )}
          </CardBody>
        </Card>
      )}
    </div>
  );

  const locationsTab = (
    <div className="space-y-6">
      <LocationMap
        points={mapPoints}
        height={300}
        emptyMessage="Aún no hay ubicaciones con coordenadas para mostrar."
      />
      <ClientLocationsEditor
        clientId={client.id}
        locations={locations}
        equipment={equipment}
      />
    </div>
  );

  const equipmentTab = (
    <Card>
      <div className="flex items-center justify-between px-6 py-5 border-b border-[var(--border-subtle)]">
        <div>
          <h3 className="text-sm font-semibold text-[var(--text-primary)]">
            Equipos
          </h3>
          <p className="text-2xs text-[var(--text-tertiary)] mt-0.5">
            {equipment.length} equipos registrados
          </p>
        </div>
        <Link href={`/app/equipment/new?clientId=${client.id}`}>
          <Button
            variant="secondary"
            size="sm"
            pill
            leftIcon={<Plus className="h-3.5 w-3.5" />}
          >
            Nuevo equipo
          </Button>
        </Link>
      </div>
      <CardBody className="p-2">
        {equipment.length === 0 ? (
          <p className="px-4 py-8 text-center text-sm text-[var(--text-tertiary)]">
            Sin equipos. Agregá el primero.
          </p>
        ) : (
          <ul className="space-y-1">
            {equipment.map((eq) => {
              const loc = locations.find((l) => l.id === eq.locationId);
              return (
                <li key={eq.id}>
                  <Link
                    href={`/app/equipment/${eq.id}`}
                    className="flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-[var(--bg-hover)]"
                  >
                    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[var(--bg-hover)] text-[var(--text-secondary)]">
                      <Wrench className="h-3.5 w-3.5" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="truncate text-sm font-medium text-[var(--text-primary)]">
                          {eq.name}
                        </p>
                        {eq.isDraft && (
                          <Badge tone="warning" size="sm">
                            Pendiente
                          </Badge>
                        )}
                      </div>
                      <p className="truncate text-2xs text-[var(--text-tertiary)]">
                        {loc?.name ?? "Sin ubicación"} · {eq.internalCode}
                      </p>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </CardBody>
    </Card>
  );

  const REPORT_STATUS: Record<string, { label: string; tone: "success" | "warning" | "neutral" }> = {
    completed: { label: "Completado", tone: "success" },
    observed:  { label: "Observado",  tone: "warning" },
    pending:   { label: "Pendiente",  tone: "warning" },
    draft:     { label: "Borrador",   tone: "neutral" },
  };

  const reportsTab = (
    <Card>
      <div className="px-6 py-5 border-b border-[var(--border-subtle)]">
        <h3 className="text-sm font-semibold text-[var(--text-primary)]">Reportes</h3>
        <p className="text-2xs text-[var(--text-tertiary)] mt-0.5">
          {reports.length} reportes históricos
        </p>
      </div>
      <CardBody className="p-2">
        {reports.length === 0 ? (
          <p className="px-4 py-8 text-center text-sm text-[var(--text-tertiary)]">
            Sin reportes para este cliente.
          </p>
        ) : (
          <ul className="space-y-1">
            {[...reports]
              .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
              .map((r) => {
                const eq = equipment.find((e) => e.id === r.equipmentId);
                const tech = store.users.find((u) => u.id === r.technicianId);
                const cfg = REPORT_STATUS[r.status] ?? REPORT_STATUS.draft;
                return (
                  <li key={r.id}>
                    <Link
                      href={`/app/reports/${r.id}`}
                      className="flex items-center justify-between gap-4 px-3 py-3 rounded-xl hover:bg-[var(--bg-hover)]"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[var(--bg-hover)] text-[var(--text-secondary)]">
                          <FileText className="h-3.5 w-3.5" />
                        </span>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium text-[var(--text-primary)] tabular">
                            {r.code}
                          </p>
                          <p className="truncate text-2xs text-[var(--text-tertiary)]">
                            {eq?.name ?? "—"} · {tech?.name ?? "—"} · {formatRelative(r.date)}
                          </p>
                        </div>
                      </div>
                      <Badge tone={cfg.tone} dot>{cfg.label}</Badge>
                    </Link>
                  </li>
                );
              })}
          </ul>
        )}
      </CardBody>
    </Card>
  );

  return (
    <div className="space-y-6">
      <Link
        href="/app/clients"
        className="inline-flex items-center gap-1.5 text-2xs text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]"
      >
        <ArrowLeft className="h-3 w-3" />
        Volver a clientes
      </Link>

      <PageHeader
        title={
          <span className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-2xl bg-[var(--info-bg)] text-[var(--info-fg)]">
              <Building2 className="h-5 w-5" />
            </span>
            <span className="flex items-center gap-2.5">
              {client.name}
            </span>
          </span>
        }
        description={
          <>
            <span>{TYPE_LABEL[client.type] ?? client.type}</span>
            <span className="mx-2">·</span>
            <span>creado {formatRelative(client.createdAt)}</span>
          </>
        }
      />

      <Tabs
        tabs={[
          { id: "overview", label: "Resumen", content: overviewTab },
          {
            id: "locations",
            label: "Ubicaciones",
            badge: locations.length,
            content: locationsTab,
          },
          {
            id: "equipment",
            label: "Equipos",
            badge: equipment.length,
            content: equipmentTab,
          },
          {
            id: "reports",
            label: "Reportes",
            badge: reports.length,
            content: reportsTab,
          },
        ]}
      />
    </div>
  );
}
