"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { createPortal } from "react-dom";
import {
  Paintbrush2, X,
  Type, Check, Upload, RotateCcw,
} from "lucide-react";
import { useTheme } from "@/components/theme/ThemeProvider";
import { saveTenantBranding } from "@/lib/actions/branding";
import { cn } from "@/lib/utils/cn";

interface Props {
  tenantId?: string;
  currentLogoUrl?: string;
  tenantAccentColor?: string;
}

const PRESET_COLORS = [
  { hex: "#3b6cff", name: "Azul (default)" },
  { hex: "#6366f1", name: "Índigo" },
  { hex: "#8b5cf6", name: "Violeta" },
  { hex: "#ec4899", name: "Rosa" },
  { hex: "#ef4444", name: "Rojo" },
  { hex: "#f97316", name: "Naranja" },
  { hex: "#eab308", name: "Amarillo" },
  { hex: "#22c55e", name: "Verde" },
  { hex: "#14b8a6", name: "Teal" },
  { hex: "#06b6d4", name: "Cyan" },
];

export function CustomizationPanel({ tenantId, currentLogoUrl, tenantAccentColor }: Props) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { accentColor, setAccentColor, fontSize, setFontSize } = useTheme();
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState<number | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(currentLogoUrl ?? null);
  const fileRef = useRef<HTMLInputElement>(null);

  // Portal requires the DOM to be mounted
  useEffect(() => { setMounted(true); }, []);

  async function handleSaveBranding(overrides?: { accentColor?: string; logoUrl?: string }) {
    if (!tenantId) return;
    setSaving(true);
    await saveTenantBranding(tenantId, {
      accentColor: overrides?.accentColor ?? accentColor,
      logoUrl: overrides?.logoUrl ?? logoPreview ?? undefined,
    });
    setSaving(false);
    setSavedAt(Date.now());
  }

  function handleColorCommit(hex: string) {
    setAccentColor(hex);
    if (tenantId) handleSaveBranding({ accentColor: hex });
  }

  function handleLogoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target?.result as string;
      setLogoPreview(dataUrl);
      if (tenantId) handleSaveBranding({ logoUrl: dataUrl });
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  }

  function handleRemoveLogo() {
    setLogoPreview(null);
    if (tenantId) saveTenantBranding(tenantId, { logoUrl: "" });
  }

  function handleReset() {
    setAccentColor("#3b6cff");
    setFontSize("md");
    if (tenantId) handleSaveBranding({ accentColor: "#3b6cff" });
  }

  const panel = (
    <>
      {/* Trigger button — fixed to right edge, desktop only */}
      <button
        onClick={() => setOpen(true)}
        aria-label="Personalizar apariencia"
        style={{ position: "fixed", right: 0, top: "50%", transform: "translateY(-50%)", zIndex: 9998 }}
        className="hidden lg:flex items-center pl-2.5 pr-1.5 py-3 bg-[var(--accent-500)] text-white rounded-l-2xl shadow-lg hover:pl-3.5 transition-all duration-200"
      >
        <Paintbrush2 className="h-4 w-4" />
      </button>

      {/* Backdrop */}
      {open && (
        <div
          onClick={() => setOpen(false)}
          style={{ position: "fixed", inset: 0, zIndex: 9998, background: "rgba(0,0,0,0.4)", backdropFilter: "blur(4px)" }}
          aria-hidden
        />
      )}

      {/* Panel */}
      <aside
        style={{
          position: "fixed",
          top: 0,
          right: 0,
          bottom: 0,
          zIndex: 9999,
          width: 320,
          transform: open ? "translateX(0)" : "translateX(100%)",
          transition: "transform 300ms cubic-bezier(0.4,0,0.2,1)",
        }}
        className="bg-[var(--bg-canvas)] border-l border-[var(--border-subtle)] flex flex-col shadow-2xl"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--border-subtle)] shrink-0">
          <div className="flex items-center gap-2.5">
            <Paintbrush2 className="h-4 w-4 text-[var(--accent-500)]" />
            <p className="text-sm font-semibold text-[var(--text-primary)]">Personalización</p>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={handleReset}
              title="Restablecer por defecto"
              className="grid h-8 w-8 place-items-center rounded-full text-[var(--text-tertiary)] hover:text-[var(--text-secondary)] hover:bg-[var(--bg-hover)]"
            >
              <RotateCcw className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => setOpen(false)}
              className="grid h-8 w-8 place-items-center rounded-full text-[var(--text-tertiary)] hover:text-[var(--text-secondary)] hover:bg-[var(--bg-hover)]"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-5 space-y-7">
          {/* Logo */}
          {tenantId && (
            <section>
              <h3 className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-3">
                Logo del tenant
              </h3>
              <div className="space-y-3">
                {logoPreview ? (
                  <div className="relative inline-block">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={logoPreview} alt="Logo" className="h-14 max-w-[200px] object-contain rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-hover)] p-2" />
                    <button onClick={handleRemoveLogo} className="absolute -top-2 -right-2 grid h-5 w-5 place-items-center rounded-full bg-[var(--danger-fg)] text-white shadow" aria-label="Eliminar logo">
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ) : (
                  <div
                    onClick={() => fileRef.current?.click()}
                    className="flex flex-col items-center justify-center gap-2 h-20 rounded-2xl border-2 border-dashed border-[var(--border-default)] cursor-pointer hover:border-[var(--accent-500)] hover:bg-[var(--info-bg)] text-[var(--text-tertiary)] hover:text-[var(--accent-400)]"
                  >
                    <Upload className="h-5 w-5" />
                    <span className="text-2xs">Subir logo (PNG, SVG, JPG)</span>
                  </div>
                )}
                <input ref={fileRef} type="file" accept="image/png,image/svg+xml,image/jpeg,image/webp" className="sr-only" onChange={handleLogoUpload} />
                {logoPreview && (
                  <button onClick={() => fileRef.current?.click()} className="text-2xs text-[var(--accent-400)] hover:underline">
                    Cambiar logo
                  </button>
                )}
                <p className="text-2xs text-[var(--text-tertiary)]">Recomendado: fondo transparente, mínimo 200px de ancho. En E5 se sube a Cloudinary.</p>
              </div>
            </section>
          )}

          {/* Color de acento */}
          <section>
            <h3 className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-3">
              Color de acento
            </h3>
            <div className="grid grid-cols-5 gap-2 mb-3">
              {PRESET_COLORS.map((c) => (
                <button
                  key={c.hex}
                  title={c.name}
                  onClick={() => handleColorCommit(c.hex)}
                  className="relative h-9 w-full rounded-xl border-2 transition-transform hover:scale-110"
                  style={{ background: c.hex, borderColor: accentColor.toLowerCase() === c.hex.toLowerCase() ? "white" : "transparent" }}
                >
                  {accentColor.toLowerCase() === c.hex.toLowerCase() && (
                    <Check className="h-3.5 w-3.5 text-white absolute inset-0 m-auto drop-shadow" />
                  )}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={accentColor}
                onChange={(e) => setAccentColor(e.target.value)}
                onBlur={(e) => handleColorCommit(e.target.value)}
                className="h-10 w-10 rounded-xl border border-[var(--border-default)] cursor-pointer bg-transparent p-0.5"
              />
              <input
                type="text"
                value={accentColor}
                onChange={(e) => { if (/^#[0-9a-fA-F]{0,6}$/.test(e.target.value)) setAccentColor(e.target.value); }}
                onBlur={(e) => { if (/^#[0-9a-fA-F]{6}$/.test(e.target.value)) handleColorCommit(e.target.value); }}
                className="flex-1 h-10 px-3.5 text-sm font-mono bg-[var(--bg-input)] border border-[var(--border-default)] rounded-full text-[var(--text-primary)] focus:border-[var(--accent-500)] focus:ring-2 focus:ring-[var(--accent-500)]/20 outline-none uppercase"
                placeholder="#3b6cff"
                maxLength={7}
              />
            </div>
            <div className="mt-3 p-3 rounded-xl bg-[var(--bg-hover)] space-y-2">
              <p className="text-2xs text-[var(--text-tertiary)] mb-2">Vista previa</p>
              <div className="flex gap-2 items-center">
                <button className="px-3 py-1.5 rounded-full text-xs font-semibold text-white" style={{ background: accentColor }}>
                  Botón primario
                </button>
                <span className="text-xs underline cursor-pointer" style={{ color: accentColor }}>Link de acento</span>
              </div>
              <div className="h-1.5 rounded-full" style={{ background: accentColor, width: "60%" }} />
            </div>
          </section>

          {/* Tamaño de fuente */}
          <section>
            <h3 className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-3">
              Tamaño de texto
            </h3>
            <div className="grid grid-cols-3 gap-2">
              {([
                { value: "sm" as const, label: "Pequeño", size: "12px" },
                { value: "md" as const, label: "Normal", size: "14px" },
                { value: "lg" as const, label: "Grande", size: "16px" },
              ]).map(({ value, label, size }) => (
                <button
                  key={value}
                  onClick={() => setFontSize(value)}
                  className={cn(
                    "flex flex-col items-center gap-1 py-3 rounded-xl border transition-all",
                    fontSize === value
                      ? "border-[var(--accent-500)] bg-[var(--info-bg)] text-[var(--accent-400)]"
                      : "border-[var(--border-subtle)] text-[var(--text-secondary)] hover:bg-[var(--bg-hover)]",
                  )}
                >
                  <Type className="h-4 w-4" />
                  <span style={{ fontSize: size }} className="font-medium leading-none">Aa</span>
                  <span className="text-2xs">{label}</span>
                </button>
              ))}
            </div>
          </section>
        </div>

        {/* Footer — always visible */}
        <div className="px-5 py-3 border-t border-[var(--border-subtle)] shrink-0 text-center bg-[var(--bg-canvas)]">
          {saving ? (
            <p className="text-2xs text-[var(--text-tertiary)]">Guardando…</p>
          ) : savedAt ? (
            <p className="text-2xs text-[var(--success-fg)] flex items-center justify-center gap-1">
              <Check className="h-3 w-3" /> Cambios guardados
            </p>
          ) : (
            <p className="text-2xs text-[var(--text-tertiary)]">
              Los cambios se aplican al instante
            </p>
          )}
        </div>
      </aside>
    </>
  );

  // Render via portal directly into body to escape any layout stacking context
  if (!mounted) return null;
  return createPortal(panel, document.body);
}
