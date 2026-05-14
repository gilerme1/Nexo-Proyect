"use client";

import { forwardRef, Children, isValidElement, type SelectHTMLAttributes, type ReactNode } from "react";
import * as Radix from "@radix-ui/react-select";
import { ChevronDown, Check } from "lucide-react";
import { cn } from "@/lib/utils/cn";

// ---------------------------------------------------------------------------
// Helpers — parse native <option> children into items the Radix Select can use
// ---------------------------------------------------------------------------

interface OptionData {
  value: string;
  label: string;
  disabled?: boolean;
}

interface Extracted {
  options: OptionData[];
  emptyLabel?: string; // label of the <option value=""> placeholder, if present
}

function extractOptions(children: ReactNode): Extracted {
  const options: OptionData[] = [];
  let emptyLabel: string | undefined;

  Children.forEach(children, (child) => {
    if (!isValidElement(child)) return;
    if (child.type === "option") {
      const p = child.props as { value?: string; children?: ReactNode; disabled?: boolean };
      const val = p.value ?? "";
      const label = String(p.children ?? val);
      if (val === "") {
        // Radix forbids value="" on items — treat as placeholder
        emptyLabel = label;
      } else {
        options.push({ value: val, label, disabled: p.disabled });
      }
    }
  });

  return { options, emptyLabel };
}

// ---------------------------------------------------------------------------
// Select — drop-in for the native <select> API
// Accepts <option> children, renders them as a beautiful Radix dropdown.
// Supports both controlled (value + onChange) and uncontrolled (name + defaultValue) modes.
// ---------------------------------------------------------------------------

interface SelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, "onChange"> {
  inputSize?: "sm" | "md";
  placeholder?: string;
  /** Called with the new value string (no synthetic event) */
  onValueChange?: (value: string) => void;
  /** Legacy: called with a synthetic-event-like object */
  onChange?: (e: { target: { value: string } }) => void;
}

export const Select = forwardRef<HTMLButtonElement, SelectProps>(
  (
    {
      children,
      value,
      defaultValue,
      name,
      disabled,
      inputSize = "md",
      className,
      onChange,
      onValueChange,
      placeholder,
    },
    ref,
  ) => {
    const { options, emptyLabel } = extractOptions(children);
    const effectivePlaceholder = placeholder ?? emptyLabel ?? "Seleccionar…";
    const heights = inputSize === "sm" ? "h-8 text-xs" : "h-10 text-sm";

    function handleChange(val: string) {
      onValueChange?.(val);
      onChange?.({ target: { value: val } });
    }

    // Controlled vs uncontrolled
    const controlled = value !== undefined ? { value: String(value) } : {};
    const uncontrolled = defaultValue !== undefined ? { defaultValue: String(defaultValue) } : {};

    return (
      <Radix.Root
        {...controlled}
        {...uncontrolled}
        name={name}
        disabled={disabled}
        onValueChange={handleChange}
      >
        <Radix.Trigger
          ref={ref}
          className={cn(
            "w-full flex items-center gap-2 rounded-full outline-none",
            "bg-[var(--bg-input)] border border-[var(--border-default)]",
            "pl-3.5 pr-2.5 text-left",
            "hover:border-[var(--border-hover)]",
            "focus:border-[var(--accent-500)] focus:ring-2 focus:ring-[var(--accent-500)]/20",
            "disabled:opacity-50 disabled:cursor-not-allowed",
            "data-[placeholder]:text-[var(--text-tertiary)]",
            "transition-[border-color,box-shadow]",
            heights,
            className,
          )}
        >
          <Radix.Value
            placeholder={effectivePlaceholder}
            className="flex-1 truncate text-[var(--text-primary)]"
          />
          <Radix.Icon asChild>
            <ChevronDown className="h-3.5 w-3.5 text-[var(--text-tertiary)] shrink-0" />
          </Radix.Icon>
        </Radix.Trigger>

        <Radix.Portal>
          <Radix.Content
            position="popper"
            sideOffset={6}
            className={cn(
              "z-[200] min-w-[var(--radix-select-trigger-width)]",
              "bg-[var(--bg-card-elevated)] border border-[var(--border-default)]",
              "rounded-2xl shadow-[var(--shadow-elevated)] overflow-hidden",
              "data-[state=open]:animate-in data-[state=closed]:animate-out",
              "data-[state=open]:fade-in-0 data-[state=closed]:fade-out-0",
              "data-[state=open]:zoom-in-95 data-[state=closed]:zoom-out-95",
              "data-[side=bottom]:slide-in-from-top-2",
            )}
          >
            <Radix.Viewport className="p-1.5 max-h-60">
              {options.map((opt) => (
                <Radix.Item
                  key={opt.value}
                  value={opt.value}
                  disabled={opt.disabled}
                  className={cn(
                    "relative flex items-center gap-2.5 px-3 py-2 rounded-xl",
                    "text-sm text-[var(--text-primary)] outline-none cursor-pointer",
                    "hover:bg-[var(--bg-hover)] focus:bg-[var(--bg-hover)]",
                    "data-[disabled]:opacity-40 data-[disabled]:cursor-not-allowed",
                    "data-[state=checked]:text-[var(--accent-500)] data-[state=checked]:font-medium",
                    "select-none transition-colors",
                  )}
                >
                  <Radix.ItemText className="flex-1">{opt.label}</Radix.ItemText>
                  <Radix.ItemIndicator asChild>
                    <Check className="h-3.5 w-3.5 text-[var(--accent-500)] shrink-0" />
                  </Radix.ItemIndicator>
                </Radix.Item>
              ))}
            </Radix.Viewport>
          </Radix.Content>
        </Radix.Portal>
      </Radix.Root>
    );
  },
);
Select.displayName = "Select";
