import { redirect } from "next/navigation";
import { requireSession } from "@/lib/auth/get-session";
import { store } from "@/lib/data/store";
import { SettingsClient } from "@/components/tenant/SettingsClient";

export default async function SettingsPage() {
  const session = await requireSession();
  if (session.workspace.kind !== "tenant") redirect("/");
  if (session.role !== "tenant_admin" && session.role !== "platform_admin") redirect("/app");

  const { tenantId } = session.workspace;
  const tenant = store.tenants.find((t) => t.id === tenantId);
  if (!tenant) redirect("/app");

  return (
    <SettingsClient
      tenantId={tenant.id}
      name={tenant.name}
      legalName={tenant.legalName}
      branding={tenant.branding}
    />
  );
}
