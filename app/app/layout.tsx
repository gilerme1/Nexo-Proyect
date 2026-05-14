import { redirect } from "next/navigation";
import { requireSession } from "@/lib/auth/get-session";
import { getUserById, getTenantById } from "@/lib/data/users";
import { store } from "@/lib/data/store";
import { TenantSidebar } from "@/components/layout/TenantSidebar";
import { Topbar } from "@/components/layout/Topbar";
import { SidebarProvider } from "@/components/layout/SidebarContext";
import { CustomizationPanel } from "@/components/theme/CustomizationPanel";
import { MobileBottomNav } from "@/components/layout/MobileBottomNav";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireSession();

  if (session.workspace.kind !== "tenant") {
    redirect("/platform");
  }

  const currentTenant = getTenantById(session.workspace.tenantId);
  const user = getUserById(session.userId);

  if (!currentTenant || !user) redirect("/");

  const tenantId = currentTenant.id;

  // Build search index for topbar multi-method search
  const searchIndex = [
    ...store.equipment
      .filter((e) => e.tenantId === tenantId)
      .map((e) => {
        const loc = store.locations.find((l) => l.id === e.locationId);
        const client = store.clients.find((c) => c.id === e.clientId);
        return {
          id: e.id,
          label: e.name,
          sub: [
            e.internalCode,
            e.data?.serialNumber as string | undefined,
            client?.name,
            loc?.name,
          ]
            .filter(Boolean)
            .join(" · "),
          href: `/app/equipment/${e.id}`,
          icon: "equipment" as const,
        };
      }),
    ...store.clients
      .filter((c) => c.tenantId === tenantId)
      .map((c) => ({
        id: c.id,
        label: c.name,
        sub: c.contactName ?? c.taxId ?? "",
        href: `/app/clients/${c.id}`,
        icon: "client" as const,
      })),
    ...store.locations
      .filter((l) => l.tenantId === tenantId)
      .map((l) => {
        const client = store.clients.find((c) => c.id === l.clientId);
        return {
          id: l.id,
          label: l.name,
          sub: `${client?.name ?? "—"} · ${l.address}`,
          href: `/app/clients/${l.clientId}`,
          icon: "location" as const,
        };
      }),
  ];

  const overdueCount = store.scheduledMaintenances.filter(
    (m) => m.tenantId === tenantId && m.status === "overdue",
  ).length;

  return (
    <SidebarProvider>
      <div className="flex min-h-screen bg-[var(--bg-page)]">
        {/* Sidebar — desktop only. Hidden on mobile via SidebarShell internals. */}
        <TenantSidebar
          tenants={store.tenants}
          currentTenant={currentTenant}
          role={session.role}
          overdueCount={overdueCount}
        />

        <div className="flex-1 min-w-0 flex flex-col">
          <Topbar
            scope="tenant"
            scopeLabel={currentTenant.name}
            user={{ name: user.name, email: user.email }}
            searchIndex={searchIndex}
            tenantLogoUrl={currentTenant.branding?.logoUrl}
          />
          {/*
            pb-[calc(4rem+env(safe-area-inset-bottom))] prevents content from
            being hidden behind the mobile bottom nav (64px + iPhone notch).
            On desktop (lg+) we reset to normal vertical padding.
          */}
          <main className="flex-1 px-4 md:px-6 py-6
                           pb-[calc(4rem+env(safe-area-inset-bottom))] lg:pb-6">
            {children}
          </main>
        </div>
      </div>

      {/* Mobile bottom navigation — hidden on desktop via lg:hidden inside component */}
      <MobileBottomNav
        user={{ name: user.name, email: user.email }}
      />

      <CustomizationPanel
        tenantId={currentTenant.id}
        currentLogoUrl={currentTenant.branding?.logoUrl}
        tenantAccentColor={currentTenant.branding?.accentColor}
      />
    </SidebarProvider>
  );
}
