"use client";

import { useState } from "react";
import { ClipboardList } from "lucide-react";
import { InspectionWizard } from "./InspectionWizard";
import type { Location, Equipment } from "@/lib/types";

interface InspectionButtonProps {
  locations: Location[];
  equipment: Equipment[];
}

export function InspectionButton({ locations, equipment }: InspectionButtonProps) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="w-full flex items-center justify-center gap-2 rounded-2xl bg-[var(--accent-500)] py-3 text-sm font-semibold text-white"
      >
        <ClipboardList className="h-4 w-4" />
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
