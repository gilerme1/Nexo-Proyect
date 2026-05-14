"use client";

import type { ReactNode } from "react";
import { ChevronLeft } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { useSidebar } from "./SidebarContext";

const SPRING = "cubic-bezier(0.22, 1, 0.36, 1)";
const EXPANDED_W = 240;
const COLLAPSED_W = 68;

interface SidebarShellProps {
  children: ReactNode;
}

export function SidebarShell({ children }: SidebarShellProps) {
  const { collapsed, toggleCollapsed, mobileOpen, closeMobile } = useSidebar();

  return (
    <>
      {/* ── Desktop sidebar ──────────────────────────────────────────────── */}
      <aside
        className="hidden lg:flex flex-col shrink-0 h-screen sticky top-0 overflow-hidden bg-[var(--bg-canvas)] border-r border-[var(--border-subtle)]"
        style={{
          width: collapsed ? COLLAPSED_W : EXPANDED_W,
          transition: `width 340ms ${SPRING}`,
        }}
      >
        {/* Nav content — overflow-x-hidden clips labels during animation */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden min-h-0 p-3">
          {children}
        </div>

        {/* Collapse toggle */}
        <div className="shrink-0 px-3 py-3 border-t border-[var(--border-subtle)]">
          <button
            type="button"
            onClick={toggleCollapsed}
            aria-label={collapsed ? "Expandir sidebar" : "Colapsar sidebar"}
            className={cn(
              "group flex items-center gap-2 rounded-xl px-2.5 py-2 w-full",
              "text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)]",
            )}
            style={{ transition: `color 150ms ease, background-color 150ms ease` }}
          >
            {/* Icon rotates 180° when expanded → collapsed */}
            <ChevronLeft
              className="h-4 w-4 shrink-0"
              style={{
                transform: `rotate(${collapsed ? 180 : 0}deg)`,
                transition: `transform 340ms ${SPRING}`,
              }}
            />

            {/* Label fades out as sidebar collapses */}
            <span
              className="text-xs font-medium whitespace-nowrap overflow-hidden"
              style={{
                opacity: collapsed ? 0 : 1,
                maxWidth: collapsed ? 0 : 200,
                transition: `opacity 200ms ease, max-width 340ms ${SPRING}`,
              }}
            >
              Colapsar
            </span>
          </button>
        </div>
      </aside>

      {/* ── Mobile drawer ────────────────────────────────────────────────── */}
      {mobileOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden animate-backdrop-enter"
            onClick={closeMobile}
            aria-hidden="true"
          />
          <aside
            className="fixed inset-y-0 left-0 z-50 flex flex-col w-[280px] overflow-hidden bg-[var(--bg-canvas)] border-r border-[var(--border-subtle)] lg:hidden animate-slide-from-left"
          >
            <div className="flex-1 overflow-y-auto overflow-x-hidden p-3">
              {children}
            </div>
          </aside>
        </>
      )}
    </>
  );
}
