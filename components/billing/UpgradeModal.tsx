"use client";

import Link from "next/link";
import { Sparkles, X } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";

interface Props {
  open: boolean;
  onClose: () => void;
  limitType: "clients" | "equipment" | "locations" | "reports" | "users";
  currentPlan: string;
  nextPlan?: string;
}

const LIMIT_LABELS: Record<string, string> = {
  clients: "clientes",
  equipment: "equipos",
  locations: "ubicaciones",
  reports: "reportes por mes",
  users: "usuarios",
};

export function UpgradeModal({ open, onClose, limitType, currentPlan, nextPlan }: Props) {
  const label = LIMIT_LABELS[limitType] ?? limitType;
  return (
    <Modal open={open} onClose={onClose} title="Límite alcanzado">
      <div className="px-6 py-6 space-y-5">
        <div className="flex flex-col items-center text-center gap-3">
          <span className="grid h-16 w-16 place-items-center rounded-2xl bg-[var(--warning-bg)] text-[var(--warning-fg)]">
            <Sparkles className="h-8 w-8" />
          </span>
          <div>
            <p className="text-sm text-[var(--text-secondary)]">
              Llegaste al límite de <strong>{label}</strong> del plan{" "}
              <strong>{currentPlan}</strong>.
            </p>
            {nextPlan && (
              <p className="text-sm text-[var(--text-secondary)] mt-1">
                Subí al plan <strong>{nextPlan}</strong> para seguir creando.
              </p>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <Link href="/app/billing" onClick={onClose}>
            <Button pill className="w-full" leftIcon={<Sparkles className="h-3.5 w-3.5" />}>
              Ver planes y subir
            </Button>
          </Link>
          <Button variant="ghost" pill className="w-full" onClick={onClose}>
            Ahora no
          </Button>
        </div>
      </div>
    </Modal>
  );
}
