"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Check } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardBody } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { cn } from "@/lib/utils/cn";
import { createTenant } from "@/lib/actions/tenants";
import type { BusinessVertical, Plan } from "@/lib/types";

interface Props {
  verticals: BusinessVertical[];
  plans: Plan[];
}

export function CreateTenantForm({ verticals, plans }: Props) {
  const router = useRouter();
  const [selectedVerticals, setSelectedVerticals] = useState<string[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<string>(plans[0]?.id ?? "");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  function toggleVertical(id: string) {
    setSelectedVerticals((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  }

  async function handleSubmit(formData: FormData) {
    setError(null);
    setSubmitting(true);
    selectedVerticals.forEach((v) => formData.append("verticalIds", v));
    formData.set("planId", selectedPlan);
    const res = await createTenant(formData);
    setSubmitting(false);
    if (!res?.ok) {
      setError(res?.error ?? "Hubo un error al crear el tenant.");
      return;
    }
    if (res.redirectTo) router.push(res.redirectTo);
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Nuevo tenant"
        description="Creá la empresa, asigná los rubros que opera y elegí su plan inicial."
      />

      <form action={handleSubmit} className="space-y-6">
        <Card>
          <CardBody className="space-y-5">
            <div>
              <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5">
                Nombre del tenant *
              </label>
              <Input name="name" placeholder="Seguridad Norte" required />
              <p className="mt-1.5 text-2xs text-[var(--text-tertiary)]">
                El slug se genera automáticamente a partir del nombre.
              </p>
            </div>

            <div>
              <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5">
                Razón social
              </label>
              <Input name="legalName" placeholder="Seguridad Norte S.A." />
            </div>
          </CardBody>
        </Card>

        <Card>
          <div className="px-6 py-5 border-b border-[var(--border-subtle)]">
            <h3 className="text-sm font-semibold text-[var(--text-primary)]">
              Rubros *
            </h3>
            <p className="text-2xs text-[var(--text-tertiary)] mt-0.5">
              Las plantillas de equipos y reportes se cargan según los rubros
              asignados.
            </p>
          </div>
          <CardBody>
            {verticals.length === 0 ? (
              <p className="text-sm text-[var(--text-tertiary)]">
                Aún no hay rubros disponibles.{" "}
                <Link
                  href="/platform/verticals"
                  className="text-[var(--accent-400)] hover:underline"
                >
                  Crear rubro
                </Link>
              </p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {verticals.map((v) => {
                  const selected = selectedVerticals.includes(v.id);
                  return (
                    <button
                      key={v.id}
                      type="button"
                      onClick={() => toggleVertical(v.id)}
                      className={cn(
                        "flex items-center justify-between gap-3 px-3.5 py-3 rounded-xl text-left",
                        "border",
                        selected
                          ? "border-[var(--accent-500)] bg-[var(--info-bg)]"
                          : "border-[var(--border-default)] hover:border-[var(--border-strong)] hover:bg-[var(--bg-hover)]",
                      )}
                    >
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-[var(--text-primary)] truncate">
                          {v.name}
                        </p>
                        {v.description && (
                          <p className="truncate text-2xs text-[var(--text-tertiary)] mt-0.5">
                            {v.description}
                          </p>
                        )}
                      </div>
                      <span
                        className={cn(
                          "grid h-5 w-5 shrink-0 place-items-center rounded-full border",
                          selected
                            ? "bg-[var(--accent-500)] border-[var(--accent-500)] text-white"
                            : "border-[var(--border-strong)]",
                        )}
                      >
                        {selected && <Check className="h-3 w-3" />}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </CardBody>
        </Card>

        <Card>
          <div className="px-6 py-5 border-b border-[var(--border-subtle)]">
            <h3 className="text-sm font-semibold text-[var(--text-primary)]">
              Plan inicial
            </h3>
            <p className="text-2xs text-[var(--text-tertiary)] mt-0.5">
              Empieza con 14 días de trial. Después podés cambiarlo manualmente.
            </p>
          </div>
          <CardBody>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {plans
                .filter((p) => p.isPublic)
                .map((p) => {
                  const selected = selectedPlan === p.id;
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setSelectedPlan(p.id)}
                      className={cn(
                        "text-left p-4 rounded-2xl border",
                        selected
                          ? "border-[var(--accent-500)] bg-[var(--info-bg)]"
                          : "border-[var(--border-default)] hover:border-[var(--border-strong)] hover:bg-[var(--bg-hover)]",
                      )}
                    >
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <p className="text-sm font-semibold text-[var(--text-primary)]">
                          {p.name}
                        </p>
                        {selected && (
                          <span className="grid h-5 w-5 place-items-center rounded-full bg-[var(--accent-500)] text-white">
                            <Check className="h-3 w-3" />
                          </span>
                        )}
                      </div>
                      <p className="text-2xl font-semibold text-[var(--text-primary)] tabular">
                        ${p.monthlyPriceUsd}
                        <span className="text-sm font-normal text-[var(--text-tertiary)] ml-1">
                          /mes
                        </span>
                      </p>
                      <p className="mt-2 text-2xs text-[var(--text-tertiary)] leading-relaxed">
                        {p.limits.users === null
                          ? "Usuarios ilimitados"
                          : `${p.limits.users} usuarios`}
                        {" · "}
                        {p.limits.equipment === null
                          ? "equipos ilimitados"
                          : `${p.limits.equipment} equipos`}
                      </p>
                    </button>
                  );
                })}
            </div>
          </CardBody>
        </Card>

        {error && (
          <div className="rounded-xl bg-[var(--danger-bg)] border border-[var(--danger-border)] px-4 py-3 text-sm text-[var(--danger-fg)]">
            {error}
          </div>
        )}

        <div className="flex items-center justify-end gap-2 pt-2">
          <Link href="/platform/tenants">
            <Button type="button" variant="ghost" size="md" pill>
              Cancelar
            </Button>
          </Link>
          <Button type="submit" size="md" pill loading={submitting}>
            Crear tenant
          </Button>
        </div>
      </form>
    </div>
  );
}
