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
      className={cn(
        "group flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-sm",
        isIconOnly && "justify-center px-2",
        active
          ? "bg-[var(--bg-card)] text-[var(--text-primary)] font-medium border border-[var(--border-subtle)]"
          : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)]",
      )}
      aria-label={label}
    >
      <Icon className="h-4 w-4 shrink-0 group-hover:scale-110 transition-transform duration-150" />
      {!isIconOnly && <span className="truncate flex-1">{label}</span>}
      {!isIconOnly && badge != null && badge > 0 && (
        <span className="ml-auto min-w-[18px] rounded-full bg-[var(--danger-bg)] px-1.5 py-0.5 text-[10px] font-bold leading-none text-[var(--danger-fg)]">
          {badge > 99 ? "99+" : badge}
        </span>
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
  if (isDesktop && collapsed) {
    return <div className="h-2" />; // small spacer
  }
  return (
    <div className="px-2 py-1.5">
      <p className="text-2xs font-semibold text-[var(--text-tertiary)] uppercase tracking-wider">
        {title}
      </p>
    </div>
  );
}
