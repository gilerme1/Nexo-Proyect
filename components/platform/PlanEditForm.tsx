"use client";

import { useState, useTransition } from "react";
import { Check } from "lucide-react";
import { Card, CardBody } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Switch } from "@/components/ui/Switch";
import { updatePlan } from "@/lib/actions/plans";
import type { Plan } from "@/lib/types";

const FEATURE_LABELS: Record<keyof Plan["features"], { label: string; desc: string }> = {
  formBuilder: {
    label: "Form Builder",
    desc: "Permite al tenant crear/personalizar plantillas",
  },
  apiAccess: {
    label: "API Access",
    desc: "Acceso a la API REST de Maintly",
  },
  customDomain: {
    label: "Dominio propio",
    desc: "Conectar dominio del cliente al workspace",
  },
  prioritySupport: {
    label: "Soporte prioritario",
    desc: "SLA reducido y canal directo",
  },
  qrPrintBatches: {
    label: "Lotes de QR",
    desc: "Generación de stickers QR pre-impresos",
  },
  advancedAnalytics: {
    label: "Analytics avanzado",
    desc: "Reportes y dashboards extendidos",
  },
};

export function PlanEditForm({ plan }: { plan: Plan }) {
  const [features, setFeatures] = useState(plan.features);
  const [isPending, startTransition] = useTransition();
  const [savedAt, setSavedAt] = useState<number | null>(null);

  function handleSubmit(formData: FormData) {
    // append feature checkboxes from local state
    Object.entries(features).forEach(([key, value]) => {
      formData.set(`feat_${key}`, value ? "on" : "");
    });
    startTransition(async () => {
      await updatePlan(formData);
      setSavedAt(Date.now());
    });
  }

  return (
    <form action={handleSubmit} className="space-y-6">
      <input type="hidden" name="id" value={plan.id} />

      {/* Basic info */}
      <Card>
        <div className="px-6 py-5 border-b border-[var(--border-subtle)]">
          <h3 className="text-sm font-semibold text-[var(--text-primary)]">
            Información general
          </h3>
        </div>
        <CardBody className="space-y-4">
          <div>
            <label className="block text-2xs font-medium text-[var(--text-secondary)] mb-1.5">
              Nombre
            </label>
            <Input name="name" defaultValue={plan.name} required />
          </div>
          <div>
            <label className="block text-2xs font-medium text-[var(--text-secondary)] mb-1.5">
              Descripción
            </label>
            <Input name="description" defaultValue={plan.description ?? ""} />
          </div>
        </CardBody>
      </Card>

      {/* Pricing */}
      <Card>
        <div className="px-6 py-5 border-b border-[var(--border-subtle)]">
          <h3 className="text-sm font-semibold text-[var(--text-primary)]">
            Precios
          </h3>
          <p className="text-2xs text-[var(--text-tertiary)] mt-0.5">
            En USD. Para Enterprise dejá ambos en 0.
          </p>
        </div>
        <CardBody>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-2xs font-medium text-[var(--text-secondary)] mb-1.5">
                Precio mensual (USD)
              </label>
              <Input
                name="monthlyPriceUsd"
                type="number"
                step="0.01"
                min="0"
                defaultValue={plan.monthlyPriceUsd}
              />
            </div>
            <div>
              <label className="block text-2xs font-medium text-[var(--text-secondary)] mb-1.5">
                Precio anual (USD)
              </label>
              <Input
                name="yearlyPriceUsd"
                type="number"
                step="0.01"
                min="0"
                defaultValue={plan.yearlyPriceUsd}
              />
              <p className="mt-1 text-2xs text-[var(--text-tertiary)]">
                Sugerencia: 10× mensual = 2 meses gratis
              </p>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Limits */}
      <Card>
        <div className="px-6 py-5 border-b border-[var(--border-subtle)]">
          <h3 className="text-sm font-semibold text-[var(--text-primary)]">
            Límites del plan
          </h3>
          <p className="text-2xs text-[var(--text-tertiary)] mt-0.5">
            Dejá vacío para ilimitado (∞).
          </p>
        </div>
        <CardBody>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <LimitField
              label="Usuarios"
              name="limit_users"
              value={plan.limits.users}
            />
            <LimitField
              label="Equipos"
              name="limit_equipment"
              value={plan.limits.equipment}
            />
            <LimitField
              label="Clientes"
              name="limit_clients"
              value={plan.limits.clients}
            />
            <LimitField
              label="Reportes por mes"
              name="limit_reportsPerMonth"
              value={plan.limits.reportsPerMonth}
            />
            <LimitField
              label="QR Tags por mes"
              name="limit_qrTagsPerMonth"
              value={plan.limits.qrTagsPerMonth}
            />
          </div>
        </CardBody>
      </Card>

      {/* Features */}
      <Card>
        <div className="px-6 py-5 border-b border-[var(--border-subtle)]">
          <h3 className="text-sm font-semibold text-[var(--text-primary)]">
            Features incluidos
          </h3>
        </div>
        <CardBody className="space-y-4">
          {(Object.keys(FEATURE_LABELS) as Array<keyof Plan["features"]>).map(
            (key) => {
              const meta = FEATURE_LABELS[key];
              return (
                <Switch
                  key={key}
                  checked={features[key]}
                  onChange={(v) =>
                    setFeatures({ ...features, [key]: v })
                  }
                  label={meta.label}
                  description={meta.desc}
                />
              );
            },
          )}
        </CardBody>
      </Card>

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
    </form>
  );
}

function LimitField({
  label,
  name,
  value,
}: {
  label: string;
  name: string;
  value: number | null;
}) {
  return (
    <div>
      <label className="block text-2xs font-medium text-[var(--text-secondary)] mb-1.5">
        {label}
      </label>
      <Input
        name={name}
        type="number"
        min="0"
        defaultValue={value ?? ""}
        placeholder="Vacío = ilimitado"
      />
    </div>
  );
}
