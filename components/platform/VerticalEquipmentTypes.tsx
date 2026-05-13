"use client";

import { useState } from "react";
import { Boxes, Plus } from "lucide-react";
import { Card, CardBody } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { createEquipmentType } from "@/lib/actions/verticals";
import type { EquipmentType } from "@/lib/types";

interface Props {
  verticalId: string;
  types: EquipmentType[];
}

export function VerticalEquipmentTypes({ verticalId, types }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <Card>
      <div className="px-6 py-5 border-b border-[var(--border-subtle)] flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-[var(--text-primary)]">
            Tipos de equipo
          </h3>
          <p className="text-2xs text-[var(--text-tertiary)] mt-0.5">
            {types.length} tipos disponibles
          </p>
        </div>
        <Button
          onClick={() => setOpen(true)}
          variant="secondary"
          size="sm"
          pill
          leftIcon={<Plus className="h-3.5 w-3.5" />}
        >
          Nuevo tipo
        </Button>
      </div>
      <CardBody className="p-2">
        {types.length === 0 ? (
          <p className="px-4 py-8 text-center text-sm text-[var(--text-tertiary)]">
            Sin tipos de equipo. Agregá el primero.
          </p>
        ) : (
          <ul className="space-y-1">
            {types.map((t) => (
              <li
                key={t.id}
                className="flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-[var(--bg-hover)]"
              >
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[var(--bg-hover)] text-[var(--text-secondary)]">
                  <Boxes className="h-3.5 w-3.5" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-[var(--text-primary)]">
                    {t.name}
                  </p>
                  <p className="text-2xs text-[var(--text-tertiary)] font-mono truncate">
                    {t.slug}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardBody>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Nuevo tipo de equipo"
        description="Definí un tipo dentro de este rubro."
      >
        <form
          action={async (fd) => {
            await createEquipmentType(fd);
            setOpen(false);
          }}
          className="px-6 py-5 space-y-4"
        >
          <input type="hidden" name="verticalId" value={verticalId} />
          <div>
            <label className="block text-2xs font-medium text-[var(--text-secondary)] mb-1.5">
              Nombre *
            </label>
            <Input
              name="name"
              placeholder="Cámara de video"
              required
              autoFocus
            />
          </div>
          <div>
            <label className="block text-2xs font-medium text-[var(--text-secondary)] mb-1.5">
              Descripción
            </label>
            <Input
              name="description"
              placeholder="Cámaras IP, analógicas, fisheye"
            />
          </div>
          <div className="flex items-center justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="ghost"
              pill
              onClick={() => setOpen(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" pill>
              Crear tipo
            </Button>
          </div>
        </form>
      </Modal>
    </Card>
  );
}
