import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, MapPin, Wrench, FileText } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardBody } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { LocationMap } from "@/components/widgets/LocationMap";
import { EquipmentStatusBadge } from "@/components/ui/EquipmentStatusBadge";
import { getSession } from "@/lib/auth/get-session";
import { store } from "@/lib/data/store";
import { formatRelative } from "@/lib/utils/format";

const REPORT_STATUS: Record<string, { label: string; tone: "success" | "warning" | "neutral" }> = {
  completed: { label: "Completado", tone: "success" },
  observed:  { label: "Observado",  tone: "warning" },
  pending:   { label: "Pendiente",  tone: "warning" },
  draft:     { label: "Borrador",   tone: "neutral" },
};

export default async function LocationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await getSession();
  if (session.workspace.kind !== "tenant") redirect("/");

  const tenantId = (session.workspace as { kind: "tenant"; tenantId: string }).tenantId;

  const location = store.locations.find(
    (l) => l.id === id && l.tenantId === tenantId,
  );
  if (!location) notFound();

  const client = store.clients.find((c) => c.id === location.clientId);
  const equipment = store.equipment.filter((e) => e.locationId === id);
  const reports = [...store.reports.filter((r) => r.locationId === id)].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  );

  const mapPoints =
    location.latitude && location.longitude
      ? [{ id: location.id, name: location.name, latitude: location.latitude, longitude: location.longitude, status: location.status }]
      : [];

  return (
    <div className="space-y-6">
      <Link
        href="/app/locations"
        className="inline-flex items-center gap-1.5 text-2xs text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]"
      >
        <ArrowLeft className="h-3 w-3" />
        Volver a ubicaciones
      </Link>

      <PageHeader
        title={
          <span className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-2xl bg-[var(--info-bg)] text-[var(--info-fg)]">
              <MapPin className="h-5 w-5" />
            </span>
            {location.name}
          </span>
        }
        description={
          <>
            <Link href={`/app/clients/${client?.id}`} className="hover:text-[var(--accent-400)]">
              {client?.name ?? "—"}
            </Link>
            {location.address && (
              <> · {location.address}{location.city ? `, ${location.city}` : ""}</>
            )}
          </>
        }
      />

      {mapPoints.length > 0 && (
        <LocationMap points={mapPoints} height={280} emptyMessage="" />
      )}

      <Card>
        <div className="flex items-center justify-between px-6 py-5 border-b border-[var(--border-subtle)]">
          <div>
            <h3 className="text-sm font-semibold text-[var(--text-primary)]">Equipos</h3>
            <p className="text-2xs text-[var(--text-tertiary)] mt-0.5">
              {equipment.length} equipos en esta ubicación
            </p>
          </div>
        </div>
        <CardBody className="p-2">
          {equipment.length === 0 ? (
            <p className="px-4 py-8 text-center text-sm text-[var(--text-tertiary)]">
              Sin equipos en esta ubicación.
            </p>
          ) : (
            <ul className="space-y-1">
              {equipment.map((eq) => (
                <li key={eq.id}>
                  <Link
                    href={`/app/equipment/${eq.id}`}
                    className="flex items-center justify-between gap-4 px-3 py-3 rounded-xl hover:bg-[var(--bg-hover)]"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[var(--bg-hover)] text-[var(--text-secondary)]">
                        <Wrench className="h-3.5 w-3.5" />
                      </span>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-[var(--text-primary)]">{eq.name}</p>
                        <p className="truncate text-2xs text-[var(--text-tertiary)] font-mono">{eq.internalCode}</p>
                      </div>
                    </div>
                    <EquipmentStatusBadge status={eq.status} />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </CardBody>
      </Card>

      <Card>
        <div className="px-6 py-5 border-b border-[var(--border-subtle)]">
          <h3 className="text-sm font-semibold text-[var(--text-primary)]">Reportes del lugar</h3>
          <p className="text-2xs text-[var(--text-tertiary)] mt-0.5">{reports.length} reportes históricos</p>
        </div>
        <CardBody className="p-2">
          {reports.length === 0 ? (
            <p className="px-4 py-8 text-center text-sm text-[var(--text-tertiary)]">
              Sin reportes para esta ubicación.
            </p>
          ) : (
            <ul className="space-y-1">
              {reports.map((r) => {
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
                          <p className="truncate text-sm font-medium text-[var(--text-primary)] tabular">{r.code}</p>
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
    </div>
  );
}