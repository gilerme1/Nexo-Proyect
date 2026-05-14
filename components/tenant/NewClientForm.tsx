"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardBody } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { createClient } from "@/lib/actions/clients";

const CLIENT_TYPES = [
  { value: "company", label: "Empresa" },
  { value: "building", label: "Edificio" },
  { value: "supermarket", label: "Supermercado" },
  { value: "school", label: "Centro educativo" },
  { value: "shop", label: "Comercio" },
  { value: "institution", label: "Institución" },
  { value: "industry", label: "Industria" },
  { value: "complex", label: "Complejo" },
  { value: "office", label: "Oficina" },
  { value: "individual", label: "Particular" },
];

export function NewClientForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(formData: FormData) {
    setError(null);
    setSubmitting(true);
    const res = await createClient(formData);
    setSubmitting(false);
    if (!res.ok) {
      setError(res.error ?? "No se pudo crear el cliente.");
      return;
    }
    if (res.clientId) router.push(`/app/clients/${res.clientId}`);
  }

  return (
    <div className="space-y-6">
      <Link
        href="/app/clients"
        className="inline-flex items-center gap-1.5 text-2xs text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]"
      >
        <ArrowLeft className="h-3 w-3" />
        Volver a clientes
      </Link>

      <PageHeader
        title="Nuevo cliente"
        description="Completá los datos básicos del cliente. Podés agregar ubicaciones después."
      />

      <form action={handleSubmit} className="space-y-6">
        <Card>
          <CardBody className="space-y-5">
            <div>
              <label className="block text-2xs font-medium text-[var(--text-secondary)] mb-1.5">
                Nombre del cliente *
              </label>
              <Input name="name" placeholder="Supermercado Avenida" required autoFocus />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-2xs font-medium text-[var(--text-secondary)] mb-1.5">
                  Tipo
                </label>
                <Select name="type" defaultValue="company">
                  {CLIENT_TYPES.map((t) => (
                    <option key={t.value} value={t.value}>
                      {t.label}
                    </option>
                  ))}
                </Select>
              </div>
              <div>
                <label className="block text-2xs font-medium text-[var(--text-secondary)] mb-1.5">
                  RUT / Tax ID
                </label>
                <Input name="taxId" placeholder="219876540011" />
              </div>
            </div>
          </CardBody>
        </Card>

        <Card>
          <div className="px-6 py-5 border-b border-[var(--border-subtle)]">
            <h3 className="text-sm font-semibold text-[var(--text-primary)]">
              Contacto principal
            </h3>
            <p className="text-2xs text-[var(--text-tertiary)] mt-0.5">
              Persona de referencia para coordinar mantenimientos.
            </p>
          </div>
          <CardBody className="space-y-4">
            <div>
              <label className="block text-2xs font-medium text-[var(--text-secondary)] mb-1.5">
                Nombre
              </label>
              <Input name="contactName" placeholder="Pablo Martínez" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-2xs font-medium text-[var(--text-secondary)] mb-1.5">
                  Email
                </label>
                <Input name="contactEmail" type="email" placeholder="pablo@avenida.uy" />
              </div>
              <div>
                <label className="block text-2xs font-medium text-[var(--text-secondary)] mb-1.5">
                  Teléfono
                </label>
                <Input name="contactPhone" placeholder="+598 99 234 567" />
              </div>
            </div>
          </CardBody>
        </Card>

        {error && (
          <div className="rounded-xl bg-[var(--danger-bg)] border border-[var(--danger-border)] px-4 py-3 text-sm text-[var(--danger-fg)]">
            {error}
          </div>
        )}

        <div className="flex items-center justify-end gap-2">
          <Link href="/app/clients">
            <Button type="button" variant="ghost" pill>
              Cancelar
            </Button>
          </Link>
          <Button type="submit" pill loading={submitting}>
            Crear cliente
          </Button>
        </div>
      </form>
    </div>
  );
}
