import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/get-session";
import { ComingSoon } from "@/components/ui/ComingSoon";

export default async function SettingsPage() {
  const session = await getSession();
  if (session.workspace.kind !== "tenant") redirect("/");
  if (session.role !== "tenant_admin") redirect("/app");
  return <ComingSoon title="Configuración" description="Configuración del tenant." delivery="Entrega 4" />;
}