"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import type { Plan } from "@/lib/types";

interface Props {
  tenantId: string;
  currentPlanId: string;
  plans: Plan[];
  action: (formData: FormData) => Promise<void>;
}

export function TenantPlanChanger({
  tenantId,
  currentPlanId,
  plans,
  action,
}: Props) {
  const [selected, setSelected] = useState(currentPlanId);
  const changed = selected !== currentPlanId;

  return (
    <form action={action} className="flex items-end gap-3">
      <input type="hidden" name="tenantId" value={tenantId} />
      <div className="flex-1 max-w-xs">
        <label className="block text-2xs font-medium text-[var(--text-secondary)] mb-1.5">
          Cambiar plan manualmente
        </label>
        <Select
          name="planId"
          value={selected}
          onChange={(e) => setSelected(e.target.value)}
        >
          {plans.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name} — ${p.monthlyPriceUsd}/mes
            </option>
          ))}
        </Select>
      </div>
      <Button type="submit" variant="secondary" size="sm" pill disabled={!changed}>
        Aplicar
      </Button>
    </form>
  );
}
