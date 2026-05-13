"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardBody } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { createEquipment } from "@/lib/actions/equipment";
import {
  HARDCODED_EQUIPMENT_TEMPLATES,
  type EquipmentField,
} from "@/lib/equipment/templates";
import { getEquipmentFormFields } from "@/lib/equipment/resolver";
import type { FormField } from "@/lib/types";
import type { Client, Location, EquipmentType } from "@/lib/types";

interface Props {
  clients: Client[];
  locations: Location[];
  equipmentTypes: EquipmentType[];
}

export function NewEquipmentForm({
  clients,
  locations,
  equipmentTypes,
}: Props) {
  const router = useRouter();
  const search = useSearchParams();
  const presetClientId = search.get("clientId") ?? "";

  const [clientId, setClientId] = useState(presetClientId);
  const [locationId, setLocationId] = useState("");
  const [typeId, setTypeId] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const filteredLocations = useMemo(
    () => locations.filter((l) => l.clientId === clientId),
    [locations, clientId],
  );

  // Reset location when client changes
  useEffect(() => {
    setLocationId("");
  }, [clientId]);

  const selectedType = equipmentTypes.find((t) => t.id === typeId);
  // Try store resolver first (Form Builder), fall back to hardcoded
  const storeFields = typeId ? getEquipmentFormFields(typeId) : [];
  const hardcodedTemplate = selectedType
    ? HARDCODED_EQUIPMENT_TEMPLATES.find((t) => t.typeSlug === selectedType.slug)
    : undefined;
  const templateFields: (FormField | EquipmentField)[] =
    storeFields.length > 0 ? storeFields : (hardcodedTemplate?.fields ?? []);

  async function handleSubmit(formData: FormData) {
    setError(null);
    setSubmitting(true);
    formData.set("clientId", clientId);
    formData.set("locationId", locationId);
    formData.set("equipmentTypeId", typeId);
    const res = await createEquipment(formData);
    setSubmitting(false);
    if (!res.ok) {
      setError(res.error ?? "No se pudo crear el equipo.");
      return;
    }
    if (res.equipmentId) router.push(`/app/equipment/${res.equipmentId}`);
  }

  return (
    <div className="space-y-6">
      <Link
        href="/app/equipment"
        className="inline-flex items-center gap-1.5 text-2xs text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]"
      >
        <ArrowLeft className="h-3 w-3" />
        Volver a equipos
      </Link>

      <PageHeader
        title="Nuevo equipo"
        description="Datos básicos primero, después los detalles según el tipo."
      />

      <form action={handleSubmit} className="space-y-6 max-w-2xl">
        <Card>
          <CardBody className="space-y-4">
            <div>
              <label className="block text-2xs font-medium text-[var(--text-secondary)] mb-1.5">
                Nombre del equipo *
              </label>
              <Input
                name="name"
                placeholder="Cámara entrada principal"
                required
                autoFocus
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-2xs font-medium text-[var(--text-secondary)] mb-1.5">
                  Cliente *
                </label>
                <Select
                  value={clientId}
                  onChange={(e) => setClientId(e.target.value)}
                  required
                >
                  <option value="">Elegí cliente…</option>
                  {clients.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </Select>
              </div>
              <div>
                <label className="block text-2xs font-medium text-[var(--text-secondary)] mb-1.5">
                  Ubicación *
                </label>
                <Select
                  value={locationId}
                  onChange={(e) => setLocationId(e.target.value)}
                  required
                  disabled={!clientId}
                >
                  <option value="">
                    {clientId ? "Elegí ubicación…" : "Primero el cliente"}
                  </option>
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
                  Tipo de equipo *
                </label>
                <Select
                  value={typeId}
                  onChange={(e) => setTypeId(e.target.value)}
                  required
                >
                  <option value="">Elegí tipo…</option>
                  {equipmentTypes.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))}
                </Select>
              </div>
              <div>
                <label className="block text-2xs font-medium text-[var(--text-secondary)] mb-1.5">
                  Código interno
                </label>
                <Input
                  name="internalCode"
                  placeholder="Auto-generado si vacío"
                />
              </div>
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
              <p className="text-2xs text-[var(--text-tertiary)] mt-0.5">
                Todos los campos son opcionales. Podés completar después.
              </p>
            </div>
            <CardBody className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {templateFields.map((f) => (
                <TemplateFieldInput key={f.id} field={f as EquipmentField} />
              ))}
            </CardBody>
          </Card>
        )}

        {error && (
          <div className="rounded-xl bg-[var(--danger-bg)] border border-[var(--danger-border)] px-4 py-3 text-sm text-[var(--danger-fg)]">
            {error}
          </div>
        )}

        <div className="flex items-center justify-end gap-2">
          <Link href="/app/equipment">
            <Button type="button" variant="ghost" pill>
              Cancelar
            </Button>
          </Link>
          <Button type="submit" pill loading={submitting}>
            Crear equipo
          </Button>
        </div>
      </form>
    </div>
  );
}

export function TemplateFieldInput({ field }: { field: EquipmentField }) {
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
    const opts = (field.options as any[]).map((o) =>
      typeof o === "string" ? { value: o, label: o } : o,
    );
    return (
      <div>
        {label}
        <Select name={name}>
          <option value="">—</option>
          {opts.map((o: { value: string; label: string }) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </Select>
        {field.hint && (
          <p className="mt-1 text-2xs text-[var(--text-tertiary)]">{field.hint}</p>
        )}
      </div>
    );
  }

  if (field.type === "textarea") {
    return (
      <div className="md:col-span-2">
        {label}
        <textarea
          name={name}
          rows={3}
          className="w-full bg-[var(--bg-input)] border border-[var(--border-default)] rounded-xl text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:border-[var(--accent-500)] focus:ring-2 focus:ring-[var(--accent-500)]/20 px-3.5 py-2.5 text-sm"
        />
        {field.hint && (
          <p className="mt-1 text-2xs text-[var(--text-tertiary)]">{field.hint}</p>
        )}
      </div>
    );
  }

  return (
    <div>
      {label}
      <Input
        name={name}
        type={field.type === "number" ? "number" : field.type === "date" ? "date" : "text"}
        placeholder={field.placeholder}
      />
      {field.hint && (
        <p className="mt-1 text-2xs text-[var(--text-tertiary)]">{field.hint}</p>
      )}
    </div>
  );
}
