import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div className={cn("text-center py-12 px-6", className)}>
      {Icon && (
        <span className="inline-grid h-14 w-14 place-items-center rounded-2xl bg-[var(--bg-hover)] text-[var(--text-tertiary)]">
          <Icon className="h-6 w-6" />
        </span>
      )}
      <p className="mt-4 text-sm font-semibold text-[var(--text-primary)]">
        {title}
      </p>
      {description && (
        <p className="mt-1 text-xs text-[var(--text-secondary)] max-w-sm mx-auto leading-relaxed">
          {description}
        </p>
      )}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
