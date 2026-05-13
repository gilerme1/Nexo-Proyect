import Link from "next/link";
import { Users, ShieldCheck, Building2 } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardBody } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Avatar } from "@/components/ui/Avatar";
import { EmptyState } from "@/components/ui/EmptyState";
import { store } from "@/lib/data/store";
import { formatRelative } from "@/lib/utils/format";

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
        <Card>
          <CardBody className="p-2">
            <ul className="space-y-1">
              {usersWithMemberships.map(({ user, memberships }) => (
                <li
                  key={user.id}
                  className="flex items-start gap-4 px-3 py-3 rounded-xl hover:bg-[var(--bg-hover)]"
                >
                  <Avatar name={user.name} size="md" />

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-medium text-[var(--text-primary)]">
                        {user.name}
                      </p>
                      {user.isPlatformAdmin && (
                        <Badge tone="info" size="sm">
                          <ShieldCheck className="h-2.5 w-2.5" />
                          Super Admin
                        </Badge>
                      )}
                    </div>
                    <p className="text-2xs text-[var(--text-tertiary)] mt-0.5">
                      {user.email} · creado {formatRelative(user.createdAt)}
                    </p>

                    {memberships.length > 0 && (
                      <div className="mt-2 flex flex-wrap items-center gap-1.5">
                        {memberships.map((m) => (
                          <Link
                            key={m.id}
                            href={`/platform/tenants/${m.tenant!.id}`}
                            className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-[var(--bg-card)] border border-[var(--border-default)] text-2xs text-[var(--text-secondary)] hover:border-[var(--border-strong)] hover:text-[var(--text-primary)]"
                          >
                            <Building2 className="h-2.5 w-2.5" />
                            {m.tenant!.name}
                            <span className="text-[var(--text-tertiary)]">
                              · {m.role === "tenant_admin" ? "Admin" : "Técnico"}
                            </span>
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </CardBody>
        </Card>
      )}
    </div>
  );
}
