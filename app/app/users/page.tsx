import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/get-session";
import { ComingSoon } from "@/components/ui/ComingSoon";

export default async function UsersPage() {
  const session = await getSession();
  if (session.workspace.kind !== "tenant") redirect("/");
  if (session.role !== "tenant_admin") redirect("/app");
  return <ComingSoon title="Usuarios" description="Equipo de trabajo y técnicos." delivery="Entrega 4" />;
}