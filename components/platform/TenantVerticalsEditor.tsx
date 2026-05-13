"use client";

import { useState, useTransition } from "react";
import { Check } from "lucide-react";
import { Card, CardBody } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils/cn";
import { setTenantVerticals } from "@/lib/actions/tenants";
import type { BusinessVertical } from "@/lib/types";

interface Props {
  tenantId: string;
  assignedVerticalIds: string[];
  allVerticals: BusinessVertical[];
}

export function TenantVerticalsEditor({
  tenantId,
  assignedVerticalIds,
  allVerticals,
}: Props) {
  const [selected, setSelected] = useState<string[]>(assignedVerticalIds);
  const [isPending, startTransition] = useTransition();
  const [savedAt, setSavedAt] = useState<number | null>(null);

  const dirty =
    selected.length !== assignedVerticalIds.length ||
    selected.some((id) => !assignedVerticalIds.includes(id));

  function toggle(id: string) {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  }

  function handleSave() {
    const fd = new FormData();
    fd.set("tenantId", tenantId);
    selected.forEach((id) => fd.append("verticalIds", id));
    startTransition(async () => {
      await setTenantVerticals(fd);
      setSavedAt(Date.now());
    });
  }

  return (
    <Card>
      <div className="px-6 py-5 border-b border-[var(--border-subtle)] flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-[var(--text-primary)]">
            Rubros asignados
          </h3>
          <p className="text-2xs text-[var(--text-tertiary)] mt-0.5">
            Definen qué tipos de equipo y plantillas hereda este tenant.
          </p>
        </div>
        {dirty && (
          <Button
            size="sm"
            pill
            loading={isPending}
            onClick={handleSave}
          >
            Guardar cambios
          </Button>
        )}
        {!dirty && savedAt && (
          <span className="text-2xs text-[var(--success-fg)] flex items-center gap-1">
            <Check className="h-3 w-3" /> Guardado
          </span>
        )}
      </div>
      <CardBody>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {allVerticals.map((v) => {
            const isSelected = selected.includes(v.id);
            return (
              <button
                key={v.id}
                type="button"
                onClick={() => toggle(v.id)}
                className={cn(
                  "flex items-center justify-between gap-3 px-3.5 py-3 rounded-xl text-left",
                  "border",
                  isSelected
                    ? "border-[var(--accent-500)] bg-[var(--info-bg)]"
                    : "border-[var(--border-default)] hover:border-[var(--border-strong)] hover:bg-[var(--bg-hover)]",
                )}
              >
                <div className="min-w-0">
                  <p className="text-sm font-medium text-[var(--text-primary)] truncate">
                    {v.name}
                  </p>
                  {v.description && (
                    <p className="truncate text-2xs text-[var(--text-tertiary)] mt-0.5">
                      {v.description}
                    </p>
                  )}
                </div>
                <span
                  className={cn(
                    "grid h-5 w-5 shrink-0 place-items-center rounded-full border",
                    isSelected
                      ? "bg-[var(--accent-500)] border-[var(--accent-500)] text-white"
                      : "border-[var(--border-strong)]",
                  )}
                >
                  {isSelected && <Check className="h-3 w-3" />}
                </span>
              </button>
            );
          })}
        </div>
      </CardBody>
    </Card>
  );
}
