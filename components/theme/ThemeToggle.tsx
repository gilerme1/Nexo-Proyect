"use client";

import { Sun, Moon, Monitor } from "lucide-react";
import { useTheme } from "./ThemeProvider";
import { Tooltip } from "@/components/ui/Tooltip";

export function ThemeToggle() {
  const { mode, setMode } = useTheme();

  const options = [
    {
      value: "light",
      icon: Sun,
      label: "Modo claro",
      tooltip: "Modo claro siempre",
    },
    {
      value: "system",
      icon: Monitor,
      label: "Sistema",
      tooltip: "Seguir al sistema operativo",
    },
    {
      value: "dark",
      icon: Moon,
      label: "Modo oscuro",
      tooltip: "Modo oscuro siempre",
    },
  ] as const;

  return (
    <div
      role="radiogroup"
      aria-label="Tema"
      className="inline-flex items-center gap-0.5 p-0.5 rounded-full bg-[var(--bg-input)] border border-[var(--border-subtle)]"
    >
      {options.map((opt) => {
        const Icon = opt.icon;
        const active = mode === opt.value;
        return (
          <Tooltip key={opt.value} content={opt.tooltip} side="bottom">
            <button
              role="radio"
              aria-checked={active}
              aria-label={opt.label}
              onClick={() => setMode(opt.value)}
              className={`
                grid place-items-center h-7 w-7 rounded-full
                ${
                  active
                    ? "bg-[var(--bg-card-elevated)] text-[var(--text-primary)] shadow-sm"
                    : "text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]"
                }
              `}
            >
              <Icon className="h-3.5 w-3.5" />
            </button>
          </Tooltip>
        );
      })}
    </div>
  );
}
