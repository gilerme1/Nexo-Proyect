"use client";

import { useState } from "react";
import Link from "next/link";
import { CheckCircle2, ArrowRight } from "lucide-react";
import type { Plan } from "@/lib/types";

const FEATURE_LABELS: Record<string, string> = {
  formBuilder: "Form Builder (plantillas personalizables)",
  apiAccess: "Acceso a API",
  customDomain: "Dominio propio",
  prioritySupport: "Soporte prioritario",
  qrPrintBatches: "Lotes QR imprimibles",
  advancedAnalytics: "Analytics avanzado",
};

function formatLimit(val: number | null, unit: string): string {
  if (val === null) return "Ilimitado";
  return `${val.toLocaleString("es-UY")} ${unit}`;
}

export function PricingToggle({ plans }: { plans: Plan[] }) {
  const [yearly, setYearly] = useState(false);

  return (
    <>
      {/* Toggle */}
      <div className="flex items-center justify-center gap-3 mb-12">
        <span className={`text-sm ${!yearly ? "text-white" : "text-white/40"}`}>Mensual</span>
        <button
          onClick={() => setYearly(!yearly)}
          className={`relative h-6 w-11 rounded-full transition-colors ${
            yearly ? "bg-[#3b6cff]" : "bg-white/20"
          }`}
        >
          <span
            className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
              yearly ? "translate-x-5" : "translate-x-0.5"
            }`}
          />
        </button>
        <span className={`text-sm ${yearly ? "text-white" : "text-white/40"}`}>
          Anual
          <span className="ml-1.5 text-xs text-[#34d399] font-medium">-17%</span>
        </span>
      </div>

      {/* Plan cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-stretch">
        {plans.map((plan) => {
          const isPopular = plan.slug === "pro";
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
              key={plan.id}
              className={`relative flex flex-col rounded-3xl border p-7 transition-all ${
                isPopular
                  ? "bg-[#3b6cff] border-[#3b6cff] shadow-2xl shadow-[#3b6cff]/30 scale-[1.02]"
                  : "bg-white/3 border-white/10 hover:bg-white/5 hover:border-white/15"
              }`}
            >
              {isPopular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-[#fbbf24] text-[#0a1428] text-xs font-bold px-4 py-1.5 rounded-full shadow-lg whitespace-nowrap">
                  Más popular
                </div>
              )}

              <div className="mb-5">
                <p className={`text-sm font-semibold mb-1 ${isPopular ? "text-white/80" : "text-[#5f87ff]"}`}>
                  {plan.name}
                </p>
                <p className={`text-xs leading-relaxed ${isPopular ? "text-white/60" : "text-white/40"}`}>
                  {plan.description}
                </p>
              </div>

              <div className="mb-5">
                {price === null ? (
                  <div>
                    <p className="text-3xl font-bold text-white">A convenir</p>
                    <p className={`text-xs mt-1 ${isPopular ? "text-white/60" : "text-white/40"}`}>
                      Contactanos
                    </p>
                  </div>
                ) : (
                  <div>
                    <div className="flex items-baseline gap-1">
                      <span className={`text-xs font-medium ${isPopular ? "text-white/70" : "text-white/40"}`}>USD</span>
                      <span className="text-4xl font-bold tabular text-white">${price}</span>
                      <span className={`text-xs ${isPopular ? "text-white/60" : "text-white/40"}`}>/mes</span>
                    </div>
                    {yearly && annualSaving > 0 && (
                      <p className={`text-xs mt-1 ${isPopular ? "text-white/70" : "text-[#34d399]"}`}>
                        Ahorrás ${annualSaving}/año
                      </p>
                    )}
                  </div>
                )}
              </div>

              <ul className="space-y-2 mb-6 flex-1 text-xs">
                {[
                  { label: "Usuarios", value: formatLimit(plan.limits.users, "usuarios") },
                  { label: "Equipos", value: formatLimit(plan.limits.equipment, "equipos") },
                  { label: "Clientes", value: formatLimit(plan.limits.clients, "clientes") },
                  { label: "Reportes/mes", value: formatLimit(plan.limits.reportsPerMonth, "reportes") },
                ].map((item) => (
                  <li key={item.label} className="flex items-center justify-between">
                    <span className={isPopular ? "text-white/70" : "text-white/40"}>{item.label}</span>
                    <span className={`font-medium ${isPopular ? "text-white" : "text-white/70"}`}>{item.value}</span>
                  </li>
                ))}

                <li className={`border-t pt-2 mt-2 ${isPopular ? "border-white/20" : "border-white/5"}`} />

                {Object.entries(plan.features).map(([key, val]) => (
                  <li key={key} className="flex items-center gap-2">
                    <CheckCircle2
                      className={`h-3.5 w-3.5 shrink-0 ${
                        val ? (isPopular ? "text-white" : "text-[#34d399]") : "text-white/15"
                      }`}
                    />
                    <span className={val ? (isPopular ? "text-white/80" : "text-white/60") : "text-white/25"}>
                      {FEATURE_LABELS[key] ?? key}
                    </span>
                  </li>
                ))}
              </ul>

              <Link
                href="/login"
                className={`flex items-center justify-center gap-2 py-2.5 px-5 rounded-full text-xs font-semibold transition-all ${
                  isPopular
                    ? "bg-white text-[#3b6cff] hover:bg-white/90"
                    : "bg-white/10 text-white hover:bg-white/15 border border-white/10"
                }`}
              >
                {plan.monthlyPriceUsd === 0 ? "Contactar ventas" : "Empezar gratis"}
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          );
        })}
      </div>

      {/* FAQ mínimo */}
      <div className="mt-16 text-center">
        <p className="text-sm text-white/40">
          ¿Tenés dudas sobre qué plan elegir?{" "}
          <a
            href="mailto:hola@maintly.app"
            className="text-[#5f87ff] hover:underline"
          >
            Escribinos
          </a>{" "}
          y te ayudamos.
        </p>
      </div>
    </>
  );
}
