import Link from "next/link";
import { WifiOff } from "lucide-react";
import { BRAND } from "@/lib/brand";

export default function OfflinePage() {
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-5 text-center"
      style={{ background: "#0a1428" }}
    >
      <span className="grid h-16 w-16 place-items-center rounded-2xl bg-white/5 border border-white/10 text-white/40 mb-6">
        <WifiOff className="h-8 w-8" />
      </span>
      <h1 className="text-xl font-semibold text-white mb-2">Sin conexión</h1>
      <p className="text-sm text-white/50 max-w-xs mb-8 leading-relaxed">
        Parece que no tenés internet en este momento. Algunas funciones como
        el clima y las cotizaciones no van a estar disponibles.
      </p>
      <Link
        href="/app"
        className="text-sm font-medium text-white bg-[#3b6cff] hover:bg-[#2553f0] px-6 py-2.5 rounded-full transition-colors"
      >
        Reintentar
      </Link>
      <p className="mt-8 text-2xs text-white/20">{BRAND.name}</p>
    </div>
  );
}
