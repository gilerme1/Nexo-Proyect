"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { Check, ArrowLeft, MapPin, Wrench, FileText } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardBody } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Badge } from "@/components/ui/Badge";
import { EquipmentStatusBadge } from "@/components/ui/EquipmentStatusBadge";
import { LocationMap } from "@/components/widgets/LocationMap";
import { updateLocation } from "@/lib/actions/clients";
import { formatRelative } from "@/lib/utils/format";
import type { Location, LocationStatus, Client, Equipment, MaintenanceReport, User } from "@/lib/types";

interface Props {
  location: Location;
  client: Client | undefined;
  equipment: Equipment[];
  reports: MaintenanceReport[];
  users: User[];
}

const STATUSES: { value: LocationStatus; label: string }[] = [
  { value: "operational", label: "Operativa" },
  { value: "attention",   label: "Requiere atención" },
  { value: "critical",    label: "Crítica" },
];

const STATUS_TONE: Record<LocationStatus, "success" | "warning" | "danger"> = {
  operational: "success",
  attention:   "warning",
  critical:    "danger",
};

const REPORT_STATUS: Record<string, { label: string; tone: "success" | "warning" | "neutral" }> = {
  completed: { label: "Completado", tone: "success" },
  observed:  { label: "Observado",  tone: "warning" },
  pending:   { label: "Pendiente",  tone: "warning" },
  draft:     { label: "Borrador",   tone: "neutral" },
};

export function LocationDetailEditor({ location, client, equipment, reports, users }: Props) {
  const [isPending, startTransition] = useTransition();
  const [savedAt, setSavedAt] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const mapPoints =
    location.latitude && location.longitude
      ? [{ id: location.id, name: location.name, latitude: location.latitude, longitude: location.longitude, status: location.status }]
      : [];

  function handleSubmit(formData: FormData) {
    formData.set("id", location.id);
    setError(null);
    startTransition(async () => {
      const res = await updateLocation(formData);
      if (res.ok) setSavedAt(Date.now());
      else setError(res.error ?? "Error al guardar.");
    });
  }

  return (
    <div className="space-y-6 pb-6">
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
          client ? (
            <Link href={`/app/clients/${client.id}`} className="hover:text-[var(--accent-400)]">
              {client.name}
            </Link>
          ) : undefined
        }
      />

      {/* Edit form */}
      <form action={handleSubmit} className="space-y-6">
        <Card>
          <div className="px-6 py-5 border-b border-[var(--border-subtle)]">
            <h3 className="text-sm font-semibold text-[var(--text-primary)]">Datos de la ubicación</h3>
          </div>
          <CardBody className="space-y-4">
            <div>
              <label className="block text-2xs font-medium text-[var(--text-secondary)] mb-1.5">
                Nombre *
              </label>
              <Input name="name" defaultValue={location.name} required />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-2xs font-medium text-[var(--text-secondary)] mb-1.5">
                  Dirección
                </label>
                <Input name="address" defaultValue={location.address ?? ""} placeholder="Av. Corrientes 1234" />
              </div>
              <div>
                <label className="block text-2xs font-medium text-[var(--text-secondary)] mb-1.5">
                  Ciudad
                </label>
                <Input name="city" defaultValue={location.city ?? ""} placeholder="Buenos Aires" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-2xs font-medium text-[var(--text-secondary)] mb-1.5">
                  País
                </label>
                <Input name="country" defaultValue={location.country ?? ""} placeholder="Argentina" />
              </div>
              <div>
                <label className="block text-2xs font-medium text-[var(--text-secondary)] mb-1.5">
                  Estado
                </label>
                <Select name="status" defaultValue={location.status}>
                  {STATUSES.map((s) => (
                    <option key={s.value} value={s.value}>{s.label}</option>
                  ))}
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-2xs font-medium text-[var(--text-secondary)] mb-1.5">
                  Latitud
                </label>
                <Input
                  name="latitude"
                  type="number"
                  step="any"
                  defaultValue={location.latitude ?? ""}
                  placeholder="-34.6037"
                />
              </div>
              <div>
                <label className="block text-2xs font-medium text-[var(--text-secondary)] mb-1.5">
                  Longitud
                </label>
                <Input
                  name="longitude"
                  type="number"
                  step="any"
                  defaultValue={location.longitude ?? ""}
                  placeholder="-58.3816"
                />
              </div>
            </div>

            <div>
              <label className="block text-2xs font-medium text-[var(--text-secondary)] mb-1.5">
                Notas internas
              </label>
              <Input name="notes" defaultValue={location.notes ?? ""} placeholder="Acceso por portería, pedir llave…" />
            </div>

            {error && (
              <p className="text-xs text-[var(--danger-fg)]">{error}</p>
            )}

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

      {/* Map preview */}
      {mapPoints.length > 0 && (
        <LocationMap points={mapPoints} height={260} emptyMessage="" />
      )}

      {/* Equipment */}
      <Card>
        <div className="flex items-center justify-between px-6 py-5 border-b border-[var(--border-subtle)]">
          <div>
            <h3 className="text-sm font-semibold text-[var(--text-primary)]">Equipos</h3>
            <p className="text-2xs text-[var(--text-tertiary)] mt-0.5">{equipment.length} equipos en esta ubicación</p>
          </div>
          <Badge tone={STATUS_TONE[location.status]} dot>
            {STATUSES.find((s) => s.value === location.status)?.label ?? location.status}
          </Badge>
        </div>
        <CardBody className="p-2">
          {equipment.length === 0 ? (
            <p className="px-4 py-8 text-center text-sm text-[var(--text-tertiary)]">Sin equipos en esta ubicación.</p>
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

      {/* Reports */}
      <Card>
        <div className="px-6 py-5 border-b border-[var(--border-subtle)]">
          <h3 className="text-sm font-semibold text-[var(--text-primary)]">Reportes del lugar</h3>
          <p className="text-2xs text-[var(--text-tertiary)] mt-0.5">{reports.length} reportes históricos</p>
        </div>
        <CardBody className="p-2">
          {reports.length === 0 ? (
            <p className="px-4 py-8 text-center text-sm text-[var(--text-tertiary)]">Sin reportes para esta ubicación.</p>
          ) : (
            <ul className="space-y-1">
              {reports.map((r) => {
                const eq = equipment.find((e) => e.id === r.equipmentId);
                const tech = users.find((u) => u.id === r.technicianId);
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
