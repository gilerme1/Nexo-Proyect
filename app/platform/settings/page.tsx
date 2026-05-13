import { Settings, Globe, Database, Webhook, Mail, Shield } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardBody } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { BRAND } from "@/lib/brand";

export default function PlatformSettingsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Configuración"
        description="Configuración global de la plataforma. Marca, integraciones y políticas."
      />

      <div className="space-y-6 max-w-3xl">
        {/* Brand */}
        <Card>
          <div className="px-6 py-5 border-b border-[var(--border-subtle)]">
            <div className="flex items-center gap-2">
              <Globe className="h-4 w-4 text-[var(--text-tertiary)]" />
              <h3 className="text-sm font-semibold text-[var(--text-primary)]">
                Marca
              </h3>
            </div>
          </div>
          <CardBody className="space-y-4">
            <div>
              <label className="block text-2xs font-medium text-[var(--text-secondary)] mb-1.5">
                Nombre de la plataforma
              </label>
              <Input defaultValue={BRAND.name} disabled />
              <p className="mt-1.5 text-2xs text-[var(--text-tertiary)]">
                Por ahora se edita en{" "}
                <code className="font-mono">lib/brand.ts</code>. En la
                Entrega 5 será editable desde acá.
              </p>
            </div>
            <div>
              <label className="block text-2xs font-medium text-[var(--text-secondary)] mb-1.5">
                Tagline
              </label>
              <Input defaultValue={BRAND.tagline} disabled />
            </div>
          </CardBody>
        </Card>

        {/* Integrations */}
        <Card>
          <div className="px-6 py-5 border-b border-[var(--border-subtle)]">
            <div className="flex items-center gap-2">
              <Webhook className="h-4 w-4 text-[var(--text-tertiary)]" />
              <h3 className="text-sm font-semibold text-[var(--text-primary)]">
                Integraciones
              </h3>
            </div>
          </div>
          <CardBody className="p-2">
            <IntegrationRow
              name="Mercado Pago"
              description="Cobros recurrentes y suscripciones"
              status="not_configured"
            />
            <IntegrationRow
              name="Supabase"
              description="Base de datos y autenticación"
              status="not_configured"
            />
            <IntegrationRow
              name="Email transaccional"
              description="Resend / Postmark / SES"
              status="not_configured"
            />
            <IntegrationRow
              name="Storage"
              description="Para fotos de reportes y QR PDFs"
              status="not_configured"
            />
          </CardBody>
        </Card>

        {/* Security */}
        <Card>
          <div className="px-6 py-5 border-b border-[var(--border-subtle)]">
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-[var(--text-tertiary)]" />
              <h3 className="text-sm font-semibold text-[var(--text-primary)]">
                Seguridad
              </h3>
            </div>
          </div>
          <CardBody className="space-y-3">
            <Row
              label="2FA obligatorio para Super Admins"
              value="Pendiente"
              hint="Se habilita al conectar Supabase Auth"
            />
            <Row
              label="Política de sesión"
              value="30 días"
              hint="Configurable en la entrega final"
            />
            <Row
              label="Logs de auditoría"
              value="Activity log"
              hint="Todos los eventos se registran"
            />
          </CardBody>
        </Card>

        {/* Danger zone */}
        <Card className="border-[var(--danger-border)]">
          <div className="px-6 py-5 border-b border-[var(--border-subtle)]">
            <h3 className="text-sm font-semibold text-[var(--danger-fg)]">
              Zona peligrosa
            </h3>
            <p className="text-2xs text-[var(--text-tertiary)] mt-0.5">
              Acciones irreversibles
            </p>
          </div>
          <CardBody className="space-y-3">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-[var(--text-primary)]">
                  Reiniciar datos demo
                </p>
                <p className="text-2xs text-[var(--text-tertiary)] mt-0.5">
                  Restaura todos los tenants, rubros y configuración a los
                  valores iniciales (perdés cualquier cosa que hayas creado).
                </p>
              </div>
              <Button variant="outline" size="sm" pill disabled>
                Reiniciar
              </Button>
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}

function IntegrationRow({
  name,
  description,
  status,
}: {
  name: string;
  description: string;
  status: "configured" | "not_configured";
}) {
  return (
    <div className="flex items-center justify-between gap-3 px-3 py-3 rounded-xl">
      <div className="min-w-0">
        <p className="text-sm font-medium text-[var(--text-primary)]">
          {name}
        </p>
        <p className="text-2xs text-[var(--text-tertiary)] mt-0.5">
          {description}
        </p>
      </div>
      <Badge tone={status === "configured" ? "success" : "neutral"} dot>
        {status === "configured" ? "Conectado" : "No configurado"}
      </Badge>
    </div>
  );
}

function Row({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div>
        <p className="text-sm font-medium text-[var(--text-primary)]">
          {label}
        </p>
        {hint && (
          <p className="text-2xs text-[var(--text-tertiary)] mt-0.5">{hint}</p>
        )}
      </div>
      <span className="text-2xs text-[var(--text-secondary)] tabular shrink-0">
        {value}
      </span>
    </div>
  );
}
