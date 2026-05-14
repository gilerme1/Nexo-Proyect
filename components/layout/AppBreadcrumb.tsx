"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";

const SEGMENT_LABELS: Record<string, string> = {
  app:           "Dashboard",
  equipment:     "Equipos",
  reports:       "Reportes",
  clients:       "Clientes",
  maintenances:  "Mantenimientos",
  map:           "Mapa",
  "qr-tags":     "Tags QR",
  settings:      "Configuración",
  users:         "Usuarios",
  billing:       "Facturación",
  new:           "Nuevo",
  edit:          "Editar",
  platform:      "Plataforma",
  tenants:       "Tenants",
  plans:         "Planes",
};

interface SearchEntry {
  id: string;
  label: string;
  href: string;
}

interface AppBreadcrumbProps {
  searchIndex?: SearchEntry[];
}

export function AppBreadcrumb({ searchIndex = [] }: AppBreadcrumbProps) {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);

  // Don't show on root dashboard
  if (pathname === "/app" || pathname === "/platform") return null;

  // Build a label lookup by ID from the search index
  const labelById = new Map(searchIndex.map((e) => [e.id, e.label]));

  type BreadcrumbItem = { label: string; href: string; isLast: boolean };
  const items: BreadcrumbItem[] = [];

  // Always start with Dashboard/Home depending on scope
  const root = segments[0] === "platform" ? { label: "Plataforma", href: "/platform" } : { label: "Dashboard", href: "/app" };
  items.push({ ...root, isLast: false });

  let accPath = "";
  for (let i = 0; i < segments.length; i++) {
    const seg = segments[i];
    accPath += `/${seg}`;
    const isLast = i === segments.length - 1;

    // Skip the root segment itself (already added above)
    if (seg === "app" || seg === "platform") continue;

    const staticLabel = SEGMENT_LABELS[seg];
    if (staticLabel) {
      items.push({ label: staticLabel, href: accPath, isLast });
    } else {
      // Dynamic segment — try to resolve from search index
      const dynamicLabel = labelById.get(seg) ?? seg;
      items.push({ label: dynamicLabel, href: accPath, isLast });
    }
  }

  if (items.length <= 1) return null;

  return (
    <nav
      aria-label="Breadcrumb"
      className="hidden lg:flex items-center gap-1 px-6 py-2 border-b border-[var(--border-subtle)] bg-[var(--bg-page)] text-xs text-[var(--text-tertiary)]"
    >
      <Home className="h-3 w-3 shrink-0" />
      {items.map((item, i) => (
        <span key={item.href} className="flex items-center gap-1">
          {i > 0 && <ChevronRight className="h-3 w-3 shrink-0 text-[var(--text-muted)]" />}
          {item.isLast ? (
            <span className="font-medium text-[var(--text-primary)]">{item.label}</span>
          ) : (
            <Link
              href={item.href}
              className="hover:text-[var(--text-primary)] hover:underline underline-offset-2 transition-colors"
            >
              {item.label}
            </Link>
          )}
        </span>
      ))}
    </nav>
  );
}
