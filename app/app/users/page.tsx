import { redirect } from "next/navigation";
import { requireSession } from "@/lib/auth/get-session";
import { store } from "@/lib/data/store";
import { UsersClient } from "@/components/tenant/UsersClient";

export default async function UsersPage() {
  const session = await requireSession();
  if (session.workspace.kind !== "tenant") redirect("/");
  if (session.role !== "tenant_admin" && session.role !== "platform_admin") redirect("/app");

  const { tenantId } = session.workspace;

  const memberships = store.memberships.filter(
    (m) => m.tenantId === tenantId && m.active,
  );

  const members = memberships.map((m) => {
    const user = store.users.find((u) => u.id === m.userId);
    return {
      membershipId: m.id,
      userId: m.userId,
      name: user?.name ?? m.userId,
      email: user?.email ?? "—",
      role: m.role,
      createdAt: m.createdAt,
      isCurrentUser: m.userId === session.userId,
    };
  });

  const sub = store.subscriptions.find((s) => s.tenantId === tenantId);
  const plan = sub ? store.plans.find((p) => p.id === sub.planId) : null;
  const planUserLimit = plan?.limits.users ?? null;

  return (
    <UsersClient
      members={members}
      tenantId={tenantId}
      planUserLimit={planUserLimit}
    />
  );
}
