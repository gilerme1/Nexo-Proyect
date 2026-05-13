import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/get-session";
import { ComingSoon } from "@/components/ui/ComingSoon";

export default async function BillingPage() {
  const session = await getSession();
  if (session.workspace.kind !== "tenant") redirect("/");
  if (session.role !== "tenant_admin") redirect("/app");
  return <ComingSoon title="Plan y facturación" description="Tu plan, uso, pagos y suscripción." delivery="Entrega 4" />;
}