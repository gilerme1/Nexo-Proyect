"use client";

import { useEffect, useMemo, useState } from "react";
import { ArrowLeftRight, Loader2 } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Select } from "@/components/ui/Select";
import { Tooltip } from "@/components/ui/Tooltip";

interface Rates {
  base: string;
  rates: Record<string, number>;
  fetchedAt: string;
}

const STORAGE_KEY = "maintly-rates-cache-v2";

const CURRENCIES = [
  { code: "USD", flag: "🇺🇸", label: "Dólar" },
  { code: "UYU", flag: "🇺🇾", label: "Peso uruguayo" },
  { code: "EUR", flag: "🇪🇺", label: "Euro" },
  { code: "BRL", flag: "🇧🇷", label: "Real" },
  { code: "ARS", flag: "🇦🇷", label: "Peso argentino" },
  { code: "CLP", flag: "🇨🇱", label: "Peso chileno" },
];

function flagFor(code: string): string {
  return CURRENCIES.find((c) => c.code === code)?.flag ?? "💱";
}

export function CurrencyConverter() {
  const [rates, setRates] = useState<Rates | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [amount, setAmount] = useState<string>("100");
  const [from, setFrom] = useState("USD");
  const [to, setTo] = useState("UYU");

  // Fetch rates with cache
  useEffect(() => {
    let cancelled = false;

    try {
      const cached = localStorage.getItem(STORAGE_KEY);
      if (cached) {
        const parsed: Rates & { _ts: number } = JSON.parse(cached);
        if (Date.now() - parsed._ts < 6 * 60 * 60 * 1000) {
          setRates(parsed);
          setLoading(false);
          return;
        }
      }
    } catch {
      // ignore
    }

    async function load() {
      try {
        const res = await fetch("https://open.er-api.com/v6/latest/USD");
        if (!res.ok) throw new Error("net");
        const j = await res.json();
        if (j.result !== "success") throw new Error("api");
        const r: Rates = {
          base: j.base_code ?? "USD",
          rates: j.rates ?? {},
          fetchedAt: j.time_last_update_utc ?? new Date().toISOString(),
        };
        if (!cancelled) {
          setRates(r);
          setLoading(false);
          try {
            localStorage.setItem(
              STORAGE_KEY,
              JSON.stringify({ ...r, _ts: Date.now() }),
            );
          } catch {
            // ignore
          }
        }
      } catch {
        if (!cancelled) {
          setError("No se pudo cargar las cotizaciones");
          setLoading(false);
        }
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  // Conversion: rates is base USD → X. To convert from A to B: amount * (rateB / rateA).
  const numericAmount = parseFloat(amount.replace(",", ".")) || 0;
  const result = useMemo(() => {
    if (!rates) return 0;
    const rateFrom = rates.rates[from];
    const rateTo = rates.rates[to];
    if (!rateFrom || !rateTo) return 0;
    return (numericAmount * rateTo) / rateFrom;
  }, [rates, numericAmount, from, to]);

  // Reference rate (1 unit of from → to)
  const unitRate = useMemo(() => {
    if (!rates) return 0;
    const rateFrom = rates.rates[from];
    const rateTo = rates.rates[to];
    if (!rateFrom || !rateTo) return 0;
    return rateTo / rateFrom;
  }, [rates, from, to]);

  function swap() {
    setFrom(to);
    setTo(from);
  }

  if (loading) {
    return (
      <Card>
        <div className="p-5 flex items-center justify-center min-h-[260px]">
          <Loader2 className="h-5 w-5 text-[var(--text-tertiary)] animate-spin" />
        </div>
      </Card>
    );
  }

  if (error || !rates) {
    return (
      <Card>
        <div className="p-5 min-h-[260px] flex flex-col items-center justify-center gap-2">
          <p className="text-2xs text-[var(--text-tertiary)]">{error}</p>
          <p className="text-2xs text-[var(--text-tertiary)]">
            Probá recargar más tarde
          </p>
        </div>
      </Card>
    );
  }

  return (
    <Card>
      <div className="p-5 space-y-4">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-[var(--text-primary)]">
              Conversor de divisas
            </p>
            <p className="text-2xs text-[var(--text-tertiary)] mt-0.5">
              Tasas actualizadas
            </p>
          </div>
        </div>

        {/* Amount + From */}
        <div>
          <label className="block text-2xs font-medium text-[var(--text-secondary)] mb-1.5">
            Monto a convertir
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              inputMode="decimal"
              value={amount}
              onChange={(e) => {
                // Allow only digits, comma and dot
                const cleaned = e.target.value.replace(/[^\d.,]/g, "");
                setAmount(cleaned);
              }}
              className="flex-1 min-w-0 h-10 px-3.5 text-sm tabular bg-[var(--bg-input)] border border-[var(--border-default)] rounded-full text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:border-[var(--accent-500)] focus:ring-2 focus:ring-[var(--accent-500)]/20 outline-none"
              placeholder="0"
            />
            <Select
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              className="w-[130px]"
            >
              {CURRENCIES.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.flag} {c.code}
                </option>
              ))}
            </Select>
          </div>
        </div>

        {/* Swap button */}
        <div className="flex justify-center">
          <Tooltip content="Invertir monedas" side="top">
            <button
              onClick={swap}
              type="button"
              aria-label="Invertir"
              className="grid h-9 w-9 place-items-center rounded-full bg-[var(--bg-card-elevated)] border border-[var(--border-default)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)]"
            >
              <ArrowLeftRight className="h-3.5 w-3.5" />
            </button>
          </Tooltip>
        </div>

        {/* Result + To */}
        <div>
          <label className="block text-2xs font-medium text-[var(--text-secondary)] mb-1.5">
            Equivalente
          </label>
          <div className="flex gap-2">
            <div className="flex-1 min-w-0 h-10 px-3.5 flex items-center text-sm tabular bg-[var(--bg-hover)] border border-[var(--border-subtle)] rounded-full text-[var(--text-primary)] font-semibold">
              {result.toLocaleString("es-UY", {
                maximumFractionDigits: 2,
                minimumFractionDigits: 2,
              })}
            </div>
            <Select
              value={to}
              onChange={(e) => setTo(e.target.value)}
              className="w-[130px]"
            >
              {CURRENCIES.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.flag} {c.code}
                </option>
              ))}
            </Select>
          </div>
        </div>

        {/* Unit rate */}
        <div className="pt-3 border-t border-[var(--border-subtle)] flex items-center justify-between">
          <p className="text-2xs text-[var(--text-tertiary)] tabular">
            <span>{flagFor(from)}</span> 1 {from} ={" "}
            <span className="text-[var(--text-secondary)] font-semibold">
              {unitRate.toLocaleString("es-UY", {
                maximumFractionDigits: 4,
                minimumFractionDigits: 2,
              })}
            </span>{" "}
            {to} <span>{flagFor(to)}</span>
          </p>
          <Tooltip content={`Última actualización: ${rates.fetchedAt}`} side="top">
            <span className="text-2xs text-[var(--text-tertiary)] cursor-default">
              fuente: open.er-api
            </span>
          </Tooltip>
        </div>
      </div>
    </Card>
  );
}
