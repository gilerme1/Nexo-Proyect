"use client";

import dynamic from "next/dynamic";
import { Loader2 } from "lucide-react";
import { Card } from "@/components/ui/Card";

interface LocationPoint {
  id: string;
  name: string;
  subtitle?: string;
  latitude?: number;
  longitude?: number;
  status?: string;
  color?: string;
  href?: string;
}

interface LocationMapProps {
  points: LocationPoint[];
  height?: number;
  className?: string;
  emptyMessage?: string;
}

// Dynamic import: Leaflet uses `window`, must not run in SSR
const LeafletMap = dynamic(() => import("./LeafletMapInner"), {
  ssr: false,
  loading: () => (
    <div className="grid place-items-center" style={{ height: 320 }}>
      <Loader2 className="h-5 w-5 text-[var(--text-tertiary)] animate-spin" />
    </div>
  ),
});

export function LocationMap({
  points,
  height = 320,
  className,
  emptyMessage = "Sin ubicaciones para mostrar",
}: LocationMapProps) {
  const validPoints = points.filter(
    (p) => typeof p.latitude === "number" && typeof p.longitude === "number",
  );

  if (validPoints.length === 0) {
    return (
      <Card className={className}>
        <div className="grid place-items-center text-center px-6 py-12">
          <p className="text-sm text-[var(--text-tertiary)]">{emptyMessage}</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <div
        className="overflow-hidden rounded-[var(--radius-card)]"
        style={{ height }}
      >
        <LeafletMap points={validPoints} height={height} />
      </div>
    </Card>
  );
}
