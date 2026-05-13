import Link from "next/link";
import { Boxes, ChevronRight } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardBody } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { store } from "@/lib/data/store";

export default function EquipmentTypesPage() {
  const grouped = store.verticals.map((v) => ({
    vertical: v,
    types: store.equipmentTypes.filter((t) => t.verticalId === v.id),
  }));
  const total = store.equipmentTypes.length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Tipos de equipo"
        description="Catálogo de tipos de equipo agrupados por rubro. Los tipos se crean desde cada rubro."
      />

      {total === 0 ? (
        <Card>
          <EmptyState
            icon={Boxes}
            title="Sin tipos de equipo"
            description="Creá los rubros primero, después podés agregar tipos dentro de cada uno."
          />
        </Card>
      ) : (
        <div className="space-y-4">
          {grouped.map(({ vertical, types }) => (
            <Card key={vertical.id}>
              <div className="px-6 py-4 border-b border-[var(--border-subtle)] flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span className="text-sm font-semibold text-[var(--text-primary)]">
                    {vertical.name}
                  </span>
                  <Badge tone="neutral">
                    {types.length} tipo{types.length === 1 ? "" : "s"}
                  </Badge>
                </div>
                <Link
                  href={`/platform/verticals/${vertical.id}`}
                  className="flex items-center gap-1 text-2xs font-medium text-[var(--accent-400)] hover:text-[var(--accent-300)]"
                >
                  Administrar
                  <ChevronRight className="h-3 w-3" />
                </Link>
              </div>
              <CardBody className="p-3">
                {types.length === 0 ? (
                  <p className="px-2 py-4 text-sm text-[var(--text-tertiary)]">
                    Sin tipos en este rubro.
                  </p>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                    {types.map((t) => (
                      <div
                        key={t.id}
                        className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl bg-[var(--bg-hover)]"
                      >
                        <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-[var(--bg-card)] text-[var(--text-secondary)]">
                          <Boxes className="h-3 w-3" />
                        </span>
                        <div className="min-w-0">
                          <p className="text-xs font-medium text-[var(--text-primary)] truncate">
                            {t.name}
                          </p>
                          <p className="text-2xs text-[var(--text-tertiary)] font-mono truncate">
                            {t.slug}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardBody>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
