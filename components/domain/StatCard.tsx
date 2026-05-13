import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { ArrowRight, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { Tooltip } from "@/components/ui/Tooltip";

interface HeroStatProps {
  /** Card title (e.g. "Air Temperature") */
  label: string;
  /** Caption below title (e.g. "A little hot") */
  caption?: string;
  /** Big hero number */
  value: string | number;
  /** Unit like °C, %, ppm */
  unit?: string;
  /** Icon shown as a circular badge next to the value */
  icon?: LucideIcon;
  iconColor?: "neutral" | "success" | "warning" | "danger" | "info";
  /** If set, renders an arrow button at the top right linking to detail */
  href?: string;
  /** Optional secondary text below the value */
  subtext?: string;
  /** Optional chart slot (SparkArea / SparkBars) */
  children?: React.ReactNode;
  /** Tooltip on hover over the hero number */
  valueTooltip?: React.ReactNode;
  size?: "md" | "lg";
  className?: string;
}

const iconColorMap: Record<
  NonNullable<HeroStatProps["iconColor"]>,
  string
> = {
  neutral: "bg-[var(--bg-hover)] text-[var(--text-primary)]",
  success: "bg-[var(--success-bg)] text-[var(--success-fg)]",
  warning: "bg-[var(--warning-bg)] text-[var(--warning-fg)]",
  danger: "bg-[var(--danger-bg)] text-[var(--danger-fg)]",
  info: "bg-[var(--info-bg)] text-[var(--info-fg)]",
};

export function HeroStat({
  label,
  caption,
  value,
  unit,
  icon: Icon,
  iconColor = "info",
  href,
  subtext,
  children,
  valueTooltip,
  size = "md",
  className,
}: HeroStatProps) {
  return (
    <div
      className={cn(
        "group relative overflow-hidden",
        "bg-[var(--bg-card)] border border-[var(--border-subtle)]",
        "rounded-[var(--radius-card)]",
        "flex flex-col",
        className,
      )}
    >
      {/* Hero glow behind the number */}
      <div
        className="pointer-events-none absolute -top-10 -left-10 h-40 w-40 rounded-full opacity-40 blur-3xl"
        style={{ background: "radial-gradient(circle, var(--accent-500), transparent 70%)" }}
        aria-hidden="true"
      />

      {/* Header */}
      <div className="relative px-5 pt-5 pb-4 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-medium text-[var(--text-primary)]">
            {label}
          </p>
          {caption && (
            <p className="text-2xs text-[var(--text-tertiary)] mt-0.5">
              {caption}
            </p>
          )}
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          {href && (
            <Tooltip content="Ver detalle" side="top">
              <Link
                href={href}
                aria-label={`Ver detalle de ${label}`}
                className="grid h-8 w-8 place-items-center rounded-full border border-[var(--border-default)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)]"
              >
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </Tooltip>
          )}
        </div>
      </div>

      {/* Subtle separator */}
      <div className="mx-5 h-px bg-[var(--border-subtle)]" />

      {/* Hero value */}
      <div className="relative px-5 pt-5 pb-4">
        <div className="flex items-end gap-3">
          <ValueDisplay value={value} unit={unit} size={size} tooltip={valueTooltip} />
          {Icon && (
            <span
              className={cn(
                "grid h-10 w-10 shrink-0 place-items-center rounded-full mb-1",
                iconColorMap[iconColor],
              )}
            >
              <Icon className="h-4 w-4" />
            </span>
          )}
        </div>
        {subtext && (
          <p className="mt-2 text-2xs text-[var(--text-tertiary)]">{subtext}</p>
        )}
      </div>

      {/* Chart slot */}
      {children && <div className="relative px-5 pb-5">{children}</div>}
    </div>
  );
}

function ValueDisplay({
  value,
  unit,
  size,
  tooltip,
}: {
  value: string | number;
  unit?: string;
  size: "md" | "lg";
  tooltip?: React.ReactNode;
}) {
  const inner = (
    <div className="flex items-baseline gap-1.5 tabular cursor-default">
      <span
        className={cn(
          "font-semibold text-[var(--text-primary)] tracking-tight glow-accent",
          size === "lg" ? "text-hero" : "text-display",
        )}
      >
        {value}
      </span>
      {unit && (
        <span className="text-base text-[var(--text-secondary)] font-medium">
          {unit}
        </span>
      )}
    </div>
  );

  if (tooltip) {
    return (
      <Tooltip content={tooltip} side="top" align="start">
        {inner}
      </Tooltip>
    );
  }
  return inner;
}

/** Compact variant for the 4-up KPI strip */
export function StatCard({
  label,
  value,
  hint,
  icon: Icon,
  tone = "default",
  href,
  tooltip,
  className,
}: {
  label: string;
  value: string | number;
  hint?: string;
  icon?: LucideIcon;
  tone?: "default" | "success" | "warning" | "danger" | "info";
  href?: string;
  tooltip?: React.ReactNode;
  className?: string;
}) {
  const toneMap: Record<NonNullable<typeof tone>, string> = {
    default: "bg-[var(--bg-hover)] text-[var(--text-primary)]",
    success: "bg-[var(--success-bg)] text-[var(--success-fg)]",
    warning: "bg-[var(--warning-bg)] text-[var(--warning-fg)]",
    danger: "bg-[var(--danger-bg)] text-[var(--danger-fg)]",
    info: "bg-[var(--info-bg)] text-[var(--info-fg)]",
  };

  const Wrapper = href ? Link : "div";
  const wrapperProps = href ? { href } : {};

  const inner = (
    <Wrapper
      {...(wrapperProps as { href: string })}
      className={cn(
        "block bg-[var(--bg-card)] border border-[var(--border-subtle)]",
        "rounded-[var(--radius-card)] p-5",
        href && "hover:border-[var(--border-default)] hover:bg-[var(--bg-hover)]",
        className,
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <p className="text-xs font-medium text-[var(--text-secondary)]">
          {label}
        </p>
        {Icon && (
          <span
            className={cn(
              "grid h-8 w-8 place-items-center rounded-full",
              toneMap[tone],
            )}
          >
            <Icon className="h-3.5 w-3.5" />
          </span>
        )}
      </div>
      <p className="mt-3 text-3xl font-semibold tracking-tight text-[var(--text-primary)] tabular">
        {value}
      </p>
      {hint && (
        <p className="mt-1 text-2xs text-[var(--text-tertiary)]">{hint}</p>
      )}
    </Wrapper>
  );

  if (tooltip) {
    return (
      <Tooltip content={tooltip} side="top">
        {inner}
      </Tooltip>
    );
  }
  return inner;
}
