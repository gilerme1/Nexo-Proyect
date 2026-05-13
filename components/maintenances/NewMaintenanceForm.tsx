"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Plus, CalendarClock } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Modal } from "@/components/ui/Modal";
import { createScheduledMaintenance } from "@/lib/actions/reports";
import type { Equipment, Client, Location } from "@/lib/types";

const FREQ_OPTIONS = [
  { value: "weekly", label: "Semanal" },
  { value: "biweekly", label: "Quincenal" },
  { value: "monthly", label: "Mensual" },
  { value: "bimonthly", label: "Bimestral" },
  { value: "quarterly", label: "Trimestral" },
  { value: "semiannual", label: "Semestral" },
  { value: "annual", label: "Anual" },
];

interface Props {
  equipment: Equipment[];
  clients: Client[];
  locations: Location[];
}

export function NewMaintenanceForm({ equipment, clients, locations }: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [equipmentId, setEquipmentId] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const selectedEq = equipment.find((e) => e.id === equipmentId);

  async function handleSubmit(fd: FormData) {
    setError(null);
    setSubmitting(true);
    fd.set("equipmentId", equipmentId);
    fd.set("clientId", selectedEq?.clientId ?? "");
    fd.set("locationId", selectedEq?.locationId ?? "");
    const res = await createScheduledMaintenance(fd);
    setSubmitting(false);
    if (!res.ok) { setError(res.error ?? "Error al crear."); return; }
    setOpen(false);
    router.refresh();
  }

  return (
    <>
      <Button
        onClick={() => setOpen(true)}
        size="sm"
        pill
        leftIcon={<Plus className="h-3.5 w-3.5" />}
      >
        Programar mantenimiento
      </Button>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Programar mantenimiento"
        description="Configurá la frecuencia y el equipo. Maintly te lo va a recordar en el calendario."
      >
        <form action={handleSubmit} className="px-6 py-5 space-y-4">
          <div>
            <label className="block text-2xs font-medium text-[var(--text-secondary)] mb-1.5">Título *</label>
            <Input name="title" placeholder="Ej: Limpieza mensual cámara entrada" required autoFocus />
          </div>
          <div>
            <label className="block text-2xs font-medium text-[var(--text-secondary)] mb-1.5">Equipo *</label>
            <Select value={equipmentId} onChange={(e) => setEquipmentId(e.target.value)} required>
              <option value="">Seleccioná equipo…</option>
              {equipment.map((eq) => {
                const client = clients.find((c) => c.id === eq.clientId);
                return (
                  <option key={eq.id} value={eq.id}>
                    {eq.name} — {client?.name ?? "—"}
                  </option>
                );
              })}
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-2xs font-medium text-[var(--text-secondary)] mb-1.5">Frecuencia *</label>
              <Select name="frequency" defaultValue="monthly">
                {FREQ_OPTIONS.map((f) => (
                  <option key={f.value} value={f.value}>{f.label}</option>
                ))}
              </Select>
            </div>
            <div>
              <label className="block text-2xs font-medium text-[var(--text-secondary)] mb-1.5">Próxima fecha *</label>
              <Input name="nextDueAt" type="date" required />
            </div>
          </div>
          <div>
            <label className="block text-2xs font-medium text-[var(--text-secondary)] mb-1.5">Descripción</label>
            <Input name="description" placeholder="Pasos a seguir, materiales necesarios…" />
          </div>

          {error && (
            <div className="rounded-lg bg-[var(--danger-bg)] border border-[var(--danger-border)] px-3 py-2 text-2xs text-[var(--danger-fg)]">
              {error}
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="ghost" pill onClick={() => setOpen(false)}>Cancelar</Button>
            <Button type="submit" pill loading={submitting}>Programar</Button>
          </div>
        </form>
      </Modal>
    </>
  );
}
