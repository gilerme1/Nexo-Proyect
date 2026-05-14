import Link from "next/link";
import { redirect } from "next/navigation";
import { QrCode, Plus, Package, ChevronRight, CheckCircle2, Circle } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardBody } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { NewBatchForm } from "@/components/qr/NewBatchForm";
import { getSession } from "@/lib/auth/get-session";
import { store } from "@/lib/data/store";
import { formatRelative } from "@/lib/utils/format";

const STATUS_LABEL: Record<string, string> = {
  draft: "Borrador",
  printing: "Generando",
  printed: "Impreso",
  distributed: "Distribuido",
};
const STATUS_TONE: Record<string, "neutral" | "info" | "success" | "warning"> = {
  draft: "neutral",
  printing: "info",
  printed: "success",
  distributed: "success",
};

export default async function QrTagsPage() {
  const session = await getSession();
  if (session.workspace.kind !== "tenant") redirect("/");
  if (session.role !== "tenant_admin" && session.role !== "platform_admin") redirect("/app");
  const tenantId = session.workspace.tenantId;

  const batches = store.qrBatches
    .filter((b) => b.tenantId === tenantId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  let totalTags = 0;
  let freeTags = 0;
  let boundTags = 0;
  const tagsByBatch = new Map<string, typeof store.qrTags>();

  for (const tag of store.qrTags) {
    if (tag.tenantId !== tenantId) continue;
    totalTags += 1;
    if (tag.status === "free") freeTags += 1;
    if (tag.status === "bound") boundTags += 1;

    const tags = tagsByBatch.get(tag.batchId);
    if (tags) {
      tags.push(tag);
    } else {
      tagsByBatch.set(tag.batchId, [tag]);
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="QR Tags"
        description="Generá lotes de stickers QR, imprimílos en Avery 5160 y pegálos en los equipos."
        actions={<NewBatchForm />}
      />

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardBody className="py-4">
            <p className="text-2xs text-[var(--text-tertiary)]">Total generados</p>
            <p className="text-2xl font-semibold text-[var(--text-primary)] tabular mt-1">{totalTags}</p>
          </CardBody>
        </Card>
        <Card>
          <CardBody className="py-4">
            <p className="text-2xs text-[var(--text-tertiary)]">Libres</p>
            <p className="text-2xl font-semibold text-[var(--warning-fg)] tabular mt-1">{freeTags}</p>
          </CardBody>
        </Card>
        <Card>
          <CardBody className="py-4">
            <p className="text-2xs text-[var(--text-tertiary)]">Asignados</p>
            <p className="text-2xl font-semibold text-[var(--success-fg)] tabular mt-1">{boundTags}</p>
          </CardBody>
        </Card>
      </div>

      {/* Batches list */}
      {batches.length === 0 ? (
        <Card>
          <EmptyState
            icon={QrCode}
            title="Sin lotes todavía"
            description="Creá tu primer lote de QR para empezar a etiquetar equipos."
            action={<NewBatchForm inline />}
          />
        </Card>
      ) : (
        <Card>
          <div className="px-6 py-5 border-b border-[var(--border-subtle)]">
            <h3 className="text-sm font-semibold text-[var(--text-primary)]">Lotes</h3>
            <p className="text-2xs text-[var(--text-tertiary)] mt-0.5">{batches.length} lotes generados</p>
          </div>
          <CardBody className="p-2">
            <ul className="space-y-1">
              {batches.map((batch) => {
                const tags = tagsByBatch.get(batch.id) ?? [];
                let bound = 0;
                let free = 0;
                for (const tag of tags) {
                  if (tag.status === "bound") bound += 1;
                  if (tag.status === "free") free += 1;
                }
                const pct = tags.length > 0 ? Math.round((bound / tags.length) * 100) : 0;
                return (
                  <li key={batch.id}>
                    <Link
                      href={`/app/qr-tags/${batch.id}`}
                      className="flex items-center gap-4 px-3 py-3.5 rounded-xl hover:bg-[var(--bg-hover)]"
                    >
                      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[var(--bg-hover)] text-[var(--text-secondary)]">
                        <Package className="h-4 w-4" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="text-sm font-medium text-[var(--text-primary)] truncate">{batch.name}</p>
                          <Badge tone={STATUS_TONE[batch.status] ?? "neutral"}>
                            {STATUS_LABEL[batch.status] ?? batch.status}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-3 text-2xs text-[var(--text-tertiary)]">
                          <span className="tabular">{batch.size} stickers</span>
                          <span className="flex items-center gap-1">
                            <CheckCircle2 className="h-2.5 w-2.5 text-[var(--success-fg)]" />
                            {bound} asignados
                          </span>
                          <span className="flex items-center gap-1">
                            <Circle className="h-2.5 w-2.5 text-[var(--warning-fg)]" />
                            {free} libres
                          </span>
                          <span>{formatRelative(batch.createdAt)}</span>
                        </div>
                        {/* Progress bar */}
                        <div className="mt-2 h-1 bg-[var(--bg-hover)] rounded-full overflow-hidden w-full max-w-xs">
                          <div
                            className="h-full bg-[var(--accent-500)] rounded-full"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                      <ChevronRight className="h-4 w-4 text-[var(--text-tertiary)] shrink-0" />
                    </Link>
                  </li>
                );
              })}
            </ul>
          </CardBody>
        </Card>
      )}
    </div>
  );
}
