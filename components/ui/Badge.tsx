import type { ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

export type BadgeTone = "neutral" | "success" | "warning" | "danger" | "info";

interface BadgeProps {
  children: ReactNode;
  tone?: BadgeTone;
  size?: "sm" | "md";
  dot?: boolean;
  className?: string;
}

const tones: Record<BadgeTone, string> = {
  neutral:
    "bg-[var(--bg-hover)] text-[var(--text-secondary)] border-[var(--border-default)]",
  success:
    "bg-[var(--success-bg)] text-[var(--success-fg)] border-[var(--success-border)]",
  warning:
    "bg-[var(--warning-bg)] text-[var(--warning-fg)] border-[var(--warning-border)]",
  danger:
    "bg-[var(--danger-bg)] text-[var(--danger-fg)] border-[var(--danger-border)]",
  info:
    "bg-[var(--info-bg)] text-[var(--info-fg)] border-[var(--info-border)]",
};

const dots: Record<BadgeTone, string> = {
  neutral: "bg-[var(--text-tertiary)]",
  success: "bg-[var(--success-fg)]",
  warning: "bg-[var(--warning-fg)]",
  danger: "bg-[var(--danger-fg)]",
  info: "bg-[var(--info-fg)]",
};

export function Badge({
  children,
  tone = "neutral",
  size = "sm",
  dot,
  className,
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 font-medium rounded-full border",
        size === "sm" ? "h-5 px-2 text-2xs" : "h-6 px-2.5 text-xs",
        tones[tone],
        className,
      )}
    >
      {dot && <span className={cn("h-1.5 w-1.5 rounded-full", dots[tone])} />}
      {children}
    </span>
  );
}
