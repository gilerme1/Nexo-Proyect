import { Users } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { PlatformUsersClient } from "@/components/platform/PlatformUsersClient";
import { store } from "@/lib/data/store";

export default function PlatformUsersPage() {
  const usersWithMemberships = store.users.map((u) => {
    const memberships = store.memberships
      .filter((m) => m.userId === u.id)
      .map((m) => ({
        ...m,
        tenant: store.tenants.find((t) => t.id === m.tenantId),
      }))
      .filter((m) => m.tenant);
    return { user: u, memberships };
  });

  // Sort: platform admins first, then by name
  usersWithMemberships.sort((a, b) => {
    if (a.user.isPlatformAdmin !== b.user.isPlatformAdmin) {
      return a.user.isPlatformAdmin ? -1 : 1;
    }
    return a.user.name.localeCompare(b.user.name);
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Usuarios"
        description="Todas las personas con acceso a la plataforma. Incluye Super Admins y miembros de cada tenant."
      />

      {usersWithMemberships.length === 0 ? (
        <Card>
          <EmptyState
            icon={Users}
            title="Sin usuarios"
            description="Aún no hay usuarios registrados."
          />
        </Card>
      ) : (
        <PlatformUsersClient
          usersWithMemberships={usersWithMemberships}
          tenants={store.tenants}
        />
      )}
    </div>
  );
}
