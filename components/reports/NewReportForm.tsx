"use client";

import { useState, useMemo, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft, Camera, X, Plus, Trash2,
  ClipboardList, Wrench, CheckSquare, Loader2,
} from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardBody } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { SignaturePad } from "./SignaturePad";
import { createReport } from "@/lib/actions/reports";
import { buildInitialChecklists } from "@/lib/reports/checklists";
import { cn } from "@/lib/utils/cn";
import type { Equipment, Client, Location, ScheduledMaintenance, ReportChecklist, ChecklistItem } from "@/lib/types";

interface Props {
  equipment: Equipment[];
  clients: Client[];
  locations: Location[];
  equipmentTypes: { id: string; slug: string; name: string }[];
  scheduledMaintenances: ScheduledMaintenance[];
}

interface PhotoPreview {
  url: string;
  caption: string;
  uploading?: boolean;
}

const SECTION_LABELS: Record<string, string> = {
  instalacion: "INSTALACIÓN",
  mantenimiento: "MANTENIMIENTO",
};

export function NewReportForm({ equipment, clients, locations, equipmentTypes, scheduledMaintenances }: Props) {
  const router = useRouter();
  const search = useSearchParams();
  const presetEquipmentId = search.get("equipmentId") ?? "";
  const presetScheduledId = search.get("scheduledId") ?? "";

  const [equipmentId, setEquipmentId] = useState(presetEquipmentId);
  const [checklists, setChecklists] = useState<ReportChecklist[]>([]);
  const [photos, setPhotos] = useState<PhotoPreview[]>([]);
  const [signature, setSignature] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // When equipment changes, load the checklist for that equipment type
  function handleEquipmentChange(eqId: string) {
    setEquipmentId(eqId);
    const eq = equipment.find((e) => e.id === eqId);
    if (!eq) { setChecklists([]); return; }
    const eqType = equipmentTypes.find((t) => t.id === eq.equipmentTypeId);
    const slug = eqType?.slug ?? "";
    setChecklists(buildInitialChecklists(slug));
  }

  // Toggle section enabled
  function toggleSection(section: string) {
    setChecklists((prev) =>
      prev.map((c) => c.section === section ? { ...c, enabled: !c.enabled } : c),
    );
  }

  // Set item value (si/no/na)
  function setItemValue(section: string, itemId: string, value: ChecklistItem["value"]) {
    setChecklists((prev) =>
      prev.map((c) =>
        c.section !== section ? c : {
          ...c,
          items: c.items.map((item) => item.id === itemId ? { ...item, value } : item),
        },
      ),
    );
  }

  // Set measurement
  function setMeasurement(section: string, itemId: string, measurement: string) {
    setChecklists((prev) =>
      prev.map((c) =>
        c.section !== section ? c : {
          ...c,
          items: c.items.map((item) =>
            item.id === itemId ? { ...item, measurement } : item,
          ),
        },
      ),
    );
  }

  // Add custom item
  function addCustomItem(section: string) {
    const newItem: ChecklistItem = {
      id: `custom_${Date.now()}`,
      label: "",
      value: null,
      custom: true,
    };
    setChecklists((prev) =>
      prev.map((c) =>
        c.section !== section ? c : { ...c, items: [...c.items, newItem] },
      ),
    );
  }

  // Update custom item label
  function updateCustomLabel(section: string, itemId: string, label: string) {
    setChecklists((prev) =>
      prev.map((c) =>
        c.section !== section ? c : {
          ...c,
          items: c.items.map((item) => item.id === itemId ? { ...item, label } : item),
        },
      ),
    );
  }

  // Remove item
  function removeItem(section: string, itemId: string) {
    setChecklists((prev) =>
      prev.map((c) =>
        c.section !== section ? c : {
          ...c,
          items: c.items.filter((item) => item.id !== itemId),
        },
      ),
    );
  }

  // Photos
  async function handlePhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []).slice(0, 2 - photos.length);
    for (const file of files) {
      if (!file.type.startsWith("image/")) continue;

      setPhotos((prev) => [...prev, { url: "", caption: "", uploading: true }]);

      const fd = new FormData();
      fd.append("file", file);
      fd.append("upload_preset", process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET!);

      try {
        const res = await fetch(
          `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
          { method: "POST", body: fd },
        );
        const data = await res.json();
        setPhotos((prev) => {
          const idx = prev.findIndex((p) => p.uploading && p.url === "");
          if (idx === -1) return prev;
          const next = [...prev];
          next[idx] = { url: data.secure_url, caption: "", uploading: false };
          return next;
        });
      } catch {
        setPhotos((prev) => prev.filter((p) => !(p.uploading && p.url === "")));
      }
    }
    e.target.value = "";
  }

  async function handleSubmit(formData: FormData) {
    setError(null);
    setSubmitting(true);
    const selectedEq = equipment.find((e) => e.id === equipmentId);
    formData.set("equipmentId", equipmentId);
    formData.set("clientId", selectedEq?.clientId ?? "");
    formData.set("locationId", selectedEq?.locationId ?? "");
    if (signature) formData.set("signatureDataUrl", signature);
    const uploadedPhotos = photos.filter((p) => !p.uploading && p.url);
    if (uploadedPhotos.length > 0) {
      formData.set("photosJson", JSON.stringify(uploadedPhotos.map((p) => ({ url: p.url, caption: p.caption }))));
    }
    if (checklists.length > 0) {
      formData.set("checklistsJson", JSON.stringify(checklists));
    }
    const res = await createReport(formData);
    setSubmitting(false);
    if (!res.ok) { setError(res.error ?? "Error al crear el reporte."); return; }
    router.push(`/app/reports/${res.reportId}`);
  }

  const selectedEq = equipment.find((e) => e.id === equipmentId);
  const client = clients.find((c) => c.id === selectedEq?.clientId);
  const loc = locations.find((l) => l.id === selectedEq?.locationId);
  const eqType = equipmentTypes.find((t) => t.id === selectedEq?.equipmentTypeId);
  const pendingScheduled = scheduledMaintenances.filter(
    (sm) => sm.equipmentId === equipmentId && (sm.status === "scheduled" || sm.status === "overdue"),
  );

  const enabledSections = checklists.filter((c) => c.enabled);
  const answeredCount = enabledSections.flatMap((c) => c.items).filter((i) => i.value !== null).length;
  const totalItems = enabledSections.flatMap((c) => c.items).length;

  return (
    <div className="space-y-6">
      <Link href="/app/reports" className="inline-flex items-center gap-1.5 text-2xs text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]">
        <ArrowLeft className="h-3 w-3" />
        Volver a reportes
      </Link>

      <PageHeader
        title="Nuevo reporte"
        description="Completá el checklist, adjuntá fotos y capturá la firma."
      />

      <form action={handleSubmit} className="space-y-6">
        {/* ── Sección 1: Datos generales ── */}
        <Card>
          <div className="px-6 py-4 border-b border-[var(--border-subtle)]">
            <h2 className="text-sm font-semibold text-[var(--text-primary)] flex items-center gap-2">
              <ClipboardList className="h-4 w-4 text-[var(--accent-500)]" />
              Datos generales
            </h2>
          </div>
          <CardBody className="space-y-4">
            <div>
              <label className="block text-2xs font-medium text-[var(--text-secondary)] mb-1.5">Equipo *</label>
              <Select value={equipmentId} onChange={(e) => handleEquipmentChange(e.target.value)} required>
                <option value="">Seleccioná el equipo…</option>
                {equipment.map((eq) => {
                  const c = clients.find((c) => c.id === eq.clientId);
                  return (
                    <option key={eq.id} value={eq.id}>
                      {eq.name} — {c?.name ?? "—"} ({eq.internalCode})
                    </option>
                  );
                })}
              </Select>
            </div>

            {/* Equipment summary card */}
            {selectedEq && (
              <div className="bg-[var(--bg-hover)] rounded-xl px-4 py-3 grid grid-cols-2 gap-x-6 gap-y-1.5 text-2xs">
                {[
                  ["Tipo", eqType?.name],
                  ["Cliente", client?.name],
                  ["Ubicación", loc?.name],
                  ["Código", selectedEq.internalCode],
                ].map(([k, v]) => v && (
                  <div key={k}>
                    <span className="text-[var(--text-tertiary)]">{k}: </span>
                    <span className="text-[var(--text-primary)] font-medium">{v}</span>
                  </div>
                ))}
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              {pendingScheduled.length > 0 && (
                <div className="col-span-2">
                  <label className="block text-2xs font-medium text-[var(--text-secondary)] mb-1.5">
                    Mantenimiento programado
                  </label>
                  <Select name="scheduledMaintenanceId" defaultValue={presetScheduledId}>
                    <option value="">— No corresponde a uno programado —</option>
                    {pendingScheduled.map((sm) => (
                      <option key={sm.id} value={sm.id}>
                        {sm.title} {sm.status === "overdue" ? "⚠️ Vencido" : ""}
                      </option>
                    ))}
                  </Select>
                </div>
              )}
              <div>
                <label className="block text-2xs font-medium text-[var(--text-secondary)] mb-1.5">Duración</label>
                <Input name="durationMinutes" type="number" placeholder="minutos" min="1" />
              </div>
            </div>
          </CardBody>
        </Card>

        {/* ── Sección 2: Checklists ── */}
        {checklists.length > 0 && (
          <Card>
            <div className="px-6 py-4 border-b border-[var(--border-subtle)] flex items-center justify-between">
              <h2 className="text-sm font-semibold text-[var(--text-primary)] flex items-center gap-2">
                <CheckSquare className="h-4 w-4 text-[var(--accent-500)]" />
                Checklist de trabajo
              </h2>
              {totalItems > 0 && (
                <span className="text-2xs text-[var(--text-tertiary)] tabular">
                  {answeredCount}/{totalItems} respondidos
                </span>
              )}
            </div>

            {/* Section toggles */}
            <div className="px-6 py-4 flex gap-3 border-b border-[var(--border-subtle)]">
              {checklists.map((c) => (
                <button
                  key={c.section}
                  type="button"
                  onClick={() => toggleSection(c.section)}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2 rounded-xl border-2 text-sm font-bold tracking-wide transition-all",
                    c.enabled
                      ? "border-[var(--accent-500)] bg-[var(--info-bg)] text-[var(--accent-400)]"
                      : "border-[var(--border-default)] text-[var(--text-tertiary)] hover:border-[var(--border-strong)]",
                  )}
                >
                  <span className={cn(
                    "h-5 w-5 rounded border-2 flex items-center justify-center shrink-0",
                    c.enabled ? "border-[var(--accent-500)] bg-[var(--accent-500)]" : "border-[var(--border-strong)]",
                  )}>
                    {c.enabled && <span className="text-white text-xs font-bold">✓</span>}
                  </span>
                  {SECTION_LABELS[c.section] ?? c.section.toUpperCase()}
                </button>
              ))}
            </div>

            {/* Items per enabled section */}
            {checklists.filter((c) => c.enabled).map((c) => (
              <div key={c.section}>
                <div className="px-6 py-3 bg-[var(--bg-hover)] border-b border-[var(--border-subtle)]">
                  <p className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-widest">
                    {SECTION_LABELS[c.section]}
                  </p>
                </div>

                <div className="divide-y divide-[var(--border-subtle)]">
                  {c.items.map((item, idx) => (
                    <ChecklistRow
                      key={item.id}
                      item={item}
                      index={idx + 1}
                      onValue={(v) => setItemValue(c.section, item.id, v)}
                      onMeasurement={(m) => setMeasurement(c.section, item.id, m)}
                      onLabelChange={item.custom ? (l) => updateCustomLabel(c.section, item.id, l) : undefined}
                      onRemove={() => removeItem(c.section, item.id)}
                    />
                  ))}
                </div>

                <div className="px-6 py-3 border-t border-[var(--border-subtle)]">
                  <button
                    type="button"
                    onClick={() => addCustomItem(c.section)}
                    className="flex items-center gap-1.5 text-2xs text-[var(--accent-400)] hover:text-[var(--accent-300)] font-medium"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    Agregar ítem personalizado
                  </button>
                </div>
              </div>
            ))}

            {checklists.every((c) => !c.enabled) && (
              <div className="px-6 py-8 text-center text-sm text-[var(--text-tertiary)]">
                Activá al menos una sección para cargar el checklist
              </div>
            )}
          </Card>
        )}

        {/* ── Sección 3: Observaciones ── */}
        <Card>
          <div className="px-6 py-4 border-b border-[var(--border-subtle)]">
            <h2 className="text-sm font-semibold text-[var(--text-primary)]">Observaciones</h2>
            <p className="text-2xs text-[var(--text-tertiary)] mt-0.5">
              Describí el trabajo realizado, problemas encontrados y soluciones aplicadas.
            </p>
          </div>
          <CardBody>
            <textarea
              name="observations"
              rows={4}
              placeholder="Ej: Se realizó limpieza completa de filtros y evaporador. Presiones correctas. Temperatura de salida: 18°C."
              className="w-full bg-[var(--bg-input)] border border-[var(--border-default)] rounded-xl text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:border-[var(--accent-500)] focus:ring-2 focus:ring-[var(--accent-500)]/20 px-3.5 py-3 text-sm resize-none"
            />
          </CardBody>
        </Card>

        {/* ── Sección 4: Fotos ── */}
        <Card>
          <div className="px-6 py-4 border-b border-[var(--border-subtle)]">
            <h2 className="text-sm font-semibold text-[var(--text-primary)]">
              Fotos{photos.length > 0 && ` (${photos.length})`}
            </h2>
            <p className="text-2xs text-[var(--text-tertiary)] mt-0.5">
              Fotos del equipo, del problema detectado y del resultado final.
            </p>
          </div>
          <CardBody className="space-y-4">
            {photos.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {photos.map((p, i) => (
                  <div key={i} className="relative rounded-xl overflow-hidden border border-[var(--border-subtle)]">
                    {p.uploading ? (
                      <div className="w-full aspect-square bg-[var(--bg-hover)] flex items-center justify-center">
                        <Loader2 className="h-6 w-6 text-[var(--text-tertiary)] animate-spin" />
                      </div>
                    ) : (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={p.url} alt={`Foto ${i + 1}`} className="w-full aspect-square object-cover" />
                    )}
                    <button
                      type="button"
                      onClick={() => setPhotos((prev) => prev.filter((_, j) => j !== i))}
                      className="absolute top-1.5 right-1.5 grid h-6 w-6 place-items-center rounded-full bg-black/60 text-white hover:bg-black/80"
                    >
                      <X className="h-3 w-3" />
                    </button>
                    {!p.uploading && (
                      <input
                        type="text"
                        value={p.caption}
                        onChange={(e) => setPhotos((prev) => prev.map((ph, j) => j === i ? { ...ph, caption: e.target.value } : ph))}
                        placeholder="Descripción…"
                        className="w-full bg-[var(--bg-input)] border-t border-[var(--border-subtle)] px-2 py-1.5 text-2xs outline-none"
                      />
                    )}
                  </div>
                ))}
              </div>
            )}
            {photos.length < 2 && (
              <label className="flex items-center justify-center gap-2 h-16 rounded-xl border-2 border-dashed border-[var(--border-default)] cursor-pointer hover:border-[var(--accent-500)] hover:bg-[var(--info-bg)] text-[var(--text-tertiary)] hover:text-[var(--accent-400)]">
                <Camera className="h-4 w-4" />
                <span className="text-sm">{photos.length === 0 ? "Agregar fotos" : "Agregar más"}</span>
                <input type="file" accept="image/*" multiple capture="environment" className="sr-only" onChange={handlePhoto} />
              </label>
            )}
          </CardBody>
        </Card>

        {/* ── Sección 5: Firma ── */}
        <Card>
          <div className="px-6 py-4 border-b border-[var(--border-subtle)]">
            <h2 className="text-sm font-semibold text-[var(--text-primary)]">Conformidad del cliente</h2>
            <p className="text-2xs text-[var(--text-tertiary)] mt-0.5">
              Opcional. Si el cliente está presente puede firmar acá con el dedo o el mouse.
            </p>
          </div>
          <CardBody>
            <SignaturePad onChange={setSignature} />
            {signature && (
              <p className="mt-2 text-2xs text-[var(--success-fg)] flex items-center gap-1">
                ✓ Firma capturada
              </p>
            )}
          </CardBody>
        </Card>

        {error && (
          <div className="rounded-xl bg-[var(--danger-bg)] border border-[var(--danger-border)] px-4 py-3 text-sm text-[var(--danger-fg)]">
            {error}
          </div>
        )}

        <div className="flex items-center justify-end gap-2 pb-6">
          <Link href="/app/reports">
            <Button type="button" variant="ghost" pill>Cancelar</Button>
          </Link>
          <Button type="submit" pill loading={submitting} disabled={!equipmentId}>
            {signature ? "Guardar reporte con firma" : "Guardar reporte"}
          </Button>
        </div>
      </form>
    </div>
  );
}

// ============================================================================
// ChecklistRow — single item with SI/NO/N/A toggles + optional measurement
// ============================================================================

function ChecklistRow({
  item, index, onValue, onMeasurement, onLabelChange, onRemove,
}: {
  item: ChecklistItem;
  index: number;
  onValue: (v: ChecklistItem["value"]) => void;
  onMeasurement: (m: string) => void;
  onLabelChange?: (label: string) => void;
  onRemove: () => void;
}) {
  const hasMeasurement = item.measurement !== undefined;

  return (
    <div className={cn(
      "flex items-center gap-3 px-6 py-3",
      item.value === "si" && "bg-[var(--success-bg)]/30",
      item.value === "no" && "bg-[var(--danger-bg)]/20",
    )}>
      {/* Index */}
      <span className="text-2xs text-[var(--text-tertiary)] tabular w-5 shrink-0 text-right">{index}</span>

      {/* Label */}
      <div className="flex-1 min-w-0">
        {onLabelChange ? (
          <input
            type="text"
            value={item.label}
            onChange={(e) => onLabelChange(e.target.value)}
            placeholder="Descripción del ítem…"
            className="w-full text-sm text-[var(--text-primary)] bg-transparent border-b border-[var(--border-default)] focus:border-[var(--accent-500)] outline-none pb-0.5"
            autoFocus
          />
        ) : (
          <p className="text-sm text-[var(--text-primary)]">{item.label}</p>
        )}
        {item.unit && !hasMeasurement && (
          <p className="text-2xs text-[var(--text-tertiary)]">{item.unit}</p>
        )}
      </div>

      {/* Measurement field */}
      {hasMeasurement && (
        <div className="flex items-center gap-1.5 shrink-0">
          <input
            type="text"
            inputMode="decimal"
            value={item.measurement ?? ""}
            onChange={(e) => onMeasurement(e.target.value)}
            placeholder="—"
            className="w-16 h-8 text-center text-sm tabular bg-[var(--bg-input)] border border-[var(--border-default)] rounded-lg outline-none focus:border-[var(--accent-500)]"
          />
          <span className="text-2xs text-[var(--text-tertiary)] whitespace-nowrap">{item.unit}</span>
        </div>
      )}

      {/* SI / NO / N/A toggles */}
      {!hasMeasurement && (
        <div className="flex items-center gap-1 shrink-0">
          {(["si", "no", "na"] as const).map((v) => (
            <button
              key={v}
              type="button"
              onClick={() => onValue(item.value === v ? null : v)}
              className={cn(
                "h-7 px-2.5 rounded-lg text-xs font-semibold border transition-all",
                item.value === v && v === "si" && "bg-[var(--success-fg)] text-white border-[var(--success-fg)]",
                item.value === v && v === "no" && "bg-[var(--danger-fg)] text-white border-[var(--danger-fg)]",
                item.value === v && v === "na" && "bg-[var(--text-tertiary)] text-white border-[var(--text-tertiary)]",
                item.value !== v && "border-[var(--border-default)] text-[var(--text-secondary)] hover:bg-[var(--bg-hover)]",
              )}
            >
              {v === "na" ? "N/A" : v.toUpperCase()}
            </button>
          ))}
        </div>
      )}

      {/* Remove */}
      <button
        type="button"
        onClick={onRemove}
        className="grid h-7 w-7 shrink-0 place-items-center rounded-lg text-[var(--text-tertiary)] hover:text-[var(--danger-fg)] hover:bg-[var(--danger-bg)] opacity-0 group-hover:opacity-100"
        aria-label="Eliminar"
      >
        <Trash2 className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
