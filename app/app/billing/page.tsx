import { redirect } from "next/navigation";
import { requireSession } from "@/lib/auth/get-session";
import { store } from "@/lib/data/store";
import { BillingClient } from "@/components/tenant/BillingClient";

export default async function BillingPage() {
  const session = await requireSession();
  if (session.workspace.kind !== "tenant") redirect("/");
  if (session.role !== "tenant_admin" && session.role !== "platform_admin") redirect("/app");

  const { tenantId } = session.workspace;

  const sub = store.subscriptions.find((s) => s.tenantId === tenantId);
  if (!sub) redirect("/app");

  const plan = store.plans.find((p) => p.id === sub.planId);
  if (!plan) redirect("/app");

  const usage = store.usageCounters.filter((u) => u.tenantId === tenantId);
  const allPlans = store.plans;

  return (
    <BillingClient
      currentPlan={plan}
      subscription={sub}
      allPlans={allPlans}
      usage={usage}
    />
  );
}
