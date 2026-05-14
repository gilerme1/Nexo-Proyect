"use client";

import { useState } from "react";
import { ClipboardList } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { InspectionWizard } from "./InspectionWizard";
import type { Location, Equipment } from "@/lib/types";

interface InspectionButtonProps {
  locations: Location[];
  equipment: Equipment[];
  secondary?: boolean;
}

export function InspectionButton({ locations, equipment, secondary }: InspectionButtonProps) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={
          secondary
            ? "group w-full flex flex-col items-center justify-center gap-1.5 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-subtle)] py-4 text-sm font-medium text-[var(--text-primary)] cursor-pointer hover:bg-[var(--bg-hover)] active:opacity-70 transition-all duration-150"
            : "group w-full flex items-center justify-center gap-2 rounded-2xl bg-[var(--accent-500)] py-3 text-sm font-semibold text-white cursor-pointer hover:brightness-110 active:scale-[0.97] active:opacity-90 transition-all duration-150"
        }
      >
        <ClipboardList className={cn(
          "group-hover:scale-110 transition-transform duration-150",
          secondary ? "h-5 w-5 text-[var(--text-tertiary)]" : "h-4 w-4",
        )} />
        Nueva inspección
      </button>
      {open && (
        <InspectionWizard
          locations={locations}
          equipment={equipment}
          onClose={() => setOpen(false)}
        />
      )}
    </>
  );
}
