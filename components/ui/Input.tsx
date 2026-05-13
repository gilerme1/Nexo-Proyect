"use client";

import { forwardRef, type InputHTMLAttributes, type ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  inputSize?: "sm" | "md";
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      leftIcon,
      rightIcon,
      inputSize = "md",
      type = "text",
      ...props
    },
    ref,
  ) => {
    const heights = inputSize === "sm" ? "h-8 text-xs" : "h-10 text-sm";
    const padLeft = leftIcon ? "pl-10" : "pl-3.5";
    const padRight = rightIcon ? "pr-10" : "pr-3.5";
    return (
      <div className="relative">
        {leftIcon && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)] pointer-events-none">
            {leftIcon}
          </span>
        )}
        <input
          ref={ref}
          type={type}
          className={cn(
            "w-full bg-[var(--bg-input)] border border-[var(--border-default)] rounded-full",
            "text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)]",
            "focus:border-[var(--accent-500)] focus:ring-2 focus:ring-[var(--accent-500)]/20",
            "disabled:opacity-50 disabled:cursor-not-allowed",
            heights,
            padLeft,
            padRight,
            className,
          )}
          {...props}
        />
        {rightIcon && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)] pointer-events-none">
            {rightIcon}
          </span>
        )}
      </div>
    );
  },
);
Input.displayName = "Input";
