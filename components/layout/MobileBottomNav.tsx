"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { LayoutDashboard, MapPin, ScanLine, Wrench, ClipboardList } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { QrScanner } from "@/components/qr/QrScanner";

interface MobileBottomNavProps {
  user: { name: string; email: string };
}

const ROUTE_MAP = [
  { tab: "dashboard", pattern: /^\/app$/ },
  { tab: "mapa",      pattern: /^\/app\/map/ },
  { tab: "scanner",   pattern: null },
  { tab: "equipos",   pattern: /^\/app\/equipment/ },
  { tab: "registros", pattern: /^\/app\/reports/ },
];

const LEFT_TABS = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, href: "/app" },
  { id: "mapa",      label: "Mapa",      icon: MapPin,           href: "/app/map" },
] as const;

const RIGHT_TABS = [
  { id: "equipos",   label: "Equipos",   icon: Wrench,        href: "/app/equipment" },
  { id: "registros", label: "Registros", icon: ClipboardList, href: "/app/reports" },
] as const;

export function MobileBottomNav({ user: _user }: MobileBottomNavProps) {
  const pathname = usePathname();
  const [scanOpen, setScanOpen] = useState(false);
  const activeTab = ROUTE_MAP.find(({ pattern }) => pattern?.test(pathname))?.tab ?? null;

  return (
    <>
      {/* lg:hidden via CSS — never affected by JS hydration timing */}
      <nav
        style={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 9999,
          paddingBottom: "env(safe-area-inset-bottom)",
        }}
        className="lg:hidden bg-[var(--bg-canvas)] border-t border-[var(--border-subtle)]"
      >
        <div className="flex h-16 items-end pb-2">
          {LEFT_TABS.map(({ id, label, icon: Icon, href }) => {
            const active = activeTab === id;
            return (
              <Link key={id} href={href} className="group flex flex-1 flex-col items-center gap-1 active:opacity-60 transition-opacity duration-100">
                <Icon className={cn("h-5 w-5 group-hover:scale-110 transition-transform duration-150", active ? "text-[var(--accent-500)]" : "text-[var(--text-tertiary)]")} />
                <span className={cn("text-[10px] font-medium", active ? "text-[var(--accent-500)]" : "text-[var(--text-tertiary)]")}>
                  {label}
                </span>
              </Link>
            );
          })}

          {/* Central scan button */}
          <div className="flex flex-1 justify-center">
            <button
              type="button"
              onClick={() => setScanOpen(true)}
              aria-label="Escanear QR"
              className="group h-14 w-14 -mt-7 grid place-items-center rounded-full bg-[var(--accent-500)] text-white shadow-lg cursor-pointer hover:brightness-110 active:scale-90 transition-all duration-150"
            >
              <ScanLine className="h-6 w-6 group-hover:scale-110 transition-transform duration-150" />
            </button>
          </div>

          {RIGHT_TABS.map(({ id, label, icon: Icon, href }) => {
            const active = activeTab === id;
            return (
              <Link key={id} href={href} className="group flex flex-1 flex-col items-center gap-1 active:opacity-60 transition-opacity duration-100">
                <Icon className={cn("h-5 w-5 group-hover:scale-110 transition-transform duration-150", active ? "text-[var(--accent-500)]" : "text-[var(--text-tertiary)]")} />
                <span className={cn("text-[10px] font-medium", active ? "text-[var(--accent-500)]" : "text-[var(--text-tertiary)]")}>
                  {label}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>

      {scanOpen && <QrScanner onClose={() => setScanOpen(false)} />}
    </>
  );
}
