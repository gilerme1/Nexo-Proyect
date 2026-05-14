"use client";

import { useState, useRef, useEffect } from "react";
import {
  format, parseISO, isValid, isSameDay, isSameMonth, isToday,
  startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval,
  addMonths, subMonths,
} from "date-fns";
import { es } from "date-fns/locale";
import { Calendar, ChevronLeft, ChevronRight, X } from "lucide-react";
import { cn } from "@/lib/utils/cn";

const WEEK_DAYS = ["Lu", "Ma", "Mi", "Ju", "Vi", "Sá", "Do"];

interface DatePickerProps {
  value: string; // "YYYY-MM-DD" or ""
  onChange: (value: string) => void;
  placeholder?: string;
  inputSize?: "sm" | "md";
  className?: string;
}

export function DatePicker({
  value,
  onChange,
  placeholder = "Seleccionar fecha",
  inputSize = "md",
  className,
}: DatePickerProps) {
  const [open, setOpen] = useState(false);
  const [viewDate, setViewDate] = useState<Date>(() => {
    if (value && isValid(parseISO(value))) return parseISO(value);
    return new Date();
  });
  const ref = useRef<HTMLDivElement>(null);

  const selected = value && isValid(parseISO(value)) ? parseISO(value) : null;
  const heights = inputSize === "sm" ? "h-8 text-xs" : "h-10 text-sm";

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    if (open) document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, [open]);

  // Sync view when value changes externally
  useEffect(() => {
    if (value && isValid(parseISO(value))) setViewDate(parseISO(value));
  }, [value]);

  const monthStart = startOfMonth(viewDate);
  const monthEnd   = endOfMonth(viewDate);
  const calStart   = startOfWeek(monthStart, { weekStartsOn: 1 });
  const calEnd     = endOfWeek(monthEnd,   { weekStartsOn: 1 });
  const days       = eachDayOfInterval({ start: calStart, end: calEnd });

  function handleSelect(day: Date) {
    onChange(format(day, "yyyy-MM-dd"));
    setOpen(false);
  }

  function handleClear(e: React.MouseEvent) {
    e.stopPropagation();
    onChange("");
  }

  return (
    <div ref={ref} className={cn("relative", className)}>
      {/* Trigger */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "w-full flex items-center gap-2.5 rounded-full outline-none",
          "bg-[var(--bg-input)] border border-[var(--border-default)]",
          "pl-4 pr-3",
          "focus:border-[var(--accent-500)] focus:ring-2 focus:ring-[var(--accent-500)]/20",
          "hover:border-[var(--border-hover)] transition-[border-color,box-shadow]",
          heights,
        )}
      >
        <Calendar className="h-3.5 w-3.5 text-[var(--text-tertiary)] shrink-0" />
        <span
          className={cn(
            "flex-1 text-left truncate",
            selected ? "text-[var(--text-primary)]" : "text-[var(--text-tertiary)]",
          )}
        >
          {selected ? format(selected, "dd/MM/yyyy") : placeholder}
        </span>
        {selected ? (
          <span
            role="button"
            tabIndex={-1}
            onMouseDown={handleClear}
            className="grid h-5 w-5 place-items-center rounded-full hover:bg-[var(--bg-hover)] text-[var(--text-tertiary)] hover:text-[var(--text-primary)] cursor-pointer"
          >
            <X className="h-3 w-3" />
          </span>
        ) : (
          <ChevronLeft
            className={cn(
              "h-3.5 w-3.5 text-[var(--text-tertiary)] shrink-0 rotate-[-90deg] transition-transform duration-150",
              open && "rotate-90",
            )}
          />
        )}
      </button>

      {/* Calendar popover */}
      {open && (
        <div className="absolute top-full left-0 mt-2 z-[200] w-[360px] bg-[var(--bg-card-elevated)] border border-[var(--border-default)] rounded-2xl shadow-[var(--shadow-elevated)] p-5">
          {/* Month navigation */}
          <div className="flex items-center justify-between mb-3">
            <button
              type="button"
              onClick={() => setViewDate(subMonths(viewDate, 1))}
              className="h-7 w-7 grid place-items-center rounded-full hover:bg-[var(--bg-hover)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="text-sm font-semibold text-[var(--text-primary)] capitalize">
              {format(viewDate, "MMMM yyyy", { locale: es })}
            </span>
            <button
              type="button"
              onClick={() => setViewDate(addMonths(viewDate, 1))}
              className="h-7 w-7 grid place-items-center rounded-full hover:bg-[var(--bg-hover)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          {/* Weekday headers */}
          <div className="grid grid-cols-7 mb-1">
            {WEEK_DAYS.map((d) => (
              <div
                key={d}
                className="text-center text-[11px] font-medium text-[var(--text-tertiary)] uppercase py-1"
              >
                {d}
              </div>
            ))}
          </div>

          {/* Days */}
          <div className="grid grid-cols-7 gap-y-1">
            {days.map((day) => {
              const isSelected    = selected ? isSameDay(day, selected) : false;
              const isThisMonth   = isSameMonth(day, viewDate);
              const isTodayDay    = isToday(day);

              return (
                <button
                  key={day.toISOString()}
                  type="button"
                  onClick={() => handleSelect(day)}
                  className={cn(
                    "h-10 w-full rounded-full text-sm transition-colors",
                    isSelected
                      ? "bg-[var(--accent-500)] text-white font-semibold"
                      : isTodayDay
                      ? "text-[var(--accent-500)] font-semibold hover:bg-[var(--bg-hover)]"
                      : isThisMonth
                      ? "text-[var(--text-primary)] hover:bg-[var(--bg-hover)]"
                      : "text-[var(--text-tertiary)] opacity-40 hover:bg-[var(--bg-hover)]",
                  )}
                >
                  {format(day, "d")}
                </button>
              );
            })}
          </div>

          {/* Today shortcut */}
          <div className="mt-3 pt-3 border-t border-[var(--border-subtle)]">
            <button
              type="button"
              onClick={() => handleSelect(new Date())}
              className="w-full text-xs text-center text-[var(--accent-500)] hover:text-[var(--accent-400)] font-medium py-1"
            >
              Hoy
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
