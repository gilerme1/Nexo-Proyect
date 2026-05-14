"use client";

import type { ReactNode } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { useSidebar } from "./SidebarContext";

interface SidebarShellProps {
  children: ReactNode;
}

export function SidebarShell({ children }: SidebarShellProps) {
  const { collapsed, mobileOpen, closeMobile } = useSidebar();

  return (
    <>
      {/* Desktop sidebar — CSS hidden on mobile, never causes hydration mismatch */}
      <aside
        className={cn(
          "hidden lg:flex flex-col shrink-0 h-screen sticky top-0 p-3",
          "bg-[var(--bg-canvas)] border-r border-[var(--border-subtle)]",
          "transition-[width] duration-200 ease-out",
          collapsed ? "w-[72px]" : "w-[260px]",
        )}
      >
        {children}
      </aside>

      {/* Mobile drawer — only mounted when open, so it's never visible on initial SSR */}
      {mobileOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/50 lg:hidden"
            onClick={closeMobile}
            aria-hidden="true"
          />
          <aside className="fixed inset-y-0 left-0 z-50 flex flex-col w-[260px] p-3 bg-[var(--bg-canvas)] border-r border-[var(--border-subtle)] lg:hidden">
            <div className="flex justify-end mb-1">
              <button
                onClick={closeMobile}
                aria-label="Cerrar menú"
                className="grid h-8 w-8 place-items-center rounded-full hover:bg-[var(--bg-hover)] text-[var(--text-secondary)]"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            {children}
          </aside>
        </>
      )}
    </>
  );
}
