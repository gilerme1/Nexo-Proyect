"use client";

import { useState, type ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

export interface Tab {
  id: string;
  label: string;
  badge?: string | number;
  content: ReactNode;
}

interface TabsProps {
  tabs: Tab[];
  defaultTabId?: string;
  className?: string;
}

export function Tabs({ tabs, defaultTabId, className }: TabsProps) {
  const [active, setActive] = useState(defaultTabId ?? tabs[0]?.id);

  return (
    <div className={className}>
      <div className="border-b border-[var(--border-subtle)]">
        <div className="flex gap-1 overflow-x-auto">
          {tabs.map((tab) => {
            const isActive = active === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActive(tab.id)}
                className={cn(
                  "relative px-3.5 py-2.5 text-sm font-medium",
                  "flex items-center gap-2 shrink-0",
                  isActive
                    ? "text-[var(--text-primary)]"
                    : "text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]",
                )}
              >
                {tab.label}
                {tab.badge !== undefined && (
                  <span
                    className={cn(
                      "rounded-full px-1.5 text-2xs tabular",
                      isActive
                        ? "bg-[var(--accent-500)] text-white"
                        : "bg-[var(--bg-hover)] text-[var(--text-tertiary)]",
                    )}
                  >
                    {tab.badge}
                  </span>
                )}
                {isActive && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[var(--accent-500)] rounded-t" />
                )}
              </button>
            );
          })}
        </div>
      </div>
      <div className="mt-6">
        {tabs.find((t) => t.id === active)?.content}
      </div>
    </div>
  );
}
