import { cn } from "@/lib/utils/cn";
import type { EquipmentStatus } from "@/lib/types";

const STATUS_CONFIG: Record<
  EquipmentStatus,
  { label: string; classes: string }
> = {
  operational:    { label: "Operativo",        classes: "bg-[var(--success-bg)] text-[var(--success-fg)]" },
  pending:        { label: "Pendiente",         classes: "bg-[var(--warning-bg)] text-[var(--warning-fg)]" },
  in_maintenance: { label: "En mantenimiento",  classes: "bg-[var(--info-bg)] text-[var(--info-fg)]" },
  observed:       { label: "Observado",         classes: "bg-[var(--warning-bg)] text-[var(--warning-fg)]" },
  critical:       { label: "Crítico",           classes: "bg-[var(--danger-bg)] text-[var(--danger-fg)]" },
  out_of_service: { label: "Fuera de servicio", classes: "bg-[var(--bg-card)] text-[var(--text-tertiary)] border border-[var(--border-subtle)]" },
};

interface Props {
  status: EquipmentStatus;
  className?: string;
}

export function EquipmentStatusBadge({ status, className }: Props) {
  const { label, classes } = STATUS_CONFIG[status] ?? STATUS_CONFIG.pending;
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
        classes,
        className,
      )}
    >
      {label}
    </span>
  );
}
