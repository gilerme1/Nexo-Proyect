"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import {
  ArrowLeft, FileText, Clock, CheckCircle2,
  Camera, Wrench, Building2, MapPin, User, Check,
} from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardBody } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { DatePicker } from "@/components/ui/DatePicker";
import { ReportPdfExport } from "@/components/reports/ReportPdfExport";
import { updateReport } from "@/lib/actions/reports";
import { formatDateTime, formatDate } from "@/lib/utils/format";
import { cn } from "@/lib/utils/cn";
import type {
  MaintenanceReport, ReportStatus, ReportKind,
  Equipment, Client, Location, User as UserType,
  Tenant,
} from "@/lib/types";

interface Props {
  report: MaintenanceReport;
  equipment: Equipment | null;
  client: Client | null;
  location: Location | null;
  tech: UserType | null;
  tenant: Tenant | null;
  eqTypeName: string;
}

const STATUSES: { value: ReportStatus; label: string }[] = [
  { value: "completed", label: "Completado" },
  { value: "pending",   label: "Pendiente" },
  { value: "observed",  label: "Observado" },
  { value: "draft",     label: "Borrador" },
  { value: "critical",  label: "Crítico" },
];

const STATUS_TONE: Record<ReportStatus, "success" | "warning" | "neutral" | "danger"> = {
  completed: "success",
  pending:   "warning",
  observed:  "warning",
  draft:     "neutral",
  critical:  "danger",
};

const REPORT_KINDS: { value: ReportKind; label: string }[] = [
  { value: "corrective",    label: "Correctivo" },
  { value: "preventive",   label: "Preventivo" },
  { value: "install",      label: "Instalación" },
  { value: "inspection",   label: "Inspección" },
  { value: "diagnostic",   label: "Diagnóstico" },
  { value: "replace",      label: "Reemplazo" },
  { value: "decommission", label: "Desinstalación" },
];

function toDateInputValue(isoDate: string): string {
  try {
    return isoDate.slice(0, 10);
  } catch {
    return "";
  }
}

export function ReportDetailEditor({ report, equipment, client, location, tech, tenant, eqTypeName }: Props) {
  const [isPending, startTransition] = useTransition();
  const [savedAt, setSavedAt] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [date, setDate] = useState(toDateInputValue(report.date));

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
    equipmentTypeName: eqTypeName,
    clientName: client?.name ?? "—",
    locationName: location?.name,
    locationAddress: location?.address,
    techName: tech?.name ?? "—",
    tenantName: tenant?.name ?? "Maintly",
  };

  function handleSubmit(formData: FormData) {
    formData.set("id", report.id);
    if (date) formData.set("date", date);
    setError(null);
    startTransition(async () => {
      const res = await updateReport(formData);
      if (res.ok) setSavedAt(Date.now());
      else setError(res.error ?? "Error al guardar.");
    });
  }

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

          {/* Edit form */}
          <form action={handleSubmit}>
            <Card>
              <div className="px-6 py-5 border-b border-[var(--border-subtle)]">
                <h3 className="text-sm font-semibold text-[var(--text-primary)]">Datos del reporte</h3>
              </div>
              <CardBody className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-2xs font-medium text-[var(--text-secondary)] mb-1.5">Estado</label>
                    <Select name="status" defaultValue={report.status}>
                      {STATUSES.map((s) => (
                        <option key={s.value} value={s.value}>{s.label}</option>
                      ))}
                    </Select>
                  </div>
                  <div>
                    <label className="block text-2xs font-medium text-[var(--text-secondary)] mb-1.5">Tipo de reporte</label>
                    <Select name="reportKind" defaultValue={report.reportKind}>
                      {REPORT_KINDS.map((k) => (
                        <option key={k.value} value={k.value}>{k.label}</option>
                      ))}
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-2xs font-medium text-[var(--text-secondary)] mb-1.5">Fecha</label>
                    <DatePicker value={date} onChange={setDate} placeholder="Seleccionar fecha" />
                    <input type="hidden" name="date" value={date} />
                  </div>
                  <div>
                    <label className="block text-2xs font-medium text-[var(--text-secondary)] mb-1.5">Duración (minutos)</label>
                    <Input
                      name="durationMinutes"
                      type="number"
                      min={0}
                      defaultValue={report.durationMinutes ?? ""}
                      placeholder="60"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-2xs font-medium text-[var(--text-secondary)] mb-1.5">Observaciones</label>
                  <textarea
                    name="observations"
                    rows={4}
                    defaultValue={report.observations ?? ""}
                    placeholder="Describí el trabajo realizado, problemas encontrados y soluciones aplicadas."
                    className="w-full bg-[var(--bg-input)] border border-[var(--border-default)] rounded-xl text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:border-[var(--accent-500)] focus:ring-2 focus:ring-[var(--accent-500)]/20 px-3.5 py-3 text-sm resize-none"
                  />
                </div>

                {error && <p className="text-xs text-[var(--danger-fg)]">{error}</p>}

                <div className="flex items-center justify-end gap-3">
                  {savedAt && (
                    <span className="flex items-center gap-1.5 text-2xs text-[var(--success-fg)]">
                      <Check className="h-3 w-3" />
                      Guardado
                    </span>
                  )}
                  <Button type="submit" pill loading={isPending}>
                    Guardar cambios
                  </Button>
                </div>
              </CardBody>
            </Card>
          </form>

          {/* Checklists (read-only) */}
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

          {/* Photos (read-only) */}
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

          {/* Signature (read-only) */}
          {report.signatureDataUrl && (
            <Card>
              <div className="px-6 py-5 border-b border-[var(--border-subtle)]">
                <h3 className="text-sm font-semibold text-[var(--text-primary)]">Firma del cliente</h3>
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
                    <Link
                      href={`/app/locations/${location.id}`}
                      className="text-sm text-[var(--text-primary)] hover:text-[var(--accent-400)]"
                    >
                      {location.name}
                    </Link>
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
