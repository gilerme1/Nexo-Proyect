"use client";

import { useState, useTransition } from "react";
import { Check, Upload, RotateCcw } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Card, CardBody } from "@/components/ui/Card";
import { cn } from "@/lib/utils/cn";
import { saveTenantBranding } from "@/lib/actions/branding";
import { updateTenant } from "@/lib/actions/tenants";

interface Props {
  tenantId: string;
  name: string;
  legalName?: string;
  branding?: {
    accentColor?: string;
    logoUrl?: string;
    displayName?: string;
  };
}

const PRESET_COLORS = [
  { hex: "#3b6cff", name: "Azul" },
  { hex: "#6366f1", name: "Índigo" },
  { hex: "#8b5cf6", name: "Violeta" },
  { hex: "#ec4899", name: "Rosa" },
  { hex: "#ef4444", name: "Rojo" },
  { hex: "#f97316", name: "Naranja" },
  { hex: "#22c55e", name: "Verde" },
  { hex: "#14b8a6", name: "Teal" },
  { hex: "#06b6d4", name: "Cyan" },
];

function Section({ title, description, children }: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-6">
      <div>
        <h3 className="text-sm font-semibold text-[var(--text-primary)]">{title}</h3>
        {description && <p className="text-xs text-[var(--text-tertiary)] mt-1">{description}</p>}
      </div>
      <Card><CardBody className="p-5">{children}</CardBody></Card>
    </div>
  );
}

export function SettingsClient({ tenantId, name: initialName, legalName: initialLegalName, branding: initialBranding }: Props) {
  const [pending, startTransition] = useTransition();
  const [infoSaved, setInfoSaved] = useState(false);
  const [brandingSaved, setBrandingSaved] = useState(false);
  const [infoError, setInfoError] = useState("");

  const [name, setName] = useState(initialName);
  const [legalName, setLegalName] = useState(initialLegalName ?? "");

  const [accentColor, setAccentColor] = useState(initialBranding?.accentColor ?? "#3b6cff");
  const [displayName, setDisplayName] = useState(initialBranding?.displayName ?? "");
  const [logoUrl] = useState(initialBranding?.logoUrl ?? "");

  function handleSaveInfo(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setInfoError("");
    startTransition(async () => {
      const fd = new FormData();
      fd.set("id", tenantId);
      fd.set("name", name);
      fd.set("legalName", legalName);
      fd.set("status", "active");
      const result = await updateTenant(fd);
      if (!result.ok) { setInfoError(result.error ?? "Error"); return; }
      setInfoSaved(true);
      setTimeout(() => setInfoSaved(false), 2000);
    });
  }

  function handleSaveBranding() {
    startTransition(async () => {
      await saveTenantBranding(tenantId, {
        accentColor,
        displayName: displayName || undefined,
        logoUrl: logoUrl || undefined,
      });
      document.documentElement.style.setProperty("--accent-500", accentColor);
      setBrandingSaved(true);
      setTimeout(() => setBrandingSaved(false), 2000);
    });
  }

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-xl font-semibold text-[var(--text-primary)]">Configuración</h1>
        <p className="text-sm text-[var(--text-tertiary)] mt-0.5">Personalizá tu cuenta Maintly.</p>
      </div>

      <Section
        title="Información general"
        description="Nombre de tu empresa tal como aparece en reportes y documentos."
      >
        <form onSubmit={handleSaveInfo} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-[var(--text-secondary)]">Nombre *</label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nombre de la empresa"
              required
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-[var(--text-secondary)]">Razón social</label>
            <Input
              value={legalName}
              onChange={(e) => setLegalName(e.target.value)}
              placeholder="Razón social o nombre legal"
            />
          </div>
          {infoError && <p className="text-xs text-[var(--danger-fg)]">{infoError}</p>}
          <div className="flex justify-end">
            <Button type="submit" size="sm" pill disabled={pending}>
              {infoSaved ? <><Check className="h-3.5 w-3.5" /> Guardado</> : "Guardar cambios"}
            </Button>
          </div>
        </form>
      </Section>

      <Section
        title="Identidad visual"
        description="Color de acento y nombre que aparece en la barra superior."
      >
        <div className="space-y-5">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-[var(--text-secondary)]">Nombre a mostrar</label>
            <Input
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder={name}
            />
            <p className="text-2xs text-[var(--text-tertiary)]">
              Si lo dejás vacío se usa el nombre de la empresa.
            </p>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-medium text-[var(--text-secondary)]">Color de acento</label>
            <div className="flex flex-wrap gap-2">
              {PRESET_COLORS.map((c) => (
                <button
                  key={c.hex}
                  type="button"
                  title={c.name}
                  onClick={() => setAccentColor(c.hex)}
                  className={cn(
                    "h-8 w-8 rounded-full border-2 transition-transform hover:scale-110",
                    accentColor === c.hex
                      ? "border-[var(--text-primary)] scale-110"
                      : "border-transparent",
                  )}
                  style={{ backgroundColor: c.hex }}
                />
              ))}
              <label
                className="h-8 w-8 rounded-full border-2 border-dashed border-[var(--border-default)] grid place-items-center cursor-pointer text-[var(--text-tertiary)] hover:border-[var(--accent-500)] overflow-hidden"
                title="Color personalizado"
              >
                <input
                  type="color"
                  value={accentColor}
                  onChange={(e) => setAccentColor(e.target.value)}
                  className="opacity-0 absolute w-px h-px"
                />
                <span className="text-[10px] font-bold">#</span>
              </label>
            </div>
            <div className="flex items-center gap-2 mt-2">
              <div className="h-8 w-8 rounded-full" style={{ backgroundColor: accentColor }} />
              <span className="text-xs text-[var(--text-secondary)] font-mono">{accentColor}</span>
              <button
                type="button"
                onClick={() => setAccentColor("#3b6cff")}
                className="text-[var(--text-tertiary)] hover:text-[var(--text-primary)] ml-auto"
                title="Restaurar color por defecto"
              >
                <RotateCcw className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          <div className="flex justify-end">
            <Button size="sm" pill onClick={handleSaveBranding} disabled={pending}>
              {brandingSaved ? <><Check className="h-3.5 w-3.5" /> Guardado</> : "Guardar identidad"}
            </Button>
          </div>
        </div>
      </Section>

      <Section
        title="Logo"
        description="Tu logo aparece en el topbar y en los reportes PDF."
      >
        <div className="flex items-center gap-4">
          {logoUrl ? (
            <img src={logoUrl} alt="Logo actual" className="h-12 max-w-[120px] object-contain rounded-xl border border-[var(--border-subtle)] p-2 bg-[var(--bg-hover)]" />
          ) : (
            <div className="h-12 w-24 rounded-xl border border-dashed border-[var(--border-default)] grid place-items-center text-[var(--text-tertiary)] text-xs">
              Sin logo
            </div>
          )}
          <Button size="sm" pill variant="secondary" disabled>
            <Upload className="h-3.5 w-3.5" />
            Subir logo
          </Button>
          <span className="text-xs text-[var(--text-tertiary)]">Disponible próximamente</span>
        </div>
      </Section>
    </div>
  );
}
