"use client";

import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { Tooltip } from "@/components/ui/Tooltip";
import { useSidebar } from "./SidebarContext";

interface SidebarItemProps {
  href: string;
  icon: LucideIcon;
  label: string;
  active: boolean;
  badge?: number;
}

export function SidebarItem({ href, icon: Icon, label, active, badge }: SidebarItemProps) {
  const { collapsed, isDesktop, closeMobile } = useSidebar();
  const isIconOnly = isDesktop && collapsed;

  const inner = (
    <Link
      href={href}
      onClick={() => !isDesktop && closeMobile()}
      aria-label={label}
      className={cn(
        "group relative flex items-center gap-2.5 rounded-xl text-sm",
        "transition-all duration-200",
        isIconOnly
          ? "h-10 w-10 justify-center"
          : "pl-3 pr-2.5 py-2",
        active
          ? "bg-[var(--accent-500)]/10 text-[var(--text-primary)] font-medium"
          : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)]",
      )}
    >
      {/* Accent bar — left edge indicator on active, respects border-radius via absolute span */}
      {active && !isIconOnly && (
        <span className="absolute left-0 top-1.5 bottom-1.5 w-[3px] rounded-full bg-[var(--accent-500)]" />
      )}

      <Icon
        className={cn(
          "h-[18px] w-[18px] shrink-0",
          "transition-[transform,color] duration-200",
          active
            ? "text-[var(--accent-500)]"
            : "text-[var(--text-tertiary)] group-hover:-translate-y-0.5 group-hover:scale-110 group-hover:text-[var(--text-primary)]",
        )}
      />

      {!isIconOnly && (
        <>
          <span className="truncate flex-1">{label}</span>
          {badge != null && badge > 0 && (
            <span className="ml-auto min-w-[18px] rounded-full bg-[var(--danger-fg)]/20 px-1.5 py-0.5 text-[10px] font-bold leading-none text-[var(--danger-fg)]">
              {badge > 99 ? "99+" : badge}
            </span>
          )}
        </>
      )}
    </Link>
  );

  if (isIconOnly) {
    return (
      <Tooltip content={label} side="right">
        {inner}
      </Tooltip>
    );
  }

  return inner;
}

/** Section header — hidden when collapsed */
export function SidebarSection({ title }: { title: string }) {
  const { collapsed, isDesktop } = useSidebar();
  if (isDesktop && collapsed) return <div className="h-3" />;
  return (
    <div className="px-3 pb-1 pt-4">
      <p className="text-[10px] font-semibold text-[var(--text-muted)] uppercase tracking-widest">
        {title}
      </p>
    </div>
  );
}
