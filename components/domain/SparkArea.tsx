"use client";

import { useId, useState } from "react";
import { cn } from "@/lib/utils/cn";

// ============================================================================
// SparkArea — line chart with gradient fill + interactive hover
// ============================================================================

interface SparkAreaProps {
  data: number[];
  /** Optional labels per data point (e.g. ["Ene", "Feb", ...]) */
  labels?: string[];
  /** Suffix appended to value in tooltip (e.g. " USD", " equipos", "%") */
  valueSuffix?: string;
  /** Prefix prepended to value in tooltip (e.g. "$") */
  valuePrefix?: string;
  /** Highlight a specific index by default (last data point if undefined) */
  highlightIndex?: number;
  height?: number;
  color?: "accent" | "danger";
  showGrid?: boolean;
  /** X-axis labels printed below the chart (subset like ["19:30","20:20","20:45"]) */
  axisLabels?: string[];
  className?: string;
}

export function SparkArea({
  data,
  labels,
  valueSuffix = "",
  valuePrefix = "",
  highlightIndex,
  height = 120,
  color = "accent",
  showGrid = true,
  axisLabels,
  className,
}: SparkAreaProps) {
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);

  if (data.length < 2) return null;

  // Local formatter — kept inside the client component so no function crosses the boundary
  const formatValue = (v: number) => {
    const formatted = new Intl.NumberFormat("es-UY").format(v);
    return `${valuePrefix}${formatted}${valueSuffix}`;
  };

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;

  const width = 600;
  const padTop = 8;
  const padBottom = 16;
  const stepX = width / (data.length - 1);

  const points = data.map((v, i) => {
    const x = i * stepX;
    const y = padTop + ((max - v) / range) * (height - padTop - padBottom);
    return { x, y, value: v, label: labels?.[i] };
  });

  const pathD = points
    .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`)
    .join(" ");

  const areaD = `${pathD} L ${width} ${height} L 0 ${height} Z`;

  const colorVar =
    color === "danger" ? "var(--danger-fg)" : "var(--accent-500)";
  const reactId = useId();
  const gradientId = `spark-${color}-${reactId.replace(/:/g, "")}`;

  const activeIdx =
    hoverIdx ?? (highlightIndex !== undefined ? highlightIndex : data.length - 1);
  const activePoint = points[activeIdx];

  function handleMouseMove(e: React.MouseEvent<SVGSVGElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * width;
    const idx = Math.max(
      0,
      Math.min(data.length - 1, Math.round(x / stepX)),
    );
    setHoverIdx(idx);
  }

  return (
    <div className={cn("relative w-full", className)}>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        preserveAspectRatio="none"
        style={{ height }}
        className="w-full overflow-visible"
        onMouseMove={handleMouseMove}
        onMouseLeave={() => setHoverIdx(null)}
      >
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={colorVar} stopOpacity="0.32" />
            <stop offset="100%" stopColor={colorVar} stopOpacity="0" />
          </linearGradient>
        </defs>

        {showGrid && (
          <g opacity="0.10">
            {[0.25, 0.5, 0.75].map((p) => (
              <line
                key={p}
                x1="0"
                x2={width}
                y1={height * p}
                y2={height * p}
                stroke="currentColor"
                strokeDasharray="2 4"
              />
            ))}
          </g>
        )}

        <path d={areaD} fill={`url(#${gradientId})`} />
        <path
          d={pathD}
          fill="none"
          stroke={colorVar}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          vectorEffect="non-scaling-stroke"
        />

        {/* Vertical guide line on hover */}
        {hoverIdx !== null && activePoint && (
          <line
            x1={activePoint.x}
            x2={activePoint.x}
            y1={padTop}
            y2={height - padBottom}
            stroke={colorVar}
            strokeWidth="1"
            strokeDasharray="2 3"
            opacity="0.5"
            vectorEffect="non-scaling-stroke"
          />
        )}

        {/* Active dot */}
        {activePoint && (
          <circle
            cx={activePoint.x}
            cy={activePoint.y}
            r="5"
            fill="var(--bg-card)"
            stroke={colorVar}
            strokeWidth="2.5"
            vectorEffect="non-scaling-stroke"
          />
        )}
      </svg>

      {/* Tooltip — uses absolute positioning over chart */}
      {hoverIdx !== null && activePoint && (
        <div
          className="absolute -translate-x-1/2 -translate-y-full pointer-events-none z-10"
          style={{
            left: `${(activePoint.x / width) * 100}%`,
            top: `${(activePoint.y / height) * 100}%`,
            marginTop: "-12px",
          }}
        >
          <div className="px-2.5 py-1.5 rounded-lg bg-[var(--bg-card-elevated)] border border-[var(--border-default)] shadow-[var(--shadow-elevated)] whitespace-nowrap">
            <p className="text-sm font-semibold text-[var(--text-primary)] tabular leading-tight">
              {formatValue(activePoint.value)}
            </p>
            {activePoint.label && (
              <p className="text-2xs text-[var(--text-tertiary)] mt-0.5">
                {activePoint.label}
              </p>
            )}
          </div>
        </div>
      )}

      {/* X-axis labels (sparse, like aeros 14:40, 16:30, 19:30, 20:20, 20:45) */}
      {axisLabels && (
        <div className="flex justify-between mt-2 px-1">
          {axisLabels.map((label, i) => (
            <span
              key={i}
              className="text-2xs text-[var(--text-tertiary)] tabular"
            >
              {label}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

// ============================================================================
// SparkBars — diagonal striped bars with hover tooltip (aeros health-score style)
// ============================================================================

interface SparkBarsProps {
  data: number[];
  highlightIndex?: number;
  labels?: string[];
  valueSuffix?: string;
  valuePrefix?: string;
  height?: number;
  className?: string;
}

export function SparkBars({
  data,
  highlightIndex,
  labels,
  valueSuffix = "",
  valuePrefix = "",
  height = 120,
  className,
}: SparkBarsProps) {
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);
  if (data.length === 0) return null;
  const max = Math.max(...data, 1);
  const activeIdx = hoverIdx ?? highlightIndex;

  const formatValue = (v: number) =>
    `${valuePrefix}${new Intl.NumberFormat("es-UY").format(v)}${valueSuffix}`;

  return (
    <div className={cn("w-full", className)}>
      <div
        className="flex items-end gap-1 px-1 relative"
        style={{ height: height + 24 }}
        onMouseLeave={() => setHoverIdx(null)}
      >
        {data.map((v, i) => {
          const isActive = i === activeIdx;
          const isHovered = i === hoverIdx;
          const heightPct = (v / max) * 100;
          return (
            <div
              key={i}
              className="flex-1 flex flex-col items-center justify-end relative cursor-pointer"
              style={{ height: "100%" }}
              onMouseEnter={() => setHoverIdx(i)}
            >
              {/* Floating value pill on the active bar */}
              {isActive && (
                <div className="absolute -top-1 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full bg-[var(--accent-500)] text-white text-2xs font-semibold tabular shadow-sm whitespace-nowrap z-10">
                  {formatValue(v)}
                </div>
              )}

              <div
                className="relative w-full flex items-end justify-center"
                style={{ height: `${heightPct}%`, minHeight: "8px" }}
              >
                <div
                  className={cn(
                    "w-full h-full rounded-md overflow-hidden",
                    isActive
                      ? "bg-[var(--accent-500)]/20"
                      : "bg-[var(--bg-hover)]",
                  )}
                >
                  {/* Diagonal stripes inside */}
                  <div
                    className="w-full h-full"
                    style={{
                      backgroundImage: `repeating-linear-gradient(-45deg, ${
                        isActive
                          ? "var(--accent-500)"
                          : "var(--text-tertiary)"
                      } 0, ${
                        isActive
                          ? "var(--accent-500)"
                          : "var(--text-tertiary)"
                      } 1.5px, transparent 1.5px, transparent 5px)`,
                      opacity: isActive ? 0.6 : 0.25,
                    }}
                  />
                </div>
              </div>

              {/* Hover tooltip (when not the active bar) */}
              {isHovered && i !== highlightIndex && (
                <div
                  className="absolute pointer-events-none z-10"
                  style={{ bottom: `${heightPct}%`, marginBottom: "4px" }}
                >
                  <div className="px-2 py-0.5 rounded-md bg-[var(--bg-card-elevated)] border border-[var(--border-default)] text-2xs font-semibold tabular text-[var(--text-primary)] whitespace-nowrap shadow-sm">
                    {formatValue(v)}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
      {labels && (
        <div className="flex gap-1 mt-2 px-1">
          {labels.map((label, i) => (
            <span
              key={i}
              className={cn(
                "flex-1 text-center text-2xs tabular",
                i === activeIdx
                  ? "text-[var(--text-primary)] font-medium"
                  : "text-[var(--text-tertiary)]",
              )}
            >
              {label}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
