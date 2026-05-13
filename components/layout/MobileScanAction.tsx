"use client";

import { useState } from "react";
import { ScanLine } from "lucide-react";
import { QrScanner } from "@/components/qr/QrScanner";

export function MobileScanAction() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex items-center justify-center gap-2 rounded-2xl bg-[var(--accent-500)] py-3 text-sm font-medium text-white"
      >
        <ScanLine className="h-4 w-4" />
        Escanear QR
      </button>
      {open && <QrScanner onClose={() => setOpen(false)} />}
    </>
  );
}