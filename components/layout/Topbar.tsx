"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Search, Bell, ScanLine, Wrench, Building2, MapPin, LogOut } from "lucide-react";
import { BRAND } from "@/lib/brand";
import { HamburgerButton } from "./HamburgerButton";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { Avatar } from "@/components/ui/Avatar";
import { Tooltip } from "@/components/ui/Tooltip";
import { QrScanner } from "@/components/qr/QrScanner";
import { logout } from "@/lib/auth/actions";
import { cn } from "@/lib/utils/cn";

interface SearchResult {
  id: string;
  label: string;
  sub: string;
  href: string;
  icon: "equipment" | "client" | "location";
}

interface Props {
  scope: "platform" | "tenant";
  scopeLabel: string;
  user: { name: string; email: string };
  searchIndex?: SearchResult[];
  /** Tenant logo URL — shown instead of M monogram when present */
  tenantLogoUrl?: string;
}

export function Topbar({ scope, scopeLabel, user, searchIndex = [], tenantLogoUrl }: Props) {

  const [scannerOpen, setScannerOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [focused, setFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const results =
    query.trim().length >= 2
      ? searchIndex.filter((r) =>
          r.label.toLowerCase().includes(query.toLowerCase()) ||
          r.sub.toLowerCase().includes(query.toLowerCase()),
        ).slice(0, 6)
      : [];

  function handleSelect(href: string) {
    setQuery("");
    setFocused(false);
    router.push(href);
  }

  // Close on Escape
  useEffect(() => {
    function handler(e: KeyboardEvent) {
      if (e.key === "Escape") { setQuery(""); setFocused(false); }
    }
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, []);

  const iconMap = {
    equipment: <Wrench className="h-3.5 w-3.5" />,
    client: <Building2 className="h-3.5 w-3.5" />,
    location: <MapPin className="h-3.5 w-3.5" />,
  };

  return (
    <>
      <header className="h-16 sticky top-0 z-30 px-4 md:px-6 flex items-center justify-between gap-3 bg-[var(--bg-page)]/80 backdrop-blur-md border-b border-[var(--border-subtle)]">
        {/* Left: hamburger (desktop animated, mobile drawer opener) + brand */}
        <div className="flex items-center gap-2 min-w-0">
          <HamburgerButton />

          <div className="flex items-center gap-2 min-w-0">
            {tenantLogoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={tenantLogoUrl}
                alt={scopeLabel}
                className="h-7 max-w-[120px] object-contain"
              />
            ) : (
              <>
                <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-[var(--accent-500)] text-white text-xs font-bold">
                  {BRAND.monogram}
                </span>
                <div className="flex flex-col leading-tight min-w-0">
                  <span className="text-sm font-semibold text-[var(--text-primary)] tracking-tight truncate">
                    {BRAND.shortName}
                  </span>
                  <span className="text-2xs text-[var(--text-tertiary)] lg:hidden truncate">
                    {scopeLabel}
                  </span>
                </div>
              </>
            )}
            <span className="text-2xs text-[var(--text-tertiary)] ml-1 hidden lg:inline truncate">
              / {scopeLabel}
            </span>
          </div>
        </div>

        {/* Center: search with dropdown */}
        <div className="hidden md:block flex-1 max-w-md relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[var(--text-tertiary)] pointer-events-none" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => setTimeout(() => setFocused(false), 150)}
            placeholder="Buscar equipo por nombre, código o serial…"
            className="w-full h-9 pl-10 pr-4 text-sm bg-[var(--bg-input)] border border-[var(--border-subtle)] hover:border-[var(--border-default)] focus:border-[var(--accent-500)] focus:ring-2 focus:ring-[var(--accent-500)]/20 rounded-full outline-none placeholder:text-[var(--text-tertiary)] text-[var(--text-primary)]"
          />

          {/* Dropdown results */}
          {focused && results.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-[var(--bg-card-elevated)] border border-[var(--border-default)] rounded-2xl shadow-[var(--shadow-elevated)] overflow-hidden z-50">
              {results.map((r) => (
                <button
                  key={r.id}
                  onMouseDown={() => handleSelect(r.href)}
                  className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-[var(--bg-hover)] text-left"
                >
                  <span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-[var(--bg-hover)] text-[var(--text-secondary)]">
                    {iconMap[r.icon]}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-[var(--text-primary)] truncate">{r.label}</p>
                    <p className="text-2xs text-[var(--text-tertiary)] truncate">{r.sub}</p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right: scanner (tenant), notifications, avatar */}
        <div className="flex items-center gap-2 shrink-0">
          {scope === "tenant" && (
            <Tooltip content="Escanear QR" side="bottom">
              <button
                onClick={() => setScannerOpen(true)}
                aria-label="Escanear QR"
                className="hidden lg:flex h-9 w-9 items-center justify-center rounded-full bg-[var(--bg-card)] border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[var(--accent-400)] hover:border-[var(--accent-500)] hover:bg-[var(--info-bg)]"
              >
                <ScanLine className="h-3.5 w-3.5" />
              </button>
            </Tooltip>
          )}

          <ThemeToggle />

          <Tooltip content="Notificaciones" side="bottom">
            <button className="grid h-9 w-9 place-items-center rounded-full bg-[var(--bg-card)] border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] relative">
              <Bell className="h-3.5 w-3.5" />
              <span className="absolute top-2 right-2 h-1.5 w-1.5 rounded-full bg-[var(--danger-fg)]" />
            </button>
          </Tooltip>

          <AvatarMenu user={user} />
        </div>
      </header>

      {/* QR Scanner fullscreen overlay */}
      {scannerOpen && <QrScanner onClose={() => setScannerOpen(false)} />}
    </>
  );
}

function AvatarMenu({ user }: { user: { name: string; email: string } }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    if (open) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button onClick={() => setOpen(!open)} className="rounded-full">
        <Avatar name={user.name} size="md" />
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-2 w-56 bg-[var(--bg-card-elevated)] border border-[var(--border-default)] rounded-2xl shadow-[var(--shadow-elevated)] overflow-hidden z-50">
          <div className="px-4 py-3 border-b border-[var(--border-subtle)]">
            <p className="text-sm font-semibold text-[var(--text-primary)] truncate">{user.name}</p>
            <p className="text-2xs text-[var(--text-tertiary)] truncate">{user.email}</p>
          </div>
          <div className="p-1.5">
            <form action={async () => { await logout(); }}>
              <button type="submit" className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm text-[var(--danger-fg)] hover:bg-[var(--danger-bg)] text-left">
                <LogOut className="h-4 w-4" />
                Cerrar sesión
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
