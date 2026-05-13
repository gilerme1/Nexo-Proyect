"use client";

import { useEffect, useState } from "react";
import {
  Cloud,
  CloudRain,
  CloudSnow,
  Sun,
  CloudFog,
  CloudLightning,
  Wind,
  MapPin,
  Loader2,
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Tooltip } from "@/components/ui/Tooltip";

interface WeatherData {
  current: {
    temperature: number;
    apparentTemperature: number;
    weatherCode: number;
    windSpeed: number;
  };
  daily: {
    days: { day: string; min: number; max: number; weatherCode: number }[];
  };
  locationName: string;
}

const FALLBACK = { lat: -34.9011, lng: -56.1645, name: "Montevideo" };
const STORAGE_KEY = "maintly-weather-cache";

// WMO codes → label + icon picker
function describeWmo(code: number) {
  if (code === 0) return { label: "Despejado", Icon: Sun };
  if (code <= 3) return { label: "Parcialmente nublado", Icon: Cloud };
  if (code === 45 || code === 48) return { label: "Niebla", Icon: CloudFog };
  if (code >= 51 && code <= 67) return { label: "Llovizna", Icon: CloudRain };
  if (code >= 71 && code <= 77) return { label: "Nieve", Icon: CloudSnow };
  if (code >= 80 && code <= 82) return { label: "Lluvia", Icon: CloudRain };
  if (code === 95 || code === 96 || code === 99)
    return { label: "Tormenta", Icon: CloudLightning };
  return { label: "Variable", Icon: Cloud };
}

const DAY_LABELS = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];

export function WeatherWidget() {
  const [data, setData] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [usingFallback, setUsingFallback] = useState(false);

  useEffect(() => {
    let cancelled = false;

    // Try cache first (avoids unnecessary calls)
    try {
      const cached = localStorage.getItem(STORAGE_KEY);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Date.now() - parsed.fetchedAt < 30 * 60 * 1000) {
          setData(parsed.data);
          setUsingFallback(parsed.usingFallback);
          setLoading(false);
          return;
        }
      }
    } catch {
      // ignore
    }

    function getCoords(): Promise<{ lat: number; lng: number; name: string; isFallback: boolean }> {
      return new Promise((resolve) => {
        if (!("geolocation" in navigator)) {
          resolve({ ...FALLBACK, isFallback: true });
          return;
        }
        navigator.geolocation.getCurrentPosition(
          async (pos) => {
            // Reverse-geocode (best effort)
            const { latitude, longitude } = pos.coords;
            let name = "Tu ubicación";
            try {
              const res = await fetch(
                `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json&accept-language=es&zoom=10`,
                { headers: { "User-Agent": "Maintly/1.0" } },
              );
              if (res.ok) {
                const j = await res.json();
                name =
                  j.address?.city ||
                  j.address?.town ||
                  j.address?.village ||
                  j.address?.state ||
                  name;
              }
            } catch {
              // ignore
            }
            resolve({ lat: latitude, lng: longitude, name, isFallback: false });
          },
          () => resolve({ ...FALLBACK, isFallback: true }),
          { timeout: 5000, maximumAge: 60 * 60 * 1000 },
        );
      });
    }

    async function load() {
      try {
        const { lat, lng, name, isFallback } = await getCoords();
        const url = new URL("https://api.open-meteo.com/v1/forecast");
        url.searchParams.set("latitude", String(lat));
        url.searchParams.set("longitude", String(lng));
        url.searchParams.set(
          "current",
          "temperature_2m,apparent_temperature,weather_code,wind_speed_10m",
        );
        url.searchParams.set(
          "daily",
          "weather_code,temperature_2m_max,temperature_2m_min",
        );
        url.searchParams.set("timezone", "auto");
        url.searchParams.set("forecast_days", "4");

        const res = await fetch(url.toString());
        if (!res.ok) throw new Error("API");
        const j = await res.json();

        const result: WeatherData = {
          current: {
            temperature: Math.round(j.current.temperature_2m),
            apparentTemperature: Math.round(j.current.apparent_temperature),
            weatherCode: j.current.weather_code,
            windSpeed: Math.round(j.current.wind_speed_10m),
          },
          daily: {
            days: j.daily.time.slice(1, 4).map((iso: string, i: number) => ({
              day: DAY_LABELS[new Date(iso).getDay()],
              min: Math.round(j.daily.temperature_2m_min[i + 1]),
              max: Math.round(j.daily.temperature_2m_max[i + 1]),
              weatherCode: j.daily.weather_code[i + 1],
            })),
          },
          locationName: name,
        };

        if (!cancelled) {
          setData(result);
          setUsingFallback(isFallback);
          setLoading(false);
          try {
            localStorage.setItem(
              STORAGE_KEY,
              JSON.stringify({ data: result, usingFallback: isFallback, fetchedAt: Date.now() }),
            );
          } catch {
            // ignore
          }
        }
      } catch {
        if (!cancelled) {
          setError("No se pudo cargar el clima");
          setLoading(false);
        }
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <Card>
        <div className="p-5 flex items-center justify-center min-h-[180px]">
          <Loader2 className="h-5 w-5 text-[var(--text-tertiary)] animate-spin" />
        </div>
      </Card>
    );
  }

  if (error || !data) {
    return (
      <Card>
        <div className="p-5 min-h-[180px] flex items-center justify-center">
          <p className="text-2xs text-[var(--text-tertiary)]">{error}</p>
        </div>
      </Card>
    );
  }

  const { Icon, label } = describeWmo(data.current.weatherCode);

  return (
    <Card>
      <div className="p-5">
        <div className="flex items-start justify-between mb-4">
          <div className="min-w-0">
            <p className="text-sm font-medium text-[var(--text-primary)]">Clima</p>
            <Tooltip
              content={
                usingFallback
                  ? "Mostrando Montevideo. Habilitá geolocalización para ver tu ubicación."
                  : "Usando tu ubicación actual"
              }
              side="top"
            >
              <p className="text-2xs text-[var(--text-tertiary)] mt-0.5 flex items-center gap-1">
                <MapPin className="h-2.5 w-2.5" />
                {data.locationName}
              </p>
            </Tooltip>
          </div>
          <span className="grid h-9 w-9 place-items-center rounded-full bg-[var(--info-bg)] text-[var(--info-fg)]">
            <Icon className="h-4 w-4" />
          </span>
        </div>

        <div className="flex items-baseline gap-1.5 tabular mb-3">
          <span className="text-display font-semibold text-[var(--text-primary)] tracking-tight">
            {data.current.temperature}
          </span>
          <span className="text-base text-[var(--text-secondary)] font-medium">°C</span>
        </div>
        <p className="text-2xs text-[var(--text-tertiary)] mb-4">
          {label} · sensación {data.current.apparentTemperature}°
          <span className="inline-flex items-center gap-1 ml-1">
            · <Wind className="h-2.5 w-2.5 inline" /> {data.current.windSpeed} km/h
          </span>
        </p>

        <div className="grid grid-cols-3 gap-2 pt-3 border-t border-[var(--border-subtle)]">
          {data.daily.days.map((d, i) => {
            const FCIcon = describeWmo(d.weatherCode).Icon;
            return (
              <div key={i} className="text-center">
                <p className="text-2xs text-[var(--text-tertiary)] mb-1">{d.day}</p>
                <FCIcon className="h-4 w-4 mx-auto text-[var(--text-secondary)]" />
                <p className="mt-1 text-2xs tabular text-[var(--text-primary)] font-medium">
                  {d.max}° <span className="text-[var(--text-tertiary)] font-normal">{d.min}°</span>
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </Card>
  );
}
