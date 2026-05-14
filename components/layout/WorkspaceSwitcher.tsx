"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronsUpDown, Check, ShieldCheck, Building2 } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { switchToPlatform, switchToTenant } from "@/lib/auth/actions";
import { useSidebar } from "./SidebarContext";
import { Tooltip } from "@/components/ui/Tooltip";
import type { Tenant } from "@/lib/types";

interface WorkspaceSwitcherProps {
  current: { kind: "platform" } | { kind: "tenant"; tenant: Tenant };
  tenants: Tenant[];
  isPlatformAdmin?: boolean;
}

export function WorkspaceSwitcher({
  current,
  tenants,
  isPlatformAdmin = false,
}: WorkspaceSwitcherProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const { collapsed, isDesktop } = useSidebar();
  const isIconOnly = isDesktop && collapsed;

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  const isPlatform = current.kind === "platform";
  const label = isPlatform ? "Maintly Platform" : current.tenant.name;
  const sublabel = isPlatform ? "Super Admin" : "Tenant workspace";

  const triggerInner = (
    <button
      onClick={() => isPlatformAdmin && setOpen(!open)}
      className={cn(
        "flex items-center gap-2.5 rounded-2xl",
        "bg-[var(--bg-card)] border border-[var(--border-subtle)]",
        "hover:bg-[var(--bg-hover)] hover:border-[var(--border-default)]",
        isIconOnly
          ? "w-12 h-12 justify-center"
          : "w-full px-2.5 py-2.5",
      )}
    >
      <span
        className={cn(
          "grid shrink-0 place-items-center rounded-xl",
          isPlatform
            ? "bg-[var(--accent-500)] text-white"
            : "bg-[var(--info-bg)] text-[var(--info-fg)]",
          "h-8 w-8",
        )}
      >
        {isPlatform ? (
          <ShieldCheck className="h-4 w-4" />
        ) : (
          <Building2 className="h-4 w-4" />
        )}
      </span>
      {!isIconOnly && (
        <>
          <div className="min-w-0 flex-1 text-left">
            <p className="truncate text-sm font-semibold text-[var(--text-primary)]">
              {label}
            </p>
            <p className="truncate text-2xs text-[var(--text-tertiary)]">
              {sublabel}
            </p>
          </div>
          {isPlatformAdmin && <ChevronsUpDown className="h-3.5 w-3.5 text-[var(--text-tertiary)] shrink-0" />}
        </>
      )}
    </button>
  );

  return (
    <div ref={ref} className="relative">
      {isIconOnly ? (
        <Tooltip content={`${label} · cambiar workspace`} side="right">
          {triggerInner}
        </Tooltip>
      ) : (
        triggerInner
      )}

      {isPlatformAdmin && open && (
        <div
          className={cn(
            "absolute z-50",
            "bg-[var(--bg-card-elevated)] border border-[var(--border-default)]",
            "rounded-2xl shadow-[var(--shadow-elevated)]",
            "py-2 max-h-[420px] overflow-auto w-[280px]",
            isIconOnly
              ? "left-full ml-2 top-0"
              : "left-0 right-0 top-full mt-2",
          )}
        >
          <div className="px-2">
            <p className="px-2 py-1.5 text-2xs font-semibold text-[var(--text-tertiary)] uppercase tracking-wider">
              Platform
            </p>
            <form
              action={async () => {
                // Server action runs FIRST (does the redirect server-side).
                // We don't close the dropdown manually — when the page
                // navigates, the whole component re-mounts.
                await switchToPlatform();
              }}
            >
              <button
                type="submit"
                className="w-full flex items-center gap-2.5 px-2 py-2 rounded-xl hover:bg-[var(--bg-hover)] text-left"
              >
                <span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-[var(--accent-500)] text-white">
                  <ShieldCheck className="h-3.5 w-3.5" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-[var(--text-primary)]">
                    Maintly Platform
                  </p>
                  <p className="text-2xs text-[var(--text-tertiary)]">
                    Vista de Super Admin
                  </p>
                </div>
                {isPlatform && (
                  <Check className="h-3.5 w-3.5 text-[var(--accent-500)] shrink-0" />
                )}
              </button>
            </form>
          </div>

          <div className="h-px bg-[var(--border-subtle)] my-2 mx-3" />

          <div className="px-2">
            <p className="px-2 py-1.5 text-2xs font-semibold text-[var(--text-tertiary)] uppercase tracking-wider">
              Tenants ({tenants.length})
            </p>
            {tenants.map((t) => {
              const active = !isPlatform && current.tenant.id === t.id;
              return (
                <form
                  key={t.id}
                  action={async (formData: FormData) => {
                    await switchToTenant(formData);
                  }}
                >
                  <input type="hidden" name="tenantId" value={t.id} />
                  <button
                    type="submit"
                    className="w-full flex items-center gap-2.5 px-2 py-2 rounded-xl hover:bg-[var(--bg-hover)] text-left"
                  >
                    <span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-[var(--info-bg)] text-[var(--info-fg)]">
                      <Building2 className="h-3.5 w-3.5" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-[var(--text-primary)] truncate">
                        {t.name}
                      </p>
                      <p className="text-2xs text-[var(--text-tertiary)] truncate">
                        {t.slug} · plan {t.plan}
                      </p>
                    </div>
                    {active && (
                      <Check className="h-3.5 w-3.5 text-[var(--accent-500)] shrink-0" />
                    )}
                  </button>
                </form>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
