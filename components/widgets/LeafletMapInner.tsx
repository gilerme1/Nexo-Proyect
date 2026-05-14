"use client";

import { useCallback, useEffect, useMemo, useRef } from "react";
import L from "leaflet";
import { Crosshair } from "lucide-react";
import "leaflet/dist/leaflet.css";

interface LocationPoint {
  id: string;
  name: string;
  subtitle?: string;
  latitude?: number;
  longitude?: number;
  status?: string;
  /** Direct hex color — overrides status-based color when present */
  color?: string;
  href?: string;
}

interface Props {
  points: LocationPoint[];
  height: number;
}

const STATUS_COLORS: Record<string, string> = {
  operational: "#34d399",
  attention: "#fbbf24",
  critical: "#ef6b5a",
  default: "#5f87ff",
};

function makeIcon(color: string): L.DivIcon {
  return L.divIcon({
    className: "maintly-marker",
    html: `<div style="
      width: 24px; height: 24px;
      background: ${color};
      border: 3px solid white;
      border-radius: 50%;
      box-shadow: 0 2px 8px rgba(0,0,0,0.3);
    "></div>`,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  });
}

export default function LeafletMapInner({ points, height }: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<L.Map | null>(null);

  const pointsKey = useMemo(
    () =>
      points
        .map((p) => `${p.id}:${p.latitude ?? ""}:${p.longitude ?? ""}:${p.status ?? ""}:${p.color ?? ""}`)
        .join("|"),
    [points],
  );

  const validPoints = useMemo(
    () =>
      points.filter(
        (p) => typeof p.latitude === "number" && typeof p.longitude === "number",
      ) as Array<LocationPoint & { latitude: number; longitude: number }>,
    [pointsKey],
  );

  const centerMap = useCallback(() => {
    const map = mapRef.current;
    if (!map) return;
    if (validPoints.length === 0) return;

    if (validPoints.length === 1) {
      map.setView([validPoints[0].latitude, validPoints[0].longitude], 15, {
        animate: true,
      });
      return;
    }

    map.fitBounds(
      L.latLngBounds(
        validPoints.map((p) => [p.latitude, p.longitude] as [number, number]),
      ),
      { padding: [40, 40], animate: true },
    );
  }, [validPoints]);

  useEffect(() => {
    if (!containerRef.current) return;
    if (mapRef.current) return;
    if (validPoints.length === 0) return;

    const map = L.map(containerRef.current, {
      zoomControl: true,
      attributionControl: true,
      scrollWheelZoom: false,
    });

    // Belt and suspenders: keep page scrolling natural even if Leaflet internals
    // or plugins try to re-enable wheel zoom later.
    map.scrollWheelZoom.disable();

    if (validPoints.length === 1) {
      map.setView([validPoints[0].latitude, validPoints[0].longitude], 15);
    } else {
      map.fitBounds(
        L.latLngBounds(
          validPoints.map((p) => [p.latitude, p.longitude] as [number, number]),
        ),
        { padding: [40, 40] },
      );
    }

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "&copy; OpenStreetMap",
      maxZoom: 19,
    }).addTo(map);

    for (const p of validPoints) {
      const color = p.color ?? (STATUS_COLORS[p.status ?? "default"] ?? STATUS_COLORS.default);
      const marker = L.marker([p.latitude, p.longitude], {
        icon: makeIcon(color),
      }).addTo(map);
      const nameHtml = p.href
        ? `<a href="${p.href}" style="color:#3b6cff;text-decoration:none;font-weight:600;font-size:13px">${escapeHtml(p.name)}</a>`
        : `<strong style="font-size:13px">${escapeHtml(p.name)}</strong>`;
      const subtitleHtml = p.subtitle
        ? `<br/><span style="font-size:11px;color:#647089">${escapeHtml(p.subtitle)}</span>`
        : "";
      marker.bindPopup(`<div style="font-family:system-ui,sans-serif;line-height:1.4">${nameHtml}${subtitleHtml}</div>`);
    }

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, [validPoints]);

  return (
    <div className="relative" style={{ width: "100%", height }}>
      <div ref={containerRef} style={{ width: "100%", height }} />
      <button
        type="button"
        onClick={centerMap}
        aria-label="Centrar mapa"
        title="Centrar mapa"
        className="absolute right-3 top-3 z-[500] inline-flex h-9 items-center gap-2 rounded-full border border-[var(--border-default)] bg-[var(--bg-card-elevated)] px-3 text-xs font-medium text-[var(--text-secondary)] shadow-[var(--shadow-elevated)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)]"
      >
        <Crosshair className="h-4 w-4" />
        Centrar mapa
      </button>
    </div>
  );
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
