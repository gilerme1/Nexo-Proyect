"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, ScanLine } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { createEquipment } from "@/lib/actions/equipment";
import { bindQrTag } from "@/lib/actions/qr";
import type { Client, Location, EquipmentType } from "@/lib/types";

interface Props {
  tagCode: string;
  tagId: string;
  tenantId: string;
  clients: Client[];
  locations: Location[];
  equipmentTypes: EquipmentType[];
}

type Step = "form" | "success";

export function QrQuickCreate({
  tagCode,
  tagId,
  tenantId,
  clients,
  locations,
  equipmentTypes,
}: Props) {
  const router = useRouter();
  const [step, setStep] = useState<Step>("form");
  const [clientId, setClientId] = useState("");
  const [locationId, setLocationId] = useState("");
  const [typeId, setTypeId] = useState("");
  const [name, setName] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [createdId, setCreatedId] = useState<string | null>(null);

  const filteredLocations = useMemo(
    () => locations.filter((l) => l.clientId === clientId),
    [locations, clientId],
  );

  const isValid = name.trim() && clientId && locationId && typeId;

  async function handleSubmit() {
    if (!isValid) return;
    setError(null);
    setSubmitting(true);

    const fd = new FormData();
    fd.set("name", name.trim());
    fd.set("clientId", clientId);
    fd.set("locationId", locationId);
    fd.set("equipmentTypeId", typeId);
    fd.set("isDraft", "true");
    fd.set("qrCode", tagCode);
    fd.set("createdFromQrTagId", tagId);

    const res = await createEquipment(fd);
    if (!res.ok) {
      setError(res.error ?? "No se pudo crear el equipo.");
      setSubmitting(false);
      return;
    }

    // Bind QR to new equipment
    if (res.equipmentId) {
      await bindQrTag(tagCode, res.equipmentId);
      setCreatedId(res.equipmentId);
    }

    setSubmitting(false);
    setStep("success");
  }

  if (step === "success") {
    return (
      <div className="space-y-4 text-center">
        <span className="grid h-16 w-16 place-items-center rounded-2xl bg-[var(--success-bg)] text-[var(--success-fg)] mx-auto">
          <CheckCircle2 className="h-8 w-8" />
        </span>
        <div>
          <h2 className="text-lg font-semibold text-[var(--text-primary)]">
            ¡Equipo registrado!
          </h2>
          <p className="text-sm text-[var(--text-secondary)] mt-1">
            <strong>{name}</strong> quedó vinculado a este QR.
            Podés completar los detalles después desde la app.
          </p>
        </div>

        <div className="flex flex-col gap-2 w-full">
          <Button
            onClick={() => createdId && router.push(`/app/equipment/${createdId}`)}
            pill
            className="w-full"
          >
            Completar ficha ahora
          </Button>
          <Button
            onClick={() => router.push("/app/equipment")}
            variant="secondary"
            pill
            className="w-full"
            leftIcon={<ScanLine className="h-3.5 w-3.5" />}
          >
            Volver a equipos
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 w-full">
      {/* Name */}
      <div>
        <label className="block text-2xs font-medium text-[var(--text-secondary)] mb-1.5">
          Nombre del equipo *
        </label>
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Cámara entrada principal"
          autoFocus
        />
      </div>

      {/* Client */}
      <div>
        <label className="block text-2xs font-medium text-[var(--text-secondary)] mb-1.5">
          Cliente *
        </label>
        <Select
          value={clientId}
          onChange={(e) => { setClientId(e.target.value); setLocationId(""); }}
        >
          <option value="">Seleccioná cliente…</option>
          {clients.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </Select>
      </div>

      {/* Location */}
      <div>
        <label className="block text-2xs font-medium text-[var(--text-secondary)] mb-1.5">
          Ubicación *
        </label>
        <Select
          value={locationId}
          onChange={(e) => setLocationId(e.target.value)}
          disabled={!clientId}
        >
          <option value="">{clientId ? "Seleccioná ubicación…" : "Primero el cliente"}</option>
          {filteredLocations.map((l) => (
            <option key={l.id} value={l.id}>{l.name}</option>
          ))}
        </Select>
      </div>

      {/* Equipment type */}
      <div>
        <label className="block text-2xs font-medium text-[var(--text-secondary)] mb-1.5">
          Tipo de equipo *
        </label>
        <Select value={typeId} onChange={(e) => setTypeId(e.target.value)}>
          <option value="">Seleccioná tipo…</option>
          {equipmentTypes.map((t) => (
            <option key={t.id} value={t.id}>{t.name}</option>
          ))}
        </Select>
      </div>

      {error && (
        <div className="rounded-lg bg-[var(--danger-bg)] border border-[var(--danger-border)] px-3 py-2 text-2xs text-[var(--danger-fg)]">
          {error}
        </div>
      )}

      <p className="text-2xs text-[var(--text-tertiary)]">
        * Campos mínimos para registrar. Podés completar los detalles técnicos después desde la app.
      </p>

      <Button
        onClick={handleSubmit}
        pill
        loading={submitting}
        disabled={!isValid}
        className="w-full"
      >
        Registrar equipo
      </Button>
    </div>
  );
}
