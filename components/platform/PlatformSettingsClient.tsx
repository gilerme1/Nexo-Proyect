"use client";

import { useState, useTransition } from "react";
import { Check, Globe, Webhook, Shield } from "lucide-react";
import { Card, CardBody } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { updatePlatformBrand } from "@/lib/actions/branding";
import type { BrandConfig } from "@/lib/data/store";

interface Props {
  brand: BrandConfig;
}

export function PlatformSettingsClient({ brand }: Props) {
  const [isPending, startTransition] = useTransition();
  const [savedAt, setSavedAt] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  function handleBrandSubmit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const result = await updatePlatformBrand(formData);
      if (result.ok) setSavedAt(Date.now());
      else setError(result.error ?? "Error al guardar.");
    });
  }

  return (
    <div className="space-y-6">
      {/* Brand */}
      <Card>
        <div className="px-6 py-5 border-b border-[var(--border-subtle)]">
          <div className="flex items-center gap-2">
            <Globe className="h-4 w-4 text-[var(--text-tertiary)]" />
            <h3 className="text-sm font-semibold text-[var(--text-primary)]">Marca de la plataforma</h3>
          </div>
          <p className="text-2xs text-[var(--text-tertiary)] mt-0.5">
            Estos datos aparecen en el topbar, emails y documentos generados.
          </p>
        </div>
        <form action={handleBrandSubmit}>
          <CardBody className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-2xs font-medium text-[var(--text-secondary)] mb-1.5">
                  Nombre completo
                </label>
                <Input name="name" defaultValue={brand.name} placeholder="Maintly" />
              </div>
              <div>
                <label className="block text-2xs font-medium text-[var(--text-secondary)] mb-1.5">
                  Nombre corto
                </label>
                <Input name="shortName" defaultValue={brand.shortName} placeholder="Maintly" />
              </div>
            </div>

            <div>
              <label className="block text-2xs font-medium text-[var(--text-secondary)] mb-1.5">
                Tagline
              </label>
              <Input name="tagline" defaultValue={brand.tagline} placeholder="Plataforma de gestión de mantenimiento" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-2xs font-medium text-[var(--text-secondary)] mb-1.5">
                  Monograma
                  <span className="text-[var(--text-tertiary)] ml-1">(1 letra, aparece en el logo)</span>
                </label>
                <Input
                  name="monogram"
                  defaultValue={brand.monogram}
                  placeholder="M"
                  maxLength={1}
                  className="uppercase"
                />
              </div>
              <div>
                <label className="block text-2xs font-medium text-[var(--text-secondary)] mb-1.5">
                  Email de soporte
                </label>
                <Input name="supportEmail" type="email" defaultValue={brand.supportEmail} placeholder="soporte@maintly.app" />
              </div>
            </div>

            <div>
              <label className="block text-2xs font-medium text-[var(--text-secondary)] mb-1.5">
                URL del sitio
              </label>
              <Input name="websiteUrl" type="url" defaultValue={brand.websiteUrl} placeholder="https://maintly.app" />
            </div>

            {error && (
              <p className="text-xs text-[var(--danger-fg)]">{error}</p>
            )}

            <div className="flex items-center justify-end gap-3 pt-2">
              {savedAt && (
                <span className="flex items-center gap-1.5 text-2xs text-[var(--success-fg)]">
                  <Check className="h-3 w-3" />
                  Guardado
                </span>
              )}
              <Button type="submit" pill loading={isPending}>
                Guardar marca
              </Button>
            </div>
          </CardBody>
        </form>
      </Card>

      {/* Integrations */}
      <Card>
        <div className="px-6 py-5 border-b border-[var(--border-subtle)]">
          <div className="flex items-center gap-2">
            <Webhook className="h-4 w-4 text-[var(--text-tertiary)]" />
            <h3 className="text-sm font-semibold text-[var(--text-primary)]">Integraciones</h3>
          </div>
        </div>
        <CardBody className="p-2">
          {[
            { name: "Mercado Pago", description: "Cobros recurrentes y suscripciones" },
            { name: "Supabase", description: "Base de datos y autenticación" },
            { name: "Email transaccional", description: "Resend / Postmark / SES" },
            { name: "Storage", description: "Para fotos de reportes y QR PDFs" },
          ].map((item) => (
            <div key={item.name} className="flex items-center justify-between gap-3 px-3 py-3 rounded-xl">
              <div className="min-w-0">
                <p className="text-sm font-medium text-[var(--text-primary)]">{item.name}</p>
                <p className="text-2xs text-[var(--text-tertiary)] mt-0.5">{item.description}</p>
              </div>
              <Badge tone="neutral" dot>No configurado</Badge>
            </div>
          ))}
        </CardBody>
      </Card>

      {/* Security */}
      <Card>
        <div className="px-6 py-5 border-b border-[var(--border-subtle)]">
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4 text-[var(--text-tertiary)]" />
            <h3 className="text-sm font-semibold text-[var(--text-primary)]">Seguridad</h3>
          </div>
        </div>
        <CardBody className="space-y-3">
          {[
            { label: "2FA obligatorio para Super Admins", value: "Pendiente", hint: "Se habilita al conectar Supabase Auth" },
            { label: "Política de sesión", value: "30 días", hint: "Configurable en la entrega final" },
            { label: "Logs de auditoría", value: "Activo", hint: "Todos los eventos se registran en Actividad" },
          ].map((row) => (
            <div key={row.label} className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-[var(--text-primary)]">{row.label}</p>
                {row.hint && <p className="text-2xs text-[var(--text-tertiary)] mt-0.5">{row.hint}</p>}
              </div>
              <span className="text-2xs text-[var(--text-secondary)] tabular shrink-0">{row.value}</span>
            </div>
          ))}
        </CardBody>
      </Card>

      {/* Danger zone */}
      <Card className="border-[var(--danger-border)]">
        <div className="px-6 py-5 border-b border-[var(--border-subtle)]">
          <h3 className="text-sm font-semibold text-[var(--danger-fg)]">Zona peligrosa</h3>
          <p className="text-2xs text-[var(--text-tertiary)] mt-0.5">Acciones irreversibles</p>
        </div>
        <CardBody>
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-[var(--text-primary)]">Reiniciar datos demo</p>
              <p className="text-2xs text-[var(--text-tertiary)] mt-0.5">
                Restaura todos los tenants, rubros y configuración a los valores iniciales.
              </p>
            </div>
            <Button variant="outline" size="sm" pill disabled>
              Reiniciar
            </Button>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
