"use client";

import { forwardRef, type SelectHTMLAttributes } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils/cn";

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  inputSize?: "sm" | "md";
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, inputSize = "md", children, ...props }, ref) => {
    const heights = inputSize === "sm" ? "h-8 text-xs" : "h-10 text-sm";
    return (
      <div className="relative">
        <select
          ref={ref}
          className={cn(
            "w-full appearance-none bg-[var(--bg-input)] border border-[var(--border-default)] rounded-full",
            "text-[var(--text-primary)] pl-3.5 pr-9",
            "focus:border-[var(--accent-500)] focus:ring-2 focus:ring-[var(--accent-500)]/20",
            "disabled:opacity-50",
            "cursor-pointer",
            heights,
            className,
          )}
          {...props}
        >
          {children}
        </select>
        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[var(--text-tertiary)] pointer-events-none" />
      </div>
    );
  },
);
Select.displayName = "Select";
