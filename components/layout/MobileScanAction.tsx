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
        className="group w-full flex items-center justify-center gap-2 rounded-2xl bg-[var(--accent-500)] py-6 text-sm font-medium text-white cursor-pointer hover:brightness-110 active:scale-[0.97] transition-all duration-150"
      >
        <ScanLine className="h-4 w-4 group-hover:scale-110 transition-transform duration-150" />
        Escanear QR
      </button>
      {open && <QrScanner onClose={() => setOpen(false)} />}
    </>
  );
}