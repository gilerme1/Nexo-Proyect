"use client";

import { useState } from "react";
import Link from "next/link";
import { CalendarClock, AlertCircle } from "lucide-react";
import { Card, CardBody } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

interface MobileItem {
  id: string;
  title: string;
  status: "overdue" | "scheduled";
  nextDueAt: string;
  equipmentName: string;
  clientName: string;
  frequency: string;
  equipmentId: string;
}

interface Props {
  items: MobileItem[];
}

const FREQ_LABEL: Record<string, string> = {
  weekly: "Semanal", biweekly: "Quincenal", monthly: "Mensual",
  bimonthly: "Bimestral", quarterly: "Trimestral",
  semiannual: "Semestral", annual: "Anual",
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("es-AR", { day: "numeric", month: "short" });
}

export function MaintenanceMobileList({ items }: Props) {
  const [tab, setTab] = useState<"overdue" | "scheduled">("overdue");

  const overdue = items.filter((m) => m.status === "overdue");
  const scheduled = items.filter((m) => m.status === "scheduled");
  const visible = tab === "overdue" ? overdue : scheduled;

  return (
    <div className="lg:hidden space-y-3">
      {/* Toggle */}
      <div className="flex items-center gap-1 bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-full p-0.5 self-start w-fit">
        <button
          type="button"
          onClick={() => setTab("overdue")}
          className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
            tab === "overdue"
              ? "bg-[var(--danger-bg)] text-[var(--danger-fg)]"
              : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
          }`}
        >
          Vencidos
          {overdue.length > 0 && (
            <span className="min-w-[18px] rounded-full bg-[var(--danger-fg)] px-1 text-[10px] font-bold text-white">
              {overdue.length}
            </span>
          )}
        </button>
        <button
          type="button"
          onClick={() => setTab("scheduled")}
          className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
            tab === "scheduled"
              ? "bg-[var(--bg-hover)] text-[var(--text-primary)]"
              : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
          }`}
        >
          Próximos
          {scheduled.length > 0 && (
            <span className="min-w-[18px] rounded-full bg-[var(--border-default)] px-1 text-[10px] font-bold text-[var(--text-secondary)]">
              {scheduled.length}
            </span>
          )}
        </button>
      </div>

      {/* List */}
      {visible.length === 0 ? (
        <Card>
          <CardBody className="py-8 text-center">
            <p className="text-sm text-[var(--text-tertiary)]">
              {tab === "overdue" ? "Sin mantenimientos vencidos." : "Sin próximos mantenimientos."}
            </p>
          </CardBody>
        </Card>
      ) : (
        <ul className="space-y-2">
          {visible.map((m) => {
            const isOverdue = m.status === "overdue";
            return (
              <li key={m.id}>
                <Link
                  href={`/app/reports/new?equipmentId=${m.equipmentId}&scheduledId=${m.id}`}
                  className="flex items-start gap-3 p-4 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-subtle)] hover:bg-[var(--bg-hover)]"
                >
                  <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-full mt-0.5 ${isOverdue ? "bg-[var(--danger-bg)] text-[var(--danger-fg)]" : "bg-[var(--info-bg)] text-[var(--info-fg)]"}`}>
                    {isOverdue ? <AlertCircle className="h-4 w-4" /> : <CalendarClock className="h-4 w-4" />}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-[var(--text-primary)] truncate">{m.title}</p>
                    <p className="text-2xs text-[var(--text-tertiary)] truncate mt-0.5">
                      {m.equipmentName} · {m.clientName}
                    </p>
                    <p className="text-2xs text-[var(--text-tertiary)] mt-0.5">
                      {FREQ_LABEL[m.frequency] ?? m.frequency}
                    </p>
                  </div>
                  <Badge tone={isOverdue ? "danger" : "neutral"} size="sm">
                    {isOverdue ? "Vencido" : formatDate(m.nextDueAt)}
                  </Badge>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}