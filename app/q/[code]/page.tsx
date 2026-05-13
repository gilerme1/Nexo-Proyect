import { notFound } from "next/navigation";
import Link from "next/link";
import {
  QrCode,
  Wrench,
  MapPin,
  Building2,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
} from "lucide-react";
import { store } from "@/lib/data/store";
import { BRAND } from "@/lib/brand";
import { QrQuickCreate } from "@/components/qr/QrQuickCreate";

export default async function QrLandingPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;
  const tag = store.qrTags.find((t) => t.code === code);

  if (!tag) {
    return (
      <QrNotFound code={code} />
    );
  }

  if (tag.status === "voided") {
    return <QrVoided code={code} />;
  }

  if (tag.status === "bound" && tag.equipmentId) {
    const eq = store.equipment.find((e) => e.id === tag.equipmentId);
    const tenant = store.tenants.find((t) => t.id === tag.tenantId);
    const client = eq ? store.clients.find((c) => c.id === eq.clientId) : null;
    const location = eq?.locationId
      ? store.locations.find((l) => l.id === eq.locationId)
      : null;
    const eqType = eq
      ? store.equipmentTypes.find((t) => t.id === eq.equipmentTypeId)
      : null;

    return (
      <QrBound
        code={code}
        equipment={eq}
        tenant={tenant}
        client={client}
        location={location}
        eqType={eqType}
      />
    );
  }

  // Free tag — show quick create wizard
  const tenant = store.tenants.find((t) => t.id === tag.tenantId);
  const clients = store.clients.filter((c) => c.tenantId === tag.tenantId);
  const locations = store.locations.filter((l) => l.tenantId === tag.tenantId);
  const equipmentTypes = (() => {
    const vIds = store.tenantVerticals
      .filter((tv) => tv.tenantId === tag.tenantId)
      .map((tv) => tv.verticalId);
    return store.equipmentTypes.filter((t) => vIds.includes(t.verticalId));
  })();

  return (
    <QrFree
      code={code}
      tagId={tag.id}
      tenant={tenant}
      clients={clients}
      locations={locations}
      equipmentTypes={equipmentTypes}
    />
  );
}

// ============================================================================
// Sub-components (all server-rendered except QrQuickCreate)
// ============================================================================

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[var(--bg-page)] flex flex-col">
      <header className="px-5 py-4 border-b border-[var(--border-subtle)] flex items-center gap-2.5">
        <span className="grid h-8 w-8 place-items-center rounded-xl bg-[var(--accent-500)] text-white text-sm font-bold">
          M
        </span>
        <span className="text-sm font-semibold text-[var(--text-primary)]">{BRAND.name}</span>
      </header>
      <main className="flex-1 flex flex-col items-center justify-center px-5 py-10 max-w-md mx-auto w-full">
        {children}
      </main>
    </div>
  );
}

function QrNotFound({ code }: { code: string }) {
  return (
    <Shell>
      <div className="text-center space-y-4">
        <span className="grid h-16 w-16 place-items-center rounded-2xl bg-[var(--danger-bg)] text-[var(--danger-fg)] mx-auto">
          <AlertCircle className="h-8 w-8" />
        </span>
        <h1 className="text-xl font-semibold text-[var(--text-primary)]">QR no reconocido</h1>
        <p className="text-sm text-[var(--text-secondary)]">
          El código <code className="font-mono text-[var(--accent-400)]">{code}</code> no está registrado en Maintly.
        </p>
      </div>
    </Shell>
  );
}

function QrVoided({ code }: { code: string }) {
  return (
    <Shell>
      <div className="text-center space-y-4">
        <span className="grid h-16 w-16 place-items-center rounded-2xl bg-[var(--warning-bg)] text-[var(--warning-fg)] mx-auto">
          <AlertCircle className="h-8 w-8" />
        </span>
        <h1 className="text-xl font-semibold text-[var(--text-primary)]">QR anulado</h1>
        <p className="text-sm text-[var(--text-secondary)]">
          Este sticker fue dado de baja. Si estás viendo esto en un equipo, contactá a tu supervisor.
        </p>
      </div>
    </Shell>
  );
}

function QrBound({ code, equipment, tenant, client, location, eqType }: any) {
  return (
    <Shell>
      <div className="w-full space-y-5">
        <div className="text-center">
          <span className="grid h-16 w-16 place-items-center rounded-2xl bg-[var(--success-bg)] text-[var(--success-fg)] mx-auto mb-4">
            <CheckCircle2 className="h-8 w-8" />
          </span>
          <h1 className="text-xl font-semibold text-[var(--text-primary)]">
            {equipment?.name ?? "Equipo"}
          </h1>
          {eqType && (
            <p className="text-sm text-[var(--text-secondary)] mt-1">{eqType.name}</p>
          )}
        </div>

        <div className="bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-2xl divide-y divide-[var(--border-subtle)]">
          {client && (
            <div className="flex items-center gap-3 px-4 py-3.5">
              <Building2 className="h-4 w-4 text-[var(--text-tertiary)] shrink-0" />
              <div>
                <p className="text-2xs text-[var(--text-tertiary)]">Cliente</p>
                <p className="text-sm text-[var(--text-primary)]">{client.name}</p>
              </div>
            </div>
          )}
          {location && (
            <div className="flex items-center gap-3 px-4 py-3.5">
              <MapPin className="h-4 w-4 text-[var(--text-tertiary)] shrink-0" />
              <div>
                <p className="text-2xs text-[var(--text-tertiary)]">Ubicación</p>
                <p className="text-sm text-[var(--text-primary)]">{location.name}</p>
                {location.address && (
                  <p className="text-2xs text-[var(--text-tertiary)]">{location.address}</p>
                )}
              </div>
            </div>
          )}
          {equipment && (
            <div className="flex items-center gap-3 px-4 py-3.5">
              <Wrench className="h-4 w-4 text-[var(--text-tertiary)] shrink-0" />
              <div>
                <p className="text-2xs text-[var(--text-tertiary)]">Código interno</p>
                <p className="text-sm font-mono text-[var(--text-primary)]">
                  {equipment.internalCode}
                </p>
              </div>
            </div>
          )}
        </div>

        {tenant && equipment && (
          <Link
            href={`/app/equipment/${equipment.id}`}
            className="flex items-center justify-center gap-2 w-full py-3 px-4 bg-[var(--accent-500)] text-white rounded-2xl text-sm font-medium hover:bg-[var(--accent-600)]"
          >
            Ver ficha completa
            <ArrowRight className="h-4 w-4" />
          </Link>
        )}

        <p className="text-center text-2xs text-[var(--text-tertiary)]">
          QR: <code className="font-mono">{code}</code>
        </p>
      </div>
    </Shell>
  );
}

function QrFree({ code, tagId, tenant, clients, locations, equipmentTypes }: any) {
  return (
    <Shell>
      <div className="w-full space-y-5">
        <div className="text-center">
          <span className="grid h-16 w-16 place-items-center rounded-2xl bg-[var(--warning-bg)] text-[var(--warning-fg)] mx-auto mb-4">
            <QrCode className="h-8 w-8" />
          </span>
          <h1 className="text-xl font-semibold text-[var(--text-primary)]">
            QR sin asignar
          </h1>
          <p className="text-sm text-[var(--text-secondary)] mt-2">
            Este sticker todavía no está vinculado a ningún equipo.
            Completá los datos para registrarlo.
          </p>
          <p className="text-2xs text-[var(--text-tertiary)] mt-1 font-mono">{code}</p>
        </div>

        <QrQuickCreate
          tagCode={code}
          tagId={tagId}
          tenantId={tenant?.id ?? ""}
          clients={clients}
          locations={locations}
          equipmentTypes={equipmentTypes}
        />
      </div>
    </Shell>
  );
}
