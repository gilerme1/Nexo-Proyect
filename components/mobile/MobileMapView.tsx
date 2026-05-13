"use client";

import { useRouter } from "next/navigation";
import { LocationMap } from "@/components/widgets/LocationMap";
import type { Client, Location, Equipment } from "@/lib/types";

interface Props {
  clients: Client[];
  locations: Location[];
  equipment: Equipment[];
}

export function MobileMapView({ clients, locations, equipment }: Props) {
  const router = useRouter();

  const points = locations
    .filter((l) => l.latitude && l.longitude)
    .map((l) => ({
      id: l.id,
      name: l.name,
      latitude: l.latitude!,
      longitude: l.longitude!,
      status: l.status,
    }));

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <h2 className="text-sm font-semibold text-[var(--text-primary)] flex-1">Clientes</h2>
        <span className="text-2xs tabular text-[var(--text-tertiary)] bg-[var(--bg-card)] border border-[var(--border-subtle)] px-2 py-0.5 rounded-full">
          {clients.length}
        </span>
      </div>

      <LocationMap points={points} height={260} />

      <div className="space-y-2">
        {clients.length === 0 ? (
          <p className="text-center text-sm text-[var(--text-tertiary)] py-8">
            No hay clientes registrados.
          </p>
        ) : (
          clients.map((client) => {
            const firstLocation = locations.find((l) => l.clientId === client.id);
            const eqCount = equipment.filter((e) => e.clientId === client.id).length;
            return (
              <button
                key={client.id}
                type="button"
                onClick={() => router.push(`/app/equipment?clientId=${client.id}`)}
                className="w-full flex items-center justify-between gap-4 p-4 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-subtle)] hover:bg-[var(--bg-hover)] text-left"
              >
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-[var(--text-primary)] truncate">{client.name}</p>
                  <p className="text-2xs text-[var(--text-tertiary)] truncate mt-0.5">
                    {firstLocation?.address ?? "—"}
                  </p>
                </div>
                <span className="text-2xs text-[var(--text-tertiary)] shrink-0 tabular">
                  {eqCount} {eqCount === 1 ? "equipo" : "equipos"}
                </span>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}
