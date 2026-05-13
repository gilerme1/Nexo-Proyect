"use client";

import { PanelLeftClose, PanelLeft } from "lucide-react";
import { useSidebar } from "./SidebarContext";
import { Tooltip } from "@/components/ui/Tooltip";

export function SidebarCollapseToggle() {
  const { collapsed, toggleCollapsed, isDesktop } = useSidebar();
  if (!isDesktop) return null;

  const Icon = collapsed ? PanelLeft : PanelLeftClose;
  const label = collapsed ? "Expandir" : "Colapsar";

  return (
    <Tooltip content={label} side="right">
      <button
        onClick={toggleCollapsed}
        aria-label={label}
        className="grid h-8 w-8 place-items-center rounded-lg hover:bg-[var(--bg-hover)] text-[var(--text-tertiary)] hover:text-[var(--text-primary)]"
      >
        <Icon className="h-3.5 w-3.5" />
      </button>
    </Tooltip>
  );
}
