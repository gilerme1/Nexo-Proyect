import Link from "next/link";
import { CheckCircle2, ArrowRight, Zap } from "lucide-react";
import { store } from "@/lib/data/store";
import { BRAND } from "@/lib/brand";
import type { Plan } from "@/lib/types";
import { PricingToggle } from "@/components/landing/PricingToggle";

// This page reads from the store so any price change in Platform
// is immediately reflected here without touching this file.

function formatLimit(val: number | null, unit: string): string {
  if (val === null) return "Ilimitado";
  return `${val.toLocaleString("es-UY")} ${unit}`;
}

const FEATURE_LABELS: Record<string, string> = {
  formBuilder: "Form Builder (plantillas personalizables)",
  apiAccess: "Acceso a API",
  customDomain: "Dominio propio",
  prioritySupport: "Soporte prioritario",
  qrPrintBatches: "Lotes QR imprimibles",
  advancedAnalytics: "Analytics avanzado",
};

function PlanCard({
  plan,
  isPopular,
  yearly,
}: {
  plan: Plan;
  isPopular?: boolean;
  yearly: boolean;
}) {
  const price = plan.monthlyPriceUsd === 0
    ? null
    : yearly
      ? Math.round(plan.yearlyPriceUsd / 12)
      : plan.monthlyPriceUsd;

  const annualSaving = plan.monthlyPriceUsd > 0
    ? Math.round(plan.monthlyPriceUsd * 12 - plan.yearlyPriceUsd)
    : 0;

  return (
    <div
      className={`relative flex flex-col rounded-3xl border p-8 transition-all ${
        isPopular
          ? "bg-[#3b6cff] border-[#3b6cff] shadow-2xl shadow-[#3b6cff]/30 scale-[1.02]"
          : "bg-white/3 border-white/10 hover:bg-white/5 hover:border-white/15"
      }`}
    >
      {isPopular && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-[#fbbf24] text-[#0a1428] text-xs font-bold px-4 py-1.5 rounded-full shadow-lg">
          Más popular
        </div>
      )}

      <div className="mb-6">
        <p className={`text-sm font-semibold mb-1 ${isPopular ? "text-white/80" : "text-[#5f87ff]"}`}>
          {plan.name}
        </p>
        <p className={`text-sm leading-relaxed ${isPopular ? "text-white/60" : "text-white/40"}`}>
          {plan.description}
        </p>
      </div>

      <div className="mb-6">
        {price === null ? (
          <div>
            <p className={`text-4xl font-bold ${isPopular ? "text-white" : "text-white"}`}>
              A convenir
            </p>
            <p className={`text-sm mt-1 ${isPopular ? "text-white/60" : "text-white/40"}`}>
              Contactanos para cotizar
            </p>
          </div>
        ) : (
          <div>
            <div className="flex items-baseline gap-1">
              <span className={`text-sm font-medium ${isPopular ? "text-white/70" : "text-white/40"}`}>USD</span>
              <span className={`text-5xl font-bold tabular ${isPopular ? "text-white" : "text-white"}`}>
                ${price}
              </span>
              <span className={`text-sm ${isPopular ? "text-white/60" : "text-white/40"}`}>/mes</span>
            </div>
            {yearly && annualSaving > 0 && (
              <p className={`text-xs mt-1 ${isPopular ? "text-white/70" : "text-[#34d399]"}`}>
                Ahorrás ${annualSaving}/año con el plan anual
              </p>
            )}
          </div>
        )}
      </div>

      {/* Limits */}
      <ul className="space-y-2.5 mb-8 flex-1">
        {[
          { label: "Usuarios", value: formatLimit(plan.limits.users, "usuarios") },
          { label: "Equipos", value: formatLimit(plan.limits.equipment, "equipos") },
          { label: "Clientes", value: formatLimit(plan.limits.clients, "clientes") },
          { label: "Reportes/mes", value: formatLimit(plan.limits.reportsPerMonth, "reportes") },
          { label: "QR Tags/mes", value: formatLimit(plan.limits.qrTagsPerMonth, "tags") },
        ].map((item) => (
          <li key={item.label} className="flex items-center justify-between">
            <span className={`text-sm ${isPopular ? "text-white/70" : "text-white/50"}`}>
              {item.label}
            </span>
            <span className={`text-sm font-medium ${isPopular ? "text-white" : "text-white/80"}`}>
              {item.value}
            </span>
          </li>
        ))}

        <li className={`border-t pt-2.5 mt-2 ${isPopular ? "border-white/20" : "border-white/5"}`} />

        {Object.entries(plan.features).map(([key, val]) => (
          <li key={key} className="flex items-center gap-2.5">
            <CheckCircle2
              className={`h-4 w-4 shrink-0 ${
                val
                  ? isPopular
                    ? "text-white"
                    : "text-[#34d399]"
                  : "text-white/15"
              }`}
            />
            <span className={`text-sm ${val ? (isPopular ? "text-white/80" : "text-white/60") : "text-white/25"}`}>
              {FEATURE_LABELS[key] ?? key}
            </span>
          </li>
        ))}
      </ul>

      <Link
        href="/login"
        className={`flex items-center justify-center gap-2 py-3 px-6 rounded-full text-sm font-semibold transition-all ${
          isPopular
            ? "bg-white text-[#3b6cff] hover:bg-white/90"
            : "bg-white/10 text-white hover:bg-white/15 border border-white/10"
        }`}
      >
        {plan.monthlyPriceUsd === 0 ? "Contactar ventas" : "Empezar"}
        <ArrowRight className="h-4 w-4" />
      </Link>
    </div>
  );
}

export default function PricingPage() {
  // Read directly from store — updates automatically when changed in Platform
  const plans = store.plans
    .filter((p) => p.isPublic || p.slug === "enterprise")
    .sort((a, b) => a.sortOrder - b.sortOrder);

  return (
    <div className="min-h-screen text-white" style={{ background: "#060d1f" }}>
      {/* Background */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 70% 50% at 50% -5%, rgba(59,108,255,0.15), transparent 60%)",
        }}
        aria-hidden
      />

      {/* Navbar minimal */}
      <header className="relative px-5 h-16 flex items-center justify-between max-w-6xl mx-auto">
        <Link href="/" className="flex items-center gap-2.5">
          <span className="grid h-8 w-8 place-items-center rounded-xl bg-[#3b6cff] text-white text-sm font-bold">
            M
          </span>
          <span className="text-base font-bold text-white tracking-tight">{BRAND.name}</span>
        </Link>
        <Link
          href="/login"
          className="text-sm text-white/60 hover:text-white transition-colors"
        >
          Ingresar →
        </Link>
      </header>

      <main className="relative max-w-6xl mx-auto px-5 py-16">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 text-white/60 text-xs px-4 py-1.5 rounded-full mb-6">
            <Zap className="h-3 w-3 text-[#fbbf24]" />
            14 días de prueba gratis · Sin tarjeta
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-white tracking-tight mb-4">
            Planes y precios
          </h1>
          <p className="text-lg text-white/50 max-w-xl mx-auto">
            Elegí el plan que se adapta a tu equipo. Todos incluyen QR,
            reportes y mantenimientos programados.
          </p>
        </div>

        {/* Billing toggle — client component */}
        <PricingToggle plans={plans} />
      </main>

      {/* Footer */}
      <footer className="relative border-t border-white/5 py-8 px-5 mt-16">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-white/30">
          <span>© {new Date().getFullYear()} {BRAND.name} · Todos los derechos reservados</span>
          <Link href="/" className="hover:text-white/60 transition-colors">← Volver al inicio</Link>
        </div>
      </footer>
    </div>
  );
}
