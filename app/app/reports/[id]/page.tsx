import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft, FileText, Clock, CheckCircle2,
  Camera, Wrench, Building2, MapPin, User,
} from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardBody } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Avatar } from "@/components/ui/Avatar";
import { ReportPdfExport } from "@/components/reports/ReportPdfExport";
import { getSession } from "@/lib/auth/get-session";
import { store } from "@/lib/data/store";
import { formatDateTime, formatDate } from "@/lib/utils/format";
import { cn } from "@/lib/utils/cn";

const STATUS_CONFIG: Record<string, { label: string; tone: "success" | "warning" | "neutral" }> = {
  completed: { label: "Completado", tone: "success" },
  pending: { label: "Pendiente", tone: "warning" },
  observed: { label: "Observado", tone: "warning" },
  draft: { label: "Borrador", tone: "neutral" },
};

export default async function ReportDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await getSession();
  if (session.workspace.kind !== "tenant") redirect("/");

  const { tenantId } = session.workspace as { kind: "tenant"; tenantId: string };
  const report = store.reports.find(
    (r) => r.id === id && r.tenantId === tenantId,
  );
  if (!report) notFound();

  const equipment = store.equipment.find((e) => e.id === report.equipmentId);
  const client = store.clients.find((c) => c.id === report.clientId);
  const location = report.locationId
    ? store.locations.find((l) => l.id === report.locationId)
    : null;
  const tech = store.users.find((u) => u.id === report.technicianId);
  const tenant = store.tenants.find((t) => t.id === report.tenantId);
  const eqType = equipment
    ? store.equipmentTypes.find((t) => t.id === equipment.equipmentTypeId)
    : null;

  const cfg = STATUS_CONFIG[report.status] ?? STATUS_CONFIG.draft;

  const reportData = {
    code: report.code,
    date: report.date,
    status: report.status,
    observations: report.observations,
    durationMinutes: report.durationMinutes,
    signatureDataUrl: report.signatureDataUrl,
    photos: report.photos,
    checklists: report.checklists as any,
    equipmentName: equipment?.name ?? "—",
    equipmentCode: equipment?.internalCode ?? "—",
    equipmentTypeName: eqType?.name ?? "—",
    clientName: client?.name ?? "—",
    locationName: location?.name,
    locationAddress: location?.address,
    techName: tech?.name ?? "—",
    tenantName: tenant?.name ?? "Maintly",
  };

  return (
    <div className="space-y-6">
      <Link
        href="/app/reports"
        className="inline-flex items-center gap-1.5 text-2xs text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]"
      >
        <ArrowLeft className="h-3 w-3" />
        Volver a reportes
      </Link>

      <PageHeader
        title={
          <span className="flex items-center gap-2.5 font-mono">
            {report.code}
          </span>
        }
        description={`Creado el ${formatDateTime(report.date)}`}
        actions={<ReportPdfExport report={reportData} />}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Status + duration */}
          <Card>
            <CardBody className="flex items-center gap-4 py-4">
              <Badge tone={cfg.tone} dot size="md">{cfg.label}</Badge>
              {report.durationMinutes && (
                <span className="flex items-center gap-1.5 text-2xs text-[var(--text-tertiary)]">
                  <Clock className="h-3 w-3" />
                  {report.durationMinutes} minutos
                </span>
              )}
            </CardBody>
          </Card>

          {/* Checklists */}
          {report.checklists && report.checklists.filter((c) => c.enabled).length > 0 ? (
            <Card>
              <div className="px-6 py-5 border-b border-[var(--border-subtle)]">
                <h3 className="text-sm font-semibold text-[var(--text-primary)]">Checklist de trabajo</h3>
              </div>
              {report.checklists.filter((c) => c.enabled).map((section) => (
                <div key={section.section}>
                  <div className="px-6 py-3 bg-[var(--bg-hover)] border-b border-[var(--border-subtle)]">
                    <p className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-widest">
                      {section.section === "instalacion" ? "INSTALACIÓN" : "MANTENIMIENTO"}
                    </p>
                  </div>
                  <div className="divide-y divide-[var(--border-subtle)]">
                    {section.items.map((item, idx) => {
                      const hasMeasurement = item.measurement !== undefined;
                      return (
                        <div key={item.id} className="flex items-center gap-3 px-6 py-2.5">
                          <span className="text-2xs text-[var(--text-tertiary)] tabular w-5 text-right shrink-0">{idx + 1}</span>
                          <p className="text-sm text-[var(--text-primary)] flex-1">{item.label}</p>
                          {hasMeasurement ? (
                            <span className="text-sm font-semibold tabular text-[var(--text-primary)]">
                              {item.measurement || "—"} <span className="text-2xs text-[var(--text-tertiary)]">{item.unit}</span>
                            </span>
                          ) : (
                            <span className={cn(
                              "text-xs font-bold px-2.5 py-1 rounded-lg",
                              item.value === "si" && "bg-[var(--success-bg)] text-[var(--success-fg)]",
                              item.value === "no" && "bg-[var(--danger-bg)] text-[var(--danger-fg)]",
                              item.value === "na" && "bg-[var(--bg-hover)] text-[var(--text-tertiary)]",
                              item.value === null && "text-[var(--text-tertiary)]",
                            )}>
                              {item.value ? item.value.toUpperCase() : "—"}
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </Card>
          ) : (
            <Card>
              <CardBody className="py-8 text-center">
                <p className="text-sm text-[var(--text-tertiary)]">
                  Este reporte no tiene checklist. Fue creado antes de la actualización del formulario.
                </p>
                <Link href={`/app/reports/new?equipmentId=${report.equipmentId}`} className="mt-3 inline-block text-2xs text-[var(--accent-400)] hover:underline">
                  Crear nuevo reporte con checklist →
                </Link>
              </CardBody>
            </Card>
          )}

          {/* Observations */}
          {report.observations && (
            <Card>
              <div className="px-6 py-5 border-b border-[var(--border-subtle)]">
                <h3 className="text-sm font-semibold text-[var(--text-primary)]">Observaciones</h3>
              </div>
              <CardBody>
                <p className="text-sm text-[var(--text-secondary)] leading-relaxed whitespace-pre-wrap">
                  {report.observations}
                </p>
              </CardBody>
            </Card>
          )}

          {/* Photos */}
          {report.photos && report.photos.length > 0 && (
            <Card>
              <div className="px-6 py-5 border-b border-[var(--border-subtle)]">
                <h3 className="text-sm font-semibold text-[var(--text-primary)]">
                  Fotos ({report.photos.length})
                </h3>
              </div>
              <CardBody>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {report.photos.map((p, i) => (
                    <div key={p.id} className="rounded-xl overflow-hidden border border-[var(--border-subtle)]">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={p.url}
                        alt={p.caption ?? `Foto ${i + 1}`}
                        className="w-full aspect-square object-cover"
                      />
                      {p.caption && (
                        <p className="px-2 py-1.5 text-2xs text-[var(--text-tertiary)]">{p.caption}</p>
                      )}
                    </div>
                  ))}
                </div>
              </CardBody>
            </Card>
          )}

          {/* Signature */}
          {report.signatureDataUrl && (
            <Card>
              <div className="px-6 py-5 border-b border-[var(--border-subtle)]">
                <h3 className="text-sm font-semibold text-[var(--text-primary)]">
                  Firma del cliente
                </h3>
              </div>
              <CardBody>
                <div className="bg-white rounded-xl border border-[var(--border-subtle)] p-4 inline-block">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={report.signatureDataUrl}
                    alt="Firma"
                    className="max-h-24 max-w-xs"
                  />
                </div>
                <p className="text-2xs text-[var(--text-tertiary)] mt-2 flex items-center gap-1">
                  <CheckCircle2 className="h-3 w-3 text-[var(--success-fg)]" />
                  Firmado el {formatDate(report.date)}
                </p>
              </CardBody>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <Card>
            <div className="px-5 py-4 border-b border-[var(--border-subtle)]">
              <h3 className="text-xs font-semibold text-[var(--text-primary)]">Detalle</h3>
            </div>
            <CardBody className="space-y-4 py-4">
              {equipment && (
                <div className="flex gap-2.5">
                  <Wrench className="h-4 w-4 text-[var(--text-tertiary)] shrink-0 mt-0.5" />
                  <div>
                    <p className="text-2xs text-[var(--text-tertiary)]">Equipo</p>
                    <Link
                      href={`/app/equipment/${equipment.id}`}
                      className="text-sm text-[var(--text-primary)] hover:text-[var(--accent-400)]"
                    >
                      {equipment.name}
                    </Link>
                    <p className="text-2xs text-[var(--text-tertiary)] font-mono">{equipment.internalCode}</p>
                  </div>
                </div>
              )}
              {client && (
                <div className="flex gap-2.5">
                  <Building2 className="h-4 w-4 text-[var(--text-tertiary)] shrink-0 mt-0.5" />
                  <div>
                    <p className="text-2xs text-[var(--text-tertiary)]">Cliente</p>
                    <Link
                      href={`/app/clients/${client.id}`}
                      className="text-sm text-[var(--text-primary)] hover:text-[var(--accent-400)]"
                    >
                      {client.name}
                    </Link>
                  </div>
                </div>
              )}
              {location && (
                <div className="flex gap-2.5">
                  <MapPin className="h-4 w-4 text-[var(--text-tertiary)] shrink-0 mt-0.5" />
                  <div>
                    <p className="text-2xs text-[var(--text-tertiary)]">Ubicación</p>
                    <p className="text-sm text-[var(--text-primary)]">{location.name}</p>
                    {location.address && (
                      <p className="text-2xs text-[var(--text-tertiary)]">{location.address}</p>
                    )}
                  </div>
                </div>
              )}
              {tech && (
                <div className="flex gap-2.5">
                  <User className="h-4 w-4 text-[var(--text-tertiary)] shrink-0 mt-0.5" />
                  <div>
                    <p className="text-2xs text-[var(--text-tertiary)]">Técnico</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <Avatar name={tech.name} size="sm" />
                      <p className="text-sm text-[var(--text-primary)]">{tech.name}</p>
                    </div>
                  </div>
                </div>
              )}
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
}
