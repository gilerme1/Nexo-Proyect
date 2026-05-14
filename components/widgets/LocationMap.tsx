"use client";

import dynamic from "next/dynamic";
import { useEffect, useMemo, useRef, useState } from "react";
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
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [shouldLoadMap, setShouldLoadMap] = useState(false);
  const validPoints = useMemo(
    () =>
      points.filter(
        (p) => typeof p.latitude === "number" && typeof p.longitude === "number",
      ),
    [points],
  );

  useEffect(() => {
    if (shouldLoadMap) return;
    const node = containerRef.current;
    if (!node) return;

    if (!("IntersectionObserver" in window)) {
      setShouldLoadMap(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShouldLoadMap(true);
          observer.disconnect();
        }
      },
      { rootMargin: "240px" },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [shouldLoadMap]);

  if (validPoints.length === 0) {
    return (
      <div ref={containerRef}>
        <Card className={className}>
          <div className="grid place-items-center text-center px-6 py-12">
            <p className="text-sm text-[var(--text-tertiary)]">{emptyMessage}</p>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div ref={containerRef}>
      <Card className={className}>
        <div
          className="overflow-hidden rounded-[var(--radius-card)]"
          style={{ height }}
        >
          {shouldLoadMap ? (
            <LeafletMap points={validPoints} height={height} />
          ) : (
            <div className="grid place-items-center" style={{ height }}>
              <Loader2 className="h-5 w-5 text-[var(--text-tertiary)] animate-spin" />
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
