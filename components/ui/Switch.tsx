"use client";

import { cn } from "@/lib/utils/cn";

interface SwitchProps {
  checked: boolean;
  onChange: (next: boolean) => void;
  disabled?: boolean;
  label?: string;
  description?: string;
  className?: string;
}

export function Switch({
  checked,
  onChange,
  disabled,
  label,
  description,
  className,
}: SwitchProps) {
  return (
    <label
      className={cn(
        "flex items-start gap-3 cursor-pointer",
        disabled && "opacity-50 cursor-not-allowed",
        className,
      )}
    >
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={cn(
          "relative shrink-0 inline-flex items-center mt-0.5 h-5 w-9 rounded-full border",
          checked
            ? "bg-[var(--accent-500)] border-[var(--accent-500)]"
            : "bg-[var(--bg-input)] border-[var(--border-default)]",
        )}
      >
        <span
          className={cn(
            "inline-block h-3.5 w-3.5 rounded-full bg-white shadow-sm",
            checked ? "translate-x-[18px]" : "translate-x-0.5",
            "transition-transform",
          )}
        />
      </button>
      {(label || description) && (
        <div className="min-w-0 flex-1">
          {label && (
            <p className="text-sm font-medium text-[var(--text-primary)]">
              {label}
            </p>
          )}
          {description && (
            <p className="text-2xs text-[var(--text-tertiary)] mt-0.5">
              {description}
            </p>
          )}
        </div>
      )}
    </label>
  );
}
