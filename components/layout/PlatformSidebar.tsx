"use client";

import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Building2,
  Layers,
  Boxes,
  FileCog,
  Activity,
  Settings,
  Users,
  Sparkles,
  CreditCard,
} from "lucide-react";
import { SidebarShell } from "./SidebarShell";
import { SidebarItem, SidebarSection } from "./SidebarItem";
import { WorkspaceSwitcher } from "./WorkspaceSwitcher";
import type { Tenant } from "@/lib/types";

const nav = [
  { label: "Dashboard", href: "/platform", icon: LayoutDashboard, exact: true },
  { label: "Tenants", href: "/platform/tenants", icon: Building2 },
  { label: "Rubros", href: "/platform/verticals", icon: Layers },
  { label: "Tipos de equipo", href: "/platform/equipment-types", icon: Boxes },
  { label: "Plantillas", href: "/platform/templates", icon: FileCog },
  { label: "Planes", href: "/platform/plans", icon: Sparkles },
  { label: "Facturación", href: "/platform/billing", icon: CreditCard },
  { label: "Actividad", href: "/platform/activity", icon: Activity },
];

const secondary = [
  { label: "Usuarios", href: "/platform/users", icon: Users },
  { label: "Configuración", href: "/platform/settings", icon: Settings },
];

interface Props {
  tenants: Tenant[];
}

export function PlatformSidebar({ tenants }: Props) {
  const pathname = usePathname();

  const isActive = (href: string, exact?: boolean) =>
    exact
      ? pathname === href
      : pathname === href || pathname.startsWith(href + "/");

  return (
    <SidebarShell>
      <WorkspaceSwitcher current={{ kind: "platform" }} tenants={tenants} isPlatformAdmin />

      <nav className="flex-1 overflow-y-auto mt-4 -mx-1 px-1">
        <SidebarSection title="Operación" />
        <ul className="space-y-0.5 mb-5">
          {nav.map((item) => (
            <li key={item.href}>
              <SidebarItem
                href={item.href}
                icon={item.icon}
                label={item.label}
                active={isActive(item.href, item.exact)}
              />
            </li>
          ))}
        </ul>

        <SidebarSection title="Cuenta" />
        <ul className="space-y-0.5">
          {secondary.map((item) => (
            <li key={item.href}>
              <SidebarItem
                href={item.href}
                icon={item.icon}
                label={item.label}
                active={isActive(item.href)}
              />
            </li>
          ))}
        </ul>
      </nav>

    </SidebarShell>
  );
}
