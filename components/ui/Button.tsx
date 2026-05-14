"use client";

import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

type Variant = "primary" | "secondary" | "ghost" | "danger" | "outline";
type Size = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  pill?: boolean;
}

const variants: Record<Variant, string> = {
  primary:
    "bg-[var(--accent-500)] text-white hover:bg-[var(--accent-600)] active:bg-[var(--accent-700)] active:scale-[0.97] shadow-sm hover:shadow-[0_4px_16px_rgba(59,108,255,0.35)]",
  secondary:
    "bg-[var(--bg-card-elevated)] text-[var(--text-primary)] border border-[var(--border-default)] hover:bg-[var(--bg-hover)] hover:border-[var(--border-strong)] active:scale-[0.97]",
  ghost:
    "text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)] active:scale-[0.97]",
  danger:
    "bg-[var(--danger-fg)] text-white hover:opacity-90 active:scale-[0.97] shadow-sm",
  outline:
    "bg-transparent text-[var(--text-primary)] border border-[var(--border-default)] hover:border-[var(--border-strong)] hover:bg-[var(--bg-hover)] active:scale-[0.97]",
};

const sizes: Record<Size, string> = {
  sm: "h-8 px-3 text-xs gap-1.5",
  md: "h-9 px-4 text-sm gap-2",
  lg: "h-11 px-5 text-sm gap-2",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "primary",
      size = "md",
      loading,
      leftIcon,
      rightIcon,
      pill = false,
      children,
      disabled,
      ...props
    },
    ref,
  ) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(
          "group inline-flex items-center justify-center font-medium",
          "transition-all duration-150",
          "disabled:opacity-50 disabled:cursor-not-allowed",
          pill ? "rounded-full" : "rounded-lg",
          variants[variant],
          sizes[size],
          className,
        )}
        {...props}
      >
        {loading ? (
          <span className="inline-block h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent" />
        ) : leftIcon ? (
          <span className="inline-flex group-hover:-translate-y-0.5 transition-transform duration-150">
            {leftIcon}
          </span>
        ) : null}
        {children}
        {rightIcon ? (
          <span className="inline-flex group-hover:translate-x-0.5 transition-transform duration-150">
            {rightIcon}
          </span>
        ) : null}
      </button>
    );
  },
);
Button.displayName = "Button";
