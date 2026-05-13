"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { createQrBatch } from "@/lib/actions/qr";

interface Props {
  /** Show just the button inline (for empty state) */
  inline?: boolean;
}

export function NewBatchForm({ inline }: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(fd: FormData) {
    setError(null);
    setSubmitting(true);
    const res = await createQrBatch(fd);
    setSubmitting(false);
    if (!res.ok) { setError(res.error ?? "Error al crear el lote."); return; }
    setOpen(false);
    router.push(`/app/qr-tags/${res.batchId}`);
  }

  return (
    <>
      <Button
        onClick={() => setOpen(true)}
        size="sm"
        pill
        variant={inline ? "primary" : "primary"}
        leftIcon={<Plus className="h-3.5 w-3.5" />}
      >
        Nuevo lote QR
      </Button>

      <Modal open={open} onClose={() => setOpen(false)} title="Nuevo lote de QR" description="Configurá el lote. Una vez creado, podés imprimir los stickers.">
        <form action={handleSubmit} className="px-6 py-5 space-y-4">
          <div>
            <label className="block text-2xs font-medium text-[var(--text-secondary)] mb-1.5">Nombre del lote *</label>
            <Input name="name" placeholder="Lote cámaras Q2 2026" required autoFocus />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-2xs font-medium text-[var(--text-secondary)] mb-1.5">
                Cantidad de stickers *
              </label>
              <Input name="size" type="number" defaultValue="30" min="1" max="300" />
              <p className="text-2xs text-[var(--text-tertiary)] mt-1">30 = 1 hoja Avery 5160</p>
            </div>
            <div>
              <label className="block text-2xs font-medium text-[var(--text-secondary)] mb-1.5">
                Prefijo (2-4 letras)
              </label>
              <Input name="prefix" placeholder="MTL" maxLength={4} />
              <p className="text-2xs text-[var(--text-tertiary)] mt-1">Ej: MTL-ABCD-1234</p>
            </div>
          </div>

          {error && (
            <div className="rounded-lg bg-[var(--danger-bg)] border border-[var(--danger-border)] px-3 py-2 text-2xs text-[var(--danger-fg)]">
              {error}
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="ghost" pill onClick={() => setOpen(false)}>Cancelar</Button>
            <Button type="submit" pill loading={submitting}>Crear lote</Button>
          </div>
        </form>
      </Modal>
    </>
  );
}
