"use client";

import { useState } from "react";
import Link from "next/link";
import { CalendarClock, AlertCircle } from "lucide-react";
import { Card, CardBody } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { formatDate } from "@/lib/utils/format";
import type { ScheduledMaintenance, Equipment, Client } from "@/lib/types";

const FREQ_LABEL: Record<string, string> = {
  weekly: "Semanal", biweekly: "Quincenal", monthly: "Mensual",
  bimonthly: "Bimestral", quarterly: "Trimestral",
  semiannual: "Semestral", annual: "Anual",
};

interface Props {
  maintenances: ScheduledMaintenance[];
  equipment: Equipment[];
  clients: Client[];
}

export function MobileMaintenanceList({ maintenances, equipment, clients }: Props) {
  const [filter, setFilter] = useState<"overdue" | "upcoming">("overdue");

  const overdue = maintenances.filter((m) => m.status === "overdue");
  const upcoming = maintenances.filter((m) => m.status === "scheduled");
  const visible = filter === "overdue" ? overdue : upcoming;

  return (
    <div className="lg:hidden space-y-3">
      {/* Toggle */}
      <div className="flex items-center gap-2">
        {(["overdue", "upcoming"] as const).map((f) => {
          const count = f === "overdue" ? overdue.length : upcoming.length;
          const active = filter === f;
          return (
            <button
              key={f}
              type="button"
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-full text-sm font-semibold transition-colors ${
                active
                  ? "bg-[var(--accent-500)] text-white"
                  : "bg-[var(--bg-card)] text-[var(--text-secondary)] border border-[var(--border-default)]"
              }`}
            >
              {f === "overdue" ? "Vencidos" : "Próximos"} ({count})
            </button>
          );
        })}
      </div>

      {/* List */}
      {visible.length === 0 ? (
        <Card>
          <CardBody className="py-8 text-center">
            <p className="text-sm text-[var(--text-tertiary)]">
              {filter === "overdue" ? "Sin mantenimientos vencidos." : "Sin próximos mantenimientos."}
            </p>
          </CardBody>
        </Card>
      ) : (
        <Card>
          <CardBody className="p-2">
            <ul className="space-y-1">
              {visible.map((m) => {
                const eq = equipment.find((e) => e.id === m.equipmentId);
                const client = clients.find((c) => c.id === m.clientId);
                const isOverdue = m.status === "overdue";
                return (
                  <li key={m.id} className="flex items-center gap-4 px-3 py-3.5 rounded-xl hover:bg-[var(--bg-hover)]">
                    <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-full ${isOverdue ? "bg-[var(--danger-bg)] text-[var(--danger-fg)]" : "bg-[var(--info-bg)] text-[var(--info-fg)]"}`}>
                      {isOverdue ? <AlertCircle className="h-4 w-4" /> : <CalendarClock className="h-4 w-4" />}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-[var(--text-primary)] truncate">{m.title}</p>
                      <p className="text-2xs text-[var(--text-tertiary)] truncate mt-0.5">
                        {eq?.name ?? "—"} · {client?.name ?? "—"} · {FREQ_LABEL[m.frequency]}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <Badge tone={isOverdue ? "danger" : "neutral"}>
                        {isOverdue ? "Vencido" : formatDate(m.nextDueAt)}
                      </Badge>
                      <Link href={`/app/reports/new?equipmentId=${m.equipmentId}&scheduledId=${m.id}`}>
                        <Button variant="secondary" size="sm" pill>
                          Reportar
                        </Button>
                      </Link>
                    </div>
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
