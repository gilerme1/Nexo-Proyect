"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { X, ArrowLeft, QrCode, ClipboardList } from "lucide-react";
import { LocationMap } from "@/components/widgets/LocationMap";
import { EquipmentStatusBadge } from "@/components/ui/EquipmentStatusBadge";
import { EmptyState } from "@/components/ui/EmptyState";
import { QrScanner } from "@/components/qr/QrScanner";
import { Button } from "@/components/ui/Button";
import type { Location, Equipment } from "@/lib/types";

type Step = "location" | "equipment" | "ready";

interface InspectionWizardProps {
  locations: Location[];
  equipment: Equipment[];
  onClose: () => void;
}

export function InspectionWizard({ locations, equipment, onClose }: InspectionWizardProps) {
  const router = useRouter();
  const [step, setStep] = useState<Step>("location");
  const [locationId, setLocationId] = useState<string | null>(null);
  const [equipmentId, setEquipmentId] = useState<string | null>(null);
  const [scannerOpen, setScannerOpen] = useState(false);

  const locationsById = useMemo(
    () => new Map(locations.map((location) => [location.id, location])),
    [locations],
  );
  const equipmentById = useMemo(
    () => new Map(equipment.map((item) => [item.id, item])),
    [equipment],
  );
  const equipmentByLocation = useMemo(() => {
    const index = new Map<string, Equipment[]>();
    for (const item of equipment) {
      if (!item.locationId) continue;
      const list = index.get(item.locationId);
      if (list) {
        list.push(item);
      } else {
        index.set(item.locationId, [item]);
      }
    }
    return index;
  }, [equipment]);

  const selectedLocation = locationId ? locationsById.get(locationId) : undefined;
  const selectedEquipment = equipmentId ? equipmentById.get(equipmentId) : undefined;
  const locationEquipment = locationId ? (equipmentByLocation.get(locationId) ?? []) : [];

  const mapPoints = useMemo(
    () =>
      locations.map((l) => ({
        id: l.id,
        name: l.name,
        latitude: l.latitude,
        longitude: l.longitude,
        status: l.status,
      })),
    [locations],
  );

  return (
    <div className="fixed inset-0 z-[60] bg-[var(--bg-app)] flex flex-col">
      {/* ── Step 1: Elegir ubicación ── */}
      {step === "location" && (
        <>
          <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--border-subtle)] shrink-0">
            <h2 className="text-base font-semibold text-[var(--text-primary)]">¿Dónde estás?</h2>
            <button
              type="button"
              onClick={onClose}
              className="grid h-8 w-8 place-items-center rounded-full text-[var(--text-secondary)] hover:bg-[var(--bg-hover)]"
              aria-label="Cerrar"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto">
            <LocationMap points={mapPoints} height={220} />

            <div className="divide-y divide-[var(--border-subtle)]">
              {locations.map((loc) => {
                const eqCount = equipmentByLocation.get(loc.id)?.length ?? 0;
                return (
                  <button
                    key={loc.id}
                    type="button"
                    onClick={() => { setLocationId(loc.id); setStep("equipment"); }}
                    className="w-full flex items-center justify-between gap-4 px-4 py-3.5 hover:bg-[var(--bg-hover)] text-left transition-colors"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-[var(--text-primary)] truncate">{loc.name}</p>
                      {(loc.address || loc.city) && (
                        <p className="text-2xs text-[var(--text-tertiary)] truncate mt-0.5">
                          {[loc.address, loc.city].filter(Boolean).join(" · ")}
                        </p>
                      )}
                    </div>
                    <span className="text-2xs text-[var(--text-tertiary)] shrink-0 tabular">
                      {eqCount} {eqCount === 1 ? "equipo" : "equipos"}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </>
      )}

      {/* ── Step 2: Elegir equipo ── */}
      {step === "equipment" && (
        <>
          <div className="flex items-center gap-2 px-4 py-3 border-b border-[var(--border-subtle)] shrink-0">
            <button
              type="button"
              onClick={() => setStep("location")}
              className="grid h-8 w-8 shrink-0 place-items-center rounded-full text-[var(--text-secondary)] hover:bg-[var(--bg-hover)]"
              aria-label="Volver"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
            <h2 className="text-base font-semibold text-[var(--text-primary)] truncate flex-1">
              Equipos en {selectedLocation?.name ?? "—"}
            </h2>
            <button
              type="button"
              onClick={onClose}
              className="grid h-8 w-8 shrink-0 place-items-center rounded-full text-[var(--text-secondary)] hover:bg-[var(--bg-hover)]"
              aria-label="Cerrar"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto">
            <div className="px-4 py-3 border-b border-[var(--border-subtle)]">
              <button
                type="button"
                onClick={() => setScannerOpen(true)}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-[var(--accent-500)] text-white py-2.5 text-sm font-semibold transition-opacity hover:opacity-90"
              >
                <QrCode className="h-4 w-4" />
                Escanear QR
              </button>
            </div>

            {locationEquipment.length === 0 ? (
              <EmptyState
                icon={ClipboardList}
                title="Sin equipos en esta ubicación"
                description="No hay equipos registrados aquí."
              />
            ) : (
              <div className="divide-y divide-[var(--border-subtle)]">
                {locationEquipment.map((eq) => (
                  <button
                    key={eq.id}
                    type="button"
                    onClick={() => { setEquipmentId(eq.id); setStep("ready"); }}
                    className="w-full flex items-center justify-between gap-4 px-4 py-3.5 hover:bg-[var(--bg-hover)] text-left transition-colors"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-[var(--text-primary)] truncate">{eq.name}</p>
                      <p className="text-2xs text-[var(--text-tertiary)] mt-0.5 tabular">{eq.internalCode}</p>
                    </div>
                    <EquipmentStatusBadge status={eq.status} />
                  </button>
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {/* ── Step 3: Confirmar ── */}
      {step === "ready" && selectedEquipment && (
        <>
          <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--border-subtle)] shrink-0">
            <h2 className="text-base font-semibold text-[var(--text-primary)]">Confirmar</h2>
            <button
              type="button"
              onClick={onClose}
              className="grid h-8 w-8 place-items-center rounded-full text-[var(--text-secondary)] hover:bg-[var(--bg-hover)]"
              aria-label="Cerrar"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="flex-1 flex flex-col items-center justify-center px-6 gap-6">
            <div className="w-full rounded-2xl bg-[var(--bg-card)] border border-[var(--border-subtle)] p-5 space-y-3">
              <div>
                <p className="text-2xs text-[var(--text-tertiary)]">Equipo</p>
                <p className="text-sm font-semibold text-[var(--text-primary)] mt-0.5">{selectedEquipment.name}</p>
                <p className="text-2xs text-[var(--text-tertiary)] tabular">{selectedEquipment.internalCode}</p>
              </div>
              <div>
                <p className="text-2xs text-[var(--text-tertiary)]">Ubicación</p>
                <p className="text-sm font-medium text-[var(--text-primary)] mt-0.5">{selectedLocation?.name ?? "—"}</p>
              </div>
              <EquipmentStatusBadge status={selectedEquipment.status} />
            </div>

            <Button
              pill
              className="w-full"
              onClick={() => router.push(`/app/reports/new?equipmentId=${equipmentId}`)}
            >
              Iniciar reporte
            </Button>

            <button
              type="button"
              onClick={() => setStep("equipment")}
              className="text-sm text-[var(--accent-400)] hover:text-[var(--accent-300)] transition-colors"
            >
              Elegir otro equipo
            </button>
          </div>
        </>
      )}

      {scannerOpen && <QrScanner onClose={() => setScannerOpen(false)} />}
    </div>
  );
}
