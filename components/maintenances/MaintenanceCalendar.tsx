"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { cn } from "@/lib/utils/cn";

interface CalendarEvent {
  id: string;
  title: string;
  date: string; // YYYY-MM-DD
  status: string;
  equipmentName: string;
}

const DAYS = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];
const MONTHS = ["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"];

export function MaintenanceCalendar({ events }: { events: CalendarEvent[] }) {
  const today = new Date("2026-04-30"); // anchored to demo date
  const [viewDate, setViewDate] = useState(new Date(today.getFullYear(), today.getMonth(), 1));

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();

  // Build calendar grid
  const firstDay = new Date(year, month, 1);
  // Monday-first: 0=Mon...6=Sun
  const startDow = (firstDay.getDay() + 6) % 7;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: (number | null)[] = [
    ...Array(startDow).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  // Pad to full weeks
  while (cells.length % 7 !== 0) cells.push(null);

  const eventsByDay = new Map<string, CalendarEvent[]>();
  for (const ev of events) {
    const [evYear, evMonth] = ev.date.split("-").map(Number);
    if (evYear === year && evMonth - 1 === month) {
      const key = ev.date;
      if (!eventsByDay.has(key)) eventsByDay.set(key, []);
      eventsByDay.get(key)!.push(ev);
    }
  }

  function prevMonth() {
    setViewDate(new Date(year, month - 1, 1));
  }
  function nextMonth() {
    setViewDate(new Date(year, month + 1, 1));
  }

  const [tooltip, setTooltip] = useState<{ day: number; evs: CalendarEvent[] } | null>(null);

  return (
    <Card>
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border-subtle)]">
        <h3 className="text-sm font-semibold text-[var(--text-primary)]">
          {MONTHS[month]} {year}
        </h3>
        <div className="flex items-center gap-1">
          <button
            onClick={prevMonth}
            className="grid h-8 w-8 place-items-center rounded-full hover:bg-[var(--bg-hover)] text-[var(--text-secondary)]"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            onClick={nextMonth}
            className="grid h-8 w-8 place-items-center rounded-full hover:bg-[var(--bg-hover)] text-[var(--text-secondary)]"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="px-4 py-4">
        {/* Day labels */}
        <div className="grid grid-cols-7 mb-2">
          {DAYS.map((d) => (
            <div key={d} className="text-center text-2xs font-semibold text-[var(--text-tertiary)] py-1">
              {d}
            </div>
          ))}
        </div>

        {/* Grid */}
        <div className="grid grid-cols-7 gap-px bg-[var(--border-subtle)] rounded-xl overflow-hidden">
          {cells.map((day, i) => {
            if (!day) {
              return <div key={i} className="bg-[var(--bg-page)] aspect-square" />;
            }
            const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
            const dayEvents = eventsByDay.get(dateStr) ?? [];
            const isToday =
              today.getFullYear() === year &&
              today.getMonth() === month &&
              today.getDate() === day;
            const hasOverdue = dayEvents.some((e) => e.status === "overdue");
            const hasEvents = dayEvents.length > 0;

            return (
              <div
                key={i}
                className={cn(
                  "bg-[var(--bg-page)] aspect-square flex flex-col items-center justify-start pt-1.5 px-1 relative cursor-default",
                  hasEvents && "cursor-pointer hover:bg-[var(--bg-hover)]",
                )}
                onMouseEnter={() => hasEvents && setTooltip({ day, evs: dayEvents })}
                onMouseLeave={() => setTooltip(null)}
              >
                <span
                  className={cn(
                    "text-xs leading-none tabular h-6 w-6 flex items-center justify-center rounded-full",
                    isToday && "bg-[var(--accent-500)] text-white font-bold",
                    !isToday && "text-[var(--text-primary)]",
                  )}
                >
                  {day}
                </span>
                {hasEvents && (
                  <div className="flex gap-0.5 mt-1 flex-wrap justify-center">
                    {dayEvents.slice(0, 3).map((ev) => (
                      <span
                        key={ev.id}
                        className={cn(
                          "h-1.5 w-1.5 rounded-full",
                          ev.status === "overdue"
                            ? "bg-[var(--danger-fg)]"
                            : "bg-[var(--accent-500)]",
                        )}
                      />
                    ))}
                  </div>
                )}

                {/* Tooltip */}
                {tooltip?.day === day && dayEvents.length > 0 && (
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-20 w-56 bg-[var(--bg-card-elevated)] border border-[var(--border-default)] rounded-xl shadow-[var(--shadow-elevated)] p-3 space-y-1.5 pointer-events-none">
                    {dayEvents.map((ev) => (
                      <div key={ev.id} className="space-y-0.5">
                        <p className="text-2xs font-semibold text-[var(--text-primary)] leading-tight">{ev.title}</p>
                        <p className="text-2xs text-[var(--text-tertiary)]">{ev.equipmentName}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 mt-3 px-1">
          <span className="flex items-center gap-1.5 text-2xs text-[var(--text-tertiary)]">
            <span className="h-2 w-2 rounded-full bg-[var(--accent-500)]" />
            Programado
          </span>
          <span className="flex items-center gap-1.5 text-2xs text-[var(--text-tertiary)]">
            <span className="h-2 w-2 rounded-full bg-[var(--danger-fg)]" />
            Vencido
          </span>
        </div>
      </div>
    </Card>
  );
}
