import { notFound, redirect } from "next/navigation";
import { getSession } from "@/lib/auth/get-session";
import { store } from "@/lib/data/store";
import { ReportDetailEditor } from "@/components/reports/ReportDetailEditor";

export default async function ReportDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await getSession();
  if (session.workspace.kind !== "tenant") redirect("/");

  const { tenantId } = session.workspace as { kind: "tenant"; tenantId: string };
  const report = store.reports.find(
    (r) => r.id === id && r.tenantId === tenantId,
  );
  if (!report) notFound();

  const equipment = store.equipment.find((e) => e.id === report.equipmentId) ?? null;
  const client = store.clients.find((c) => c.id === report.clientId) ?? null;
  const location = report.locationId
    ? (store.locations.find((l) => l.id === report.locationId) ?? null)
    : null;
  const tech = store.users.find((u) => u.id === report.technicianId) ?? null;
  const tenant = store.tenants.find((t) => t.id === report.tenantId) ?? null;
  const eqType = equipment
    ? store.equipmentTypes.find((t) => t.id === equipment.equipmentTypeId)
    : null;

  return (
    <ReportDetailEditor
      report={report}
      equipment={equipment}
      client={client}
      location={location}
      tech={tech}
      tenant={tenant}
      eqTypeName={eqType?.name ?? "—"}
    />
  );
}
