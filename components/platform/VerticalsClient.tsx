"use client";

import { useState } from "react";
import Link from "next/link";
import { Layers, Plus, Building2, Boxes } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardBody } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { EmptyState } from "@/components/ui/EmptyState";
import { createVertical } from "@/lib/actions/verticals";
import type {
  BusinessVertical,
  EquipmentType,
  TenantVertical,
} from "@/lib/types";

interface Props {
  verticals: BusinessVertical[];
  equipmentTypes: EquipmentType[];
  tenantVerticals: TenantVertical[];
}

export function VerticalsClient({
  verticals,
  equipmentTypes,
  tenantVerticals,
}: Props) {
  const [open, setOpen] = useState(false);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Rubros"
        description="Verticales de negocio que ofrece la plataforma. Cada rubro agrupa tipos de equipo y plantillas."
        actions={
          <Button
            onClick={() => setOpen(true)}
            size="sm"
            pill
            leftIcon={<Plus className="h-3.5 w-3.5" />}
          >
            Nuevo rubro
          </Button>
        }
      />

      {verticals.length === 0 ? (
        <Card>
          <EmptyState
            icon={Layers}
            title="Sin rubros"
            description="Creá el primer rubro para empezar a configurar tipos de equipo."
            action={
              <Button
                onClick={() => setOpen(true)}
                size="sm"
                pill
                leftIcon={<Plus className="h-3.5 w-3.5" />}
              >
                Crear rubro
              </Button>
            }
          />
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {verticals.map((v) => {
            const types = equipmentTypes.filter(
              (t) => t.verticalId === v.id,
            ).length;
            const tenants = tenantVerticals.filter(
              (tv) => tv.verticalId === v.id,
            ).length;
            return (
              <Link
                key={v.id}
                href={`/platform/verticals/${v.id}`}
                className="group"
              >
                <Card
                  interactive
                  className="h-full hover:border-[var(--border-default)]"
                >
                  <CardBody>
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <span className="grid h-10 w-10 place-items-center rounded-2xl bg-[var(--info-bg)] text-[var(--info-fg)]">
                        <Layers className="h-4 w-4" />
                      </span>
                    </div>
                    <p className="text-base font-semibold text-[var(--text-primary)]">
                      {v.name}
                    </p>
                    {v.description && (
                      <p className="mt-1 text-2xs text-[var(--text-tertiary)] leading-relaxed line-clamp-2">
                        {v.description}
                      </p>
                    )}
                    <div className="mt-4 pt-4 border-t border-[var(--border-subtle)] flex items-center gap-4 text-2xs">
                      <span className="flex items-center gap-1.5 text-[var(--text-secondary)]">
                        <Boxes className="h-3 w-3" />
                        <span className="tabular">
                          {types} tipo{types === 1 ? "" : "s"}
                        </span>
                      </span>
                      <span className="flex items-center gap-1.5 text-[var(--text-secondary)]">
                        <Building2 className="h-3 w-3" />
                        <span className="tabular">
                          {tenants} tenant{tenants === 1 ? "" : "s"}
                        </span>
                      </span>
                    </div>
                  </CardBody>
                </Card>
              </Link>
            );
          })}
        </div>
      )}

      <CreateVerticalModal open={open} onClose={() => setOpen(false)} />
    </div>
  );
}

function CreateVerticalModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Nuevo rubro"
      description="Definí una vertical de negocio nueva."
    >
      <form action={createVertical} className="px-6 py-5 space-y-4">
        <div>
          <label className="block text-2xs font-medium text-[var(--text-secondary)] mb-1.5">
            Nombre *
          </label>
          <Input
            name="name"
            placeholder="Aire acondicionado"
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
            placeholder="Splits, cassettes, rooftops, chillers"
          />
        </div>
        <div className="flex items-center justify-end gap-2 pt-2">
          <Button type="button" variant="ghost" pill onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" pill>
            Crear rubro
          </Button>
        </div>
      </form>
    </Modal>
  );
}
