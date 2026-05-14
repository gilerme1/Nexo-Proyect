import { notFound, redirect } from "next/navigation";
import { getSession } from "@/lib/auth/get-session";
import { store } from "@/lib/data/store";
import { UserDetailEditor } from "@/components/tenant/UserDetailEditor";

export default async function UserDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await getSession();
  if (session.workspace.kind !== "tenant") redirect("/");
  if (session.role !== "tenant_admin" && session.role !== "platform_admin") redirect("/app");

  const { tenantId } = session.workspace;

  const user = store.users.find((u) => u.id === id);
  if (!user) notFound();

  const membership = store.memberships.find(
    (m) => m.userId === id && m.tenantId === tenantId && m.active,
  );
  if (!membership) notFound();

  const reportCount = store.reports.filter((r) => r.technicianId === id && r.tenantId === tenantId).length;
  const recentReports = store.reports
    .filter((r) => r.technicianId === id && r.tenantId === tenantId)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5)
    .map((r) => {
      const eq = store.equipment.find((e) => e.id === r.equipmentId);
      return { id: r.id, code: r.code, date: r.date, status: r.status, equipmentName: eq?.name ?? "—" };
    });

  return (
    <UserDetailEditor
      user={{ id: user.id, name: user.name, email: user.email, createdAt: user.createdAt }}
      membership={{ id: membership.id, role: membership.role, tenantId }}
      isCurrentUser={user.id === session.userId}
      reportCount={reportCount}
      recentReports={recentReports}
    />
  );
}
