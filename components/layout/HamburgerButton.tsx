"use client";

import { useState } from "react";
import { useSidebar } from "./SidebarContext";
import { cn } from "@/lib/utils/cn";

export function HamburgerButton() {
  const { collapsed, toggleCollapsed } = useSidebar();
  const [hovered, setHovered] = useState(false);

  // Desktop: toggle sidebar collapse with animated bars → chevron
  const desktopClick = () => toggleCollapsed();
  // Mobile: open drawer (handled by MobileBottomNav; this button is hidden on mobile)

  const isOpen = !collapsed;

  return (
    <>
      {/* Desktop only */}
      <button
        type="button"
        onClick={desktopClick}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        aria-label={collapsed ? "Expandir sidebar" : "Colapsar sidebar"}
        className="hidden lg:grid h-9 w-9 place-items-center rounded-full hover:bg-[var(--bg-hover)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
      >
        <div className="relative w-4 h-3.5 flex flex-col justify-between">
          {/* Top bar */}
          <span
            className="block h-[1.75px] rounded-full bg-current origin-left transition-all duration-200"
            style={{
              transform: isOpen
                ? "rotate(35deg) scaleX(0.65)"
                : hovered
                  ? "scaleX(0.75)"
                  : "scaleX(1)",
            }}
          />
          {/* Middle bar */}
          <span
            className="block h-[1.75px] rounded-full bg-current transition-all duration-200"
            style={{
              opacity: isOpen ? 0 : hovered ? 0.5 : 1,
              transform: isOpen ? "scaleX(0)" : "scaleX(1)",
            }}
          />
          {/* Bottom bar */}
          <span
            className="block h-[1.75px] rounded-full bg-current origin-left transition-all duration-200"
            style={{
              transform: isOpen
                ? "rotate(-35deg) scaleX(0.65)"
                : hovered
                  ? "scaleX(0.85)"
                  : "scaleX(1)",
            }}
          />
        </div>
      </button>

    </>
  );
}
