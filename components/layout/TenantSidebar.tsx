"use client";

import { usePathname } from "next/navigation";
import type { LucideIcon } from "lucide-react";
import {
  LayoutDashboard,
  Building2,
  MapPin,
  Wrench,
  FileText,
  CalendarClock,
  QrCode,
  Users,
  CreditCard,
  Settings,
} from "lucide-react";
import { SidebarShell } from "./SidebarShell";
import { SidebarItem, SidebarSection } from "./SidebarItem";
import { SidebarCollapseToggle } from "./SidebarCollapseToggle";
import { WorkspaceSwitcher } from "./WorkspaceSwitcher";
import type { Tenant, AppRole } from "@/lib/types";

interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  exact?: boolean;
  roles?: AppRole[];
  badgeKey?: "overdueCount";
}

const nav: NavItem[] = [
  { label: "Dashboard",      href: "/app",              icon: LayoutDashboard, exact: true },
  { label: "Clientes",       href: "/app/clients",      icon: Building2 },
  { label: "Ubicaciones",    href: "/app/locations",    icon: MapPin,          roles: ["tenant_admin"] },
  { label: "Equipos",        href: "/app/equipment",    icon: Wrench },
  { label: "Reportes",       href: "/app/reports",      icon: FileText },
  { label: "Mantenimientos", href: "/app/maintenances", icon: CalendarClock,   badgeKey: "overdueCount" },
  { label: "QR Tags",        href: "/app/qr-tags",      icon: QrCode,          roles: ["tenant_admin"] },
];

const secondary: NavItem[] = [
  { label: "Usuarios",           href: "/app/users",    icon: Users,      roles: ["tenant_admin"] },
  { label: "Plan & facturación", href: "/app/billing",  icon: CreditCard, roles: ["tenant_admin"] },
  { label: "Configuración",      href: "/app/settings", icon: Settings,   roles: ["tenant_admin"] },
];

interface Props {
  tenants: Tenant[];
  currentTenant: Tenant;
  role: AppRole;
  overdueCount?: number;
}

export function TenantSidebar({ tenants, currentTenant, role, overdueCount = 0 }: Props) {
  const pathname = usePathname();

  const isActive = (href: string, exact?: boolean) =>
    exact
      ? pathname === href
      : pathname === href || pathname.startsWith(href + "/");

  const visible = (item: NavItem) =>
    !item.roles || item.roles.includes(role);

  const badges: Record<string, number> = { overdueCount };

  const visibleNav       = nav.filter(visible);
  const visibleSecondary = secondary.filter(visible);

  return (
    <SidebarShell>
      <WorkspaceSwitcher
        current={{ kind: "tenant", tenant: currentTenant }}
        tenants={tenants}
      />

      <nav className="flex-1 overflow-y-auto mt-4 -mx-1 px-1">
        <SidebarSection title="Operación" />
        <ul className="space-y-0.5 mb-5">
          {visibleNav.map((item) => (
            <li key={item.href}>
              <SidebarItem
                href={item.href}
                icon={item.icon}
                label={item.label}
                active={isActive(item.href, item.exact)}
                badge={item.badgeKey ? badges[item.badgeKey] : undefined}
              />
            </li>
          ))}
        </ul>

        {visibleSecondary.length > 0 && (
          <>
            <SidebarSection title="Cuenta" />
            <ul className="space-y-0.5">
              {visibleSecondary.map((item) => (
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
          </>
        )}
      </nav>

      <div className="mt-3 pt-3 border-t border-[var(--border-subtle)]">
        <SidebarCollapseToggle />
      </div>
    </SidebarShell>
  );
}