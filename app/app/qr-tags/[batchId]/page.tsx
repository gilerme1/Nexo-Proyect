import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft, CheckCircle2, Circle, XCircle, QrCode } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardBody } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { QrPdfGenerator } from "@/components/qr/QrPdfGenerator";
import { getSession } from "@/lib/auth/get-session";
import { store } from "@/lib/data/store";
import { formatRelative } from "@/lib/utils/format";

const STATUS_TONE: Record<string, "neutral" | "info" | "success" | "warning" | "danger"> = {
  free: "warning",
  claimed: "info",
  bound: "success",
  voided: "danger",
};
const STATUS_LABEL: Record<string, string> = {
  free: "Libre",
  claimed: "En proceso",
  bound: "Asignado",
  voided: "Anulado",
};

export default async function QrBatchDetailPage({
  params,
}: {
  params: Promise<{ batchId: string }>;
}) {
  const { batchId } = await params;
  const session = await getSession();
  if (session.workspace.kind !== "tenant") redirect("/");

  const { tenantId } = session.workspace as { kind: "tenant"; tenantId: string };
  const batch = store.qrBatches.find(
    (b) => b.id === batchId && b.tenantId === tenantId,
  );
  if (!batch) notFound();

  const tags = store.qrTags
    .filter((t) => t.batchId === batchId)
    .sort((a, b) => a.code.localeCompare(b.code));

  const freeTags: typeof tags = [];
  let bound = 0;
  let voided = 0;
  for (const tag of tags) {
    if (tag.status === "free") freeTags.push(tag);
    if (tag.status === "bound") bound += 1;
    if (tag.status === "voided") voided += 1;
  }
  const equipmentById = new Map(
    store.equipment
      .filter((item) => item.tenantId === tenantId)
      .map((item) => [item.id, item]),
  );
  const pct = tags.length > 0 ? Math.round((bound / tags.length) * 100) : 0;

  return (
    <div className="space-y-6">
      <Link
        href="/app/qr-tags"
        className="inline-flex items-center gap-1.5 text-2xs text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]"
      >
        <ArrowLeft className="h-3 w-3" />
        Volver a lotes
      </Link>

      <PageHeader
        title={batch.name}
        description={`${batch.size} stickers · Avery 5160 · creado ${formatRelative(batch.createdAt)}`}
        actions={
          <QrPdfGenerator batch={batch} tags={freeTags.length > 0 ? freeTags : tags} />
        }
      />

      {/* Progress */}
      <Card>
        <CardBody className="py-5">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-medium text-[var(--text-primary)]">
              {pct}% asignados
            </p>
            <p className="text-2xs text-[var(--text-tertiary)] tabular">
              {bound} de {tags.length}
            </p>
          </div>
          <div className="h-2 bg-[var(--bg-hover)] rounded-full overflow-hidden">
            <div
              className="h-full bg-[var(--accent-500)] rounded-full transition-all"
              style={{ width: `${pct}%` }}
            />
          </div>
          <div className="flex gap-4 mt-3 text-2xs text-[var(--text-tertiary)]">
            <span className="flex items-center gap-1">
              <CheckCircle2 className="h-3 w-3 text-[var(--success-fg)]" /> {bound} asignados
            </span>
            <span className="flex items-center gap-1">
              <Circle className="h-3 w-3 text-[var(--warning-fg)]" /> {freeTags.length} libres
            </span>
            <span className="flex items-center gap-1">
              <XCircle className="h-3 w-3 text-[var(--text-tertiary)]" />
              {voided} anulados
            </span>
          </div>
        </CardBody>
      </Card>

      {/* Tags grid */}
      <Card>
        <div className="px-6 py-5 border-b border-[var(--border-subtle)]">
          <h3 className="text-sm font-semibold text-[var(--text-primary)]">
            Todos los QR de este lote
          </h3>
          <p className="text-2xs text-[var(--text-tertiary)] mt-0.5">
            Hacé click en un QR libre para ver su URL de registro
          </p>
        </div>
        <CardBody className="p-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
            {tags.map((tag) => {
              const eq = tag.equipmentId ? equipmentById.get(tag.equipmentId) : null;
              return (
                <div
                  key={tag.id}
                  className="flex flex-col items-center gap-1.5 p-3 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-page)] text-center"
                >
                  <QrCode className={`h-5 w-5 ${tag.status === "bound" ? "text-[var(--success-fg)]" : tag.status === "voided" ? "text-[var(--text-tertiary)]" : "text-[var(--warning-fg)]"}`} />
                  <code className="text-2xs font-mono text-[var(--text-primary)] font-semibold leading-tight">
                    {tag.code}
                  </code>
                  <Badge tone={STATUS_TONE[tag.status] ?? "neutral"} size="sm">
                    {STATUS_LABEL[tag.status] ?? tag.status}
                  </Badge>
                  {eq && (
                    <Link
                      href={`/app/equipment/${eq.id}`}
                      className="text-2xs text-[var(--accent-400)] hover:underline truncate w-full"
                    >
                      {eq.name}
                    </Link>
                  )}
                  {tag.status === "free" && (
                    <a
                      href={tag.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-2xs text-[var(--text-tertiary)] hover:text-[var(--accent-400)] truncate w-full"
                    >
                      /q/{tag.code.slice(-8)}
                    </a>
                  )}
                </div>
              );
            })}
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
