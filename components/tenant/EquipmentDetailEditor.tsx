"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { Check, AlertCircle, FileText, QrCode, X } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardBody } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Badge } from "@/components/ui/Badge";
import { Avatar } from "@/components/ui/Avatar";
import { EquipmentStatusBadge } from "@/components/ui/EquipmentStatusBadge";
import { updateEquipment } from "@/lib/actions/equipment";
import { generateAndBindQr, bindQrTag } from "@/lib/actions/qr";
import { DatePicker } from "@/components/ui/DatePicker";
import { HARDCODED_EQUIPMENT_TEMPLATES } from "@/lib/equipment/templates";
import { getEquipmentFormFields } from "@/lib/equipment/resolver";
import type {
  Equipment,
  Client,
  Location,
  EquipmentType,
  User,
  EquipmentStatus,
  MaintenanceReport,
} from "@/lib/types";
import { formatDateTime, formatRelative } from "@/lib/utils/format";

interface Props {
  equipment: Equipment;
  clients: Client[];
  locations: Location[];
  equipmentTypes: EquipmentType[];
  createdByUser?: User;
  reports?: MaintenanceReport[];
}

const STATUSES: { value: EquipmentStatus; label: string }[] = [
  { value: "operational",    label: "Operativo" },
  { value: "in_maintenance", label: "En mantenimiento" },
  { value: "observed",       label: "Observado" },
  { value: "critical",       label: "Crítico" },
  { value: "out_of_service", label: "Fuera de servicio" },
  { value: "pending",        label: "Pendiente" },
];

const REPORT_KIND_LABELS: Record<string, string> = {
  install:      "Instalación",
  preventive:   "Preventivo",
  corrective:   "Correctivo",
  inspection:   "Inspección",
  diagnostic:   "Diagnóstico",
  replace:      "Reemplazo",
  decommission: "Baja",
};

const REPORT_STATUS_CFG: Record<string, { label: string; tone: "success" | "warning" | "neutral" | "danger" }> = {
  completed: { label: "Completado", tone: "success" },
  observed:  { label: "Observado",  tone: "warning" },
  pending:   { label: "Pendiente",  tone: "warning" },
  draft:     { label: "Borrador",   tone: "neutral" },
  critical:  { label: "Crítico",    tone: "danger" },
};

export function EquipmentDetailEditor({
  equipment,
  clients,
  locations,
  equipmentTypes,
  createdByUser,
  reports = [],
}: Props) {
  const [isPending, startTransition] = useTransition();
  const [savedAt, setSavedAt] = useState<number | null>(null);
  const [clientId, setClientId] = useState(equipment.clientId);
  const [typeId, setTypeId] = useState(equipment.equipmentTypeId);
  const [qrOpen, setQrOpen] = useState(false);
  const [qrCode, setQrCode] = useState(equipment.qrCode);
  const [qrError, setQrError] = useState<string | null>(null);
  const [assignInput, setAssignInput] = useState("");
  const [assignError, setAssignError] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isAssigning, setIsAssigning] = useState(false);

  const filteredLocations = locations.filter((l) => l.clientId === clientId);
  const selectedType = equipmentTypes.find((t) => t.id === typeId);
  const storeFields = typeId ? getEquipmentFormFields(typeId) : [];
  const hardcodedTemplate = selectedType
    ? HARDCODED_EQUIPMENT_TEMPLATES.find((t) => t.typeSlug === selectedType.slug)
    : undefined;
  const templateFields = storeFields.length > 0
    ? storeFields
    : (hardcodedTemplate?.fields ?? []);

  function handleSubmit(formData: FormData) {
    formData.set("id", equipment.id);
    formData.set("clientId", clientId);
    formData.set("equipmentTypeId", typeId);
    if (equipment.isDraft) formData.set("finalize", "true");
    startTransition(async () => {
      await updateEquipment(formData);
      setSavedAt(Date.now());
    });
  }

  async function handleGenerateQr() {
    setIsGenerating(true);
    setQrError(null);
    const res = await generateAndBindQr(equipment.id);
    setIsGenerating(false);
    if (res.ok && res.code) setQrCode(res.code);
    else setQrError(res.error ?? "Error generando QR.");
  }

  async function handleAssignQr() {
    const code = assignInput.trim().toUpperCase();
    if (!code) return;
    setIsAssigning(true);
    setAssignError(null);
    const res = await bindQrTag(code, equipment.id);
    setIsAssigning(false);
    if (res.ok) { setQrCode(code); setAssignInput(""); }
    else setAssignError(res.error ?? "Error asignando QR.");
  }

  const qrValue = `https://maintly.app/q/${qrCode ?? ""}`;

  return (
    <div className="space-y-6 pb-[calc(4rem+env(safe-area-inset-bottom))] lg:pb-0">
      <Link
        href="/app/equipment"
        className="inline-flex items-center gap-1.5 text-2xs text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]"
      >
        ← Volver a equipos
      </Link>

      <PageHeader
        title={
          <span className="flex items-center gap-2.5 flex-wrap">
            {equipment.name}
            <EquipmentStatusBadge status={equipment.status} />
            {equipment.isDraft && (
              <Badge tone="warning">
                <AlertCircle className="h-3 w-3" />
                Pendiente de completar
              </Badge>
            )}
          </span>
        }
        description={
          <span className="font-mono text-2xs">{equipment.internalCode}</span>
        }
      />

      {/* Origen card — when created from QR scan */}
      {createdByUser && (
        <Card>
          <CardBody className="flex items-center gap-3 py-4">
            <Avatar name={createdByUser.name} size="sm" />
            <div className="min-w-0 flex-1 text-2xs">
              <p className="text-[var(--text-secondary)]">
                <span className="text-[var(--text-primary)] font-medium">
                  {createdByUser.name}
                </span>
                {" "}lo registró el{" "}
                <span className="text-[var(--text-secondary)]">
                  {formatDateTime(equipment.createdAt)}
                </span>
                {equipment.createdFromQrTagId && (
                  <>
                    {" "}desde QR{" "}
                    <code className="text-[var(--text-secondary)]">
                      {equipment.qrCode}
                    </code>
                  </>
                )}
              </p>
            </div>
          </CardBody>
        </Card>
      )}

      {equipment.isDraft && (
        <div className="rounded-xl bg-[var(--warning-bg)] border border-[var(--warning-border)] px-4 py-3 flex items-start gap-2.5">
          <AlertCircle className="h-4 w-4 text-[var(--warning-fg)] shrink-0 mt-0.5" />
          <div className="text-2xs text-[var(--warning-fg)] leading-relaxed">
            <p className="font-semibold">Esta ficha se creó en sitio.</p>
            <p>
              Tiene los datos mínimos. Completá los detalles abajo y al guardar
              se marca como completa.
            </p>
          </div>
        </div>
      )}

      <form action={handleSubmit} className="space-y-6">
        {/* Basic info */}
        <Card>
          <CardBody className="space-y-4">
            <div>
              <label className="block text-2xs font-medium text-[var(--text-secondary)] mb-1.5">
                Nombre del equipo *
              </label>
              <Input name="name" defaultValue={equipment.name} required />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-2xs font-medium text-[var(--text-secondary)] mb-1.5">
                  Cliente
                </label>
                <Select
                  value={clientId}
                  onChange={(e) => setClientId(e.target.value)}
                >
                  {clients.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </Select>
              </div>
              <div>
                <label className="block text-2xs font-medium text-[var(--text-secondary)] mb-1.5">
                  Ubicación
                </label>
                <Select name="locationId" defaultValue={equipment.locationId}>
                  {filteredLocations.map((l) => (
                    <option key={l.id} value={l.id}>
                      {l.name}
                    </option>
                  ))}
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-2xs font-medium text-[var(--text-secondary)] mb-1.5">
                  Tipo de equipo
                </label>
                <Select
                  value={typeId}
                  onChange={(e) => setTypeId(e.target.value)}
                >
                  {equipmentTypes.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))}
                </Select>
              </div>
              <div>
                <label className="block text-2xs font-medium text-[var(--text-secondary)] mb-1.5">
                  Estado
                </label>
                <Select name="status" defaultValue={equipment.status}>
                  {STATUSES.map((s) => (
                    <option key={s.value} value={s.value}>
                      {s.label}
                    </option>
                  ))}
                </Select>
              </div>
            </div>
            <div>
              <label className="block text-2xs font-medium text-[var(--text-secondary)] mb-1.5">
                Código interno
              </label>
              <Input name="internalCode" defaultValue={equipment.internalCode} />
            </div>
          </CardBody>
        </Card>

        {/* Template fields */}
        {templateFields.length > 0 && (
          <Card>
            <div className="px-6 py-5 border-b border-[var(--border-subtle)]">
              <h3 className="text-sm font-semibold text-[var(--text-primary)]">
                Detalles de {selectedType?.name ?? "equipo"}
              </h3>
            </div>
            <CardBody className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {templateFields.map((f) => (
                <TemplateFieldWithDefault
                  key={f.id}
                  field={f as any}
                  defaultValue={String(equipment.data[f.id] ?? "")}
                />
              ))}
            </CardBody>
          </Card>
        )}

        <div className="flex items-center justify-end gap-3">
          {savedAt && (
            <span className="flex items-center gap-1.5 text-2xs text-[var(--success-fg)]">
              <Check className="h-3 w-3" />
              Guardado
            </span>
          )}
          <Button type="submit" pill loading={isPending}>
            {equipment.isDraft ? "Guardar y marcar completo" : "Guardar cambios"}
          </Button>
        </div>
      </form>

      {/* D4a — Reports history */}
      <Card>
          <div className="flex items-center justify-between px-6 py-5 border-b border-[var(--border-subtle)]">
            <div>
              <h3 className="text-sm font-semibold text-[var(--text-primary)]">Historial de reportes</h3>
              <p className="text-2xs text-[var(--text-tertiary)] mt-0.5">{reports.length} reportes registrados</p>
            </div>
            <Link href={`/app/reports/new?equipmentId=${equipment.id}`}>
              <Button size="sm" pill variant="secondary">Nuevo reporte</Button>
            </Link>
          </div>
          <CardBody className="p-2">
            {reports.length === 0 ? (
              <p className="px-4 py-8 text-center text-sm text-[var(--text-tertiary)]">
                Sin reportes para este equipo.
              </p>
            ) : (
              <ul className="space-y-1">
                {reports.map((r) => {
                  const cfg = REPORT_STATUS_CFG[r.status] ?? REPORT_STATUS_CFG.draft;
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
                              {REPORT_KIND_LABELS[r.reportKind] ?? r.reportKind} · {formatRelative(r.date)}
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

      {/* QR card */}
      <Card>
        <div className="px-6 py-5 border-b border-[var(--border-subtle)]">
          <h3 className="text-sm font-semibold text-[var(--text-primary)]">Código QR</h3>
          <p className="text-2xs text-[var(--text-tertiary)] mt-0.5">
            {qrCode ? "QR vinculado a este equipo." : "Este equipo aún no tiene un QR asignado."}
          </p>
        </div>
        <CardBody className="space-y-4">
          {qrCode ? (
            <div className="flex flex-col sm:flex-row items-center gap-6">
              <div className="flex justify-center p-4 bg-white rounded-xl shrink-0">
                <QRCodeSVG value={qrValue} size={140} />
              </div>
              <div className="min-w-0 space-y-1">
                <p className="font-mono text-sm text-[var(--text-primary)] font-semibold">{qrCode}</p>
                <p className="text-2xs text-[var(--text-tertiary)]">{qrValue}</p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Generate new QR */}
              <div className="flex items-start gap-3 p-4 rounded-xl bg-[var(--bg-hover)]">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-[var(--text-primary)]">Generar QR nuevo</p>
                  <p className="text-2xs text-[var(--text-tertiary)] mt-0.5">
                    Crea y vincula automáticamente un código QR a este equipo.
                  </p>
                </div>
                <Button
                  size="sm"
                  pill
                  loading={isGenerating}
                  onClick={handleGenerateQr}
                  type="button"
                >
                  Generar
                </Button>
              </div>
              {qrError && (
                <p className="text-2xs text-[var(--danger-fg)]">{qrError}</p>
              )}

              {/* Assign existing QR */}
              <div className="space-y-2">
                <p className="text-xs font-medium text-[var(--text-secondary)]">
                  O asignar un código QR existente
                </p>
                <div className="flex gap-2">
                  <Input
                    value={assignInput}
                    onChange={(e) => setAssignInput(e.target.value)}
                    placeholder="MTL-XXXX-XXXX"
                    className="flex-1 font-mono"
                  />
                  <Button
                    size="sm"
                    pill
                    variant="secondary"
                    loading={isAssigning}
                    onClick={handleAssignQr}
                    type="button"
                  >
                    Asignar
                  </Button>
                </div>
                {assignError && (
                  <p className="text-2xs text-[var(--danger-fg)]">{assignError}</p>
                )}
              </div>
            </div>
          )}
        </CardBody>
      </Card>

      {/* M4 — Mobile sticky footer */}
      <div className="lg:hidden fixed bottom-16 inset-x-0 z-40 px-4 pb-2 flex gap-2">
        <Link href={`/app/reports/new?equipmentId=${equipment.id}`} className="flex-1">
          <button
            type="button"
            className="w-full flex items-center justify-center gap-2 h-11 rounded-xl bg-[var(--accent-500)] text-white text-sm font-medium shadow-lg"
          >
            <FileText className="h-4 w-4" />
            Generar reporte
          </button>
        </Link>
        {qrCode ? (
          <button
            type="button"
            onClick={() => setQrOpen(true)}
            className="flex items-center justify-center gap-2 h-11 px-4 rounded-xl bg-[var(--bg-card)] border border-[var(--border-subtle)] text-[var(--text-primary)] text-sm font-medium shadow-lg"
          >
            <QrCode className="h-4 w-4" />
            Ver QR
          </button>
        ) : (
          <button
            type="button"
            onClick={handleGenerateQr}
            disabled={isGenerating}
            className="flex items-center justify-center gap-2 h-11 px-4 rounded-xl bg-[var(--bg-card)] border border-[var(--border-subtle)] text-[var(--text-primary)] text-sm font-medium shadow-lg disabled:opacity-60"
          >
            <QrCode className="h-4 w-4" />
            {isGenerating ? "Generando…" : "Generar QR"}
          </button>
        )}
      </div>

      {/* D4b — QR modal */}
      {qrOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
          onClick={() => setQrOpen(false)}
        >
          <div
            className="bg-[var(--bg-card)] rounded-2xl p-6 space-y-4 max-w-xs w-full text-center shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-[var(--text-primary)]">Código QR</h3>
              <button
                type="button"
                onClick={() => setQrOpen(false)}
                className="grid h-7 w-7 place-items-center rounded-full bg-[var(--bg-hover)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
            <div className="flex justify-center p-4 bg-white rounded-xl">
              <QRCodeSVG value={qrValue} size={180} />
            </div>
            <p className="font-mono text-xs text-[var(--text-tertiary)]">{qrCode}</p>
            <p className="text-2xs text-[var(--text-tertiary)]">{equipment.name}</p>
          </div>
        </div>
      )}
    </div>
  );
}

function TemplateFieldWithDefault({
  field,
  defaultValue,
}: {
  field: import("@/lib/equipment/templates").EquipmentField;
  defaultValue: string;
}) {
  const name = `data_${field.id}`;
  const label = (
    <label className="block text-2xs font-medium text-[var(--text-secondary)] mb-1.5">
      {field.label}
      {field.unit && (
        <span className="text-[var(--text-tertiary)] ml-1">({field.unit})</span>
      )}
    </label>
  );

  if (field.type === "select" && field.options) {
    const opts = field.options.map((o: any) =>
      typeof o === "string" ? { value: o, label: o } : o,
    );
    return (
      <div>
        {label}
        <Select name={name} defaultValue={defaultValue}>
          <option value="">—</option>
          {opts.map((o: { value: string; label: string }) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </Select>
      </div>
    );
  }

  if (field.type === "date") {
    return <DateFieldEditor name={name} label={label} defaultValue={defaultValue} />;
  }

  return (
    <div>
      {label}
      <Input
        name={name}
        type={field.type === "number" ? "number" : "text"}
        defaultValue={defaultValue}
        placeholder={field.placeholder}
      />
    </div>
  );
}

function DateFieldEditor({
  name,
  label,
  defaultValue,
}: {
  name: string;
  label: React.JSX.Element;
  defaultValue: string;
}) {
  const [value, setValue] = useState(defaultValue);
  return (
    <div>
      {label}
      <DatePicker value={value} onChange={setValue} placeholder="Seleccionar fecha" />
      <input type="hidden" name={name} value={value} />
    </div>
  );
}