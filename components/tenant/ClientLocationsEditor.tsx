"use client";

import { useState } from "react";
import Link from "next/link";
import { MapPin, Plus, Wrench } from "lucide-react";
import { Card, CardBody } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { Badge } from "@/components/ui/Badge";
import { createLocation } from "@/lib/actions/clients";
import type { Location, Equipment } from "@/lib/types";

interface Props {
  clientId: string;
  locations: Location[];
  equipment: Equipment[];
}

export function ClientLocationsEditor({ clientId, locations, equipment }: Props) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleAdd(fd: FormData) {
    setError(null);
    fd.set("clientId", clientId);
    const res = await createLocation(fd);
    if (!res.ok) {
      setError(res.error ?? "No se pudo crear la ubicación.");
      return;
    }
    setOpen(false);
  }

  return (
    <Card>
      <div className="flex items-center justify-between px-6 py-5 border-b border-[var(--border-subtle)]">
        <div>
          <h3 className="text-sm font-semibold text-[var(--text-primary)]">
            Ubicaciones
          </h3>
          <p className="text-2xs text-[var(--text-tertiary)] mt-0.5">
            {locations.length} {locations.length === 1 ? "ubicación" : "ubicaciones"}
          </p>
        </div>
        <Button
          onClick={() => setOpen(true)}
          variant="secondary"
          size="sm"
          pill
          leftIcon={<Plus className="h-3.5 w-3.5" />}
        >
          Nueva ubicación
        </Button>
      </div>

      <CardBody className="p-2">
        {locations.length === 0 ? (
          <p className="px-4 py-8 text-center text-sm text-[var(--text-tertiary)]">
            Sin ubicaciones todavía. Agregá la primera.
          </p>
        ) : (
          <ul className="space-y-1">
            {locations.map((loc) => {
              const eqCount = equipment.filter((e) => e.locationId === loc.id).length;
              return (
                <li
                  key={loc.id}
                  className="flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-[var(--bg-hover)]"
                >
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[var(--bg-hover)] text-[var(--text-secondary)]">
                    <MapPin className="h-3.5 w-3.5" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-[var(--text-primary)]">
                      {loc.name}
                    </p>
                    <p className="text-2xs text-[var(--text-tertiary)] truncate">
                      {loc.address}
                      {loc.city && `, ${loc.city}`}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {loc.status === "attention" && (
                      <Badge tone="warning" size="sm">
                        Atención
                      </Badge>
                    )}
                    {loc.status === "critical" && (
                      <Badge tone="danger" size="sm">
                        Crítico
                      </Badge>
                    )}
                    <span className="flex items-center gap-1 text-2xs text-[var(--text-tertiary)] tabular">
                      <Wrench className="h-3 w-3" />
                      {eqCount}
                    </span>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </CardBody>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Nueva ubicación"
        description="Una sucursal, edificio o sitio donde el cliente tiene equipos."
      >
        <form action={handleAdd} className="px-6 py-5 space-y-4">
          <div>
            <label className="block text-2xs font-medium text-[var(--text-secondary)] mb-1.5">
              Nombre *
            </label>
            <Input
              name="name"
              placeholder="Sucursal Centro"
              required
              autoFocus
            />
          </div>
          <div>
            <label className="block text-2xs font-medium text-[var(--text-secondary)] mb-1.5">
              Dirección
            </label>
            <Input name="address" placeholder="18 de Julio 1234" />
          </div>
          <div>
            <label className="block text-2xs font-medium text-[var(--text-secondary)] mb-1.5">
              Ciudad
            </label>
            <Input name="city" placeholder="Montevideo" />
          </div>
          <div>
            <label className="block text-2xs font-medium text-[var(--text-secondary)] mb-1.5">
              Notas
            </label>
            <Input name="notes" placeholder="Aclaraciones, accesos, etc." />
          </div>

          {error && (
            <div className="rounded-lg bg-[var(--danger-bg)] border border-[var(--danger-border)] px-3 py-2 text-2xs text-[var(--danger-fg)]">
              {error}
            </div>
          )}

          <div className="flex items-center justify-end gap-2 pt-2">
            <Button type="button" variant="ghost" pill onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" pill>
              Crear ubicación
            </Button>
          </div>
        </form>
      </Modal>
    </Card>
  );
}
