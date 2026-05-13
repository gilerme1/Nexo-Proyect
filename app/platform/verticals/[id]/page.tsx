import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Layers, Building2 } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardBody } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { store } from "@/lib/data/store";
import { VerticalEquipmentTypes } from "@/components/platform/VerticalEquipmentTypes";

export default async function VerticalDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const vertical = store.verticals.find((v) => v.id === id);
  if (!vertical) notFound();

  const types = store.equipmentTypes.filter(
    (t) => t.verticalId === vertical.id,
  );
  const tenantsUsing = store.tenantVerticals
    .filter((tv) => tv.verticalId === vertical.id)
    .map((tv) => store.tenants.find((t) => t.id === tv.tenantId))
    .filter((t): t is NonNullable<typeof t> => Boolean(t));

  return (
    <div className="space-y-6">
      <Link
        href="/platform/verticals"
        className="inline-flex items-center gap-1.5 text-2xs text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]"
      >
        <ArrowLeft className="h-3 w-3" />
        Volver a rubros
      </Link>

      <PageHeader
        title={
          <span className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-2xl bg-[var(--info-bg)] text-[var(--info-fg)]">
              <Layers className="h-5 w-5" />
            </span>
            {vertical.name}
          </span>
        }
        description={vertical.description}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <VerticalEquipmentTypes
            verticalId={vertical.id}
            types={types}
          />
        </div>

        <div className="space-y-6">
          <Card>
            <div className="px-6 py-5 border-b border-[var(--border-subtle)]">
              <h3 className="text-sm font-semibold text-[var(--text-primary)]">
                Tenants que usan este rubro
              </h3>
              <p className="text-2xs text-[var(--text-tertiary)] mt-0.5">
                {tenantsUsing.length} empresa
                {tenantsUsing.length === 1 ? "" : "s"}
              </p>
            </div>
            <CardBody className="p-2">
              {tenantsUsing.length === 0 ? (
                <p className="px-4 py-6 text-center text-sm text-[var(--text-tertiary)]">
                  Sin tenants asignados.
                </p>
              ) : (
                <ul className="space-y-1">
                  {tenantsUsing.map((t) => (
                    <li key={t.id}>
                      <Link
                        href={`/platform/tenants/${t.id}`}
                        className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-[var(--bg-hover)]"
                      >
                        <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-[var(--info-bg)] text-[var(--info-fg)]">
                          <Building2 className="h-3.5 w-3.5" />
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium text-[var(--text-primary)]">
                            {t.name}
                          </p>
                          <p className="truncate text-2xs text-[var(--text-tertiary)]">
                            plan {t.plan}
                          </p>
                        </div>
                        {t.status === "suspended" && (
                          <Badge tone="danger" size="sm">
                            Suspendido
                          </Badge>
                        )}
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
}
