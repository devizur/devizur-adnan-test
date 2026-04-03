"use client";

import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  segmentedStripClass,
  segmentedSideBtnClass,
  segmentedMainBtnClass,
} from "./booking-segmented-styles";

function getOrdinal(n: number) {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

export function formatDialogDate(date: Date) {
  const day = date.getDate();
  const month = date.toLocaleString("en-US", { month: "long" });
  const year = date.getFullYear();
  const weekday = date.toLocaleString("en-US", { weekday: "long" });
  return `${weekday}, ${getOrdinal(day)} ${month} ${year}`;
}

/** Shorter label for compact booking UI (e.g. "Sat, Apr 4, 2026"). */
export function formatDialogDateShort(date: Date) {
  return date.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

/** Format date as YYYY-MM-DD in local time (avoids UTC off-by-one when selecting calendar days). */
export function toLocalDateString(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export interface BookingCalendarProps {
  /** Current value as YYYY-MM-DD */
  value: string;
  /** Called when user selects a date (YYYY-MM-DD) */
  onChange: (date: string) => void;
  /** Optional: minimum selectable month (default: current month) */
  minMonth?: Date;
  /** Optional: maximum selectable month (default: 12 months ahead) */
  maxMonth?: Date;
  /** Optional class for the wrapper */
  className?: string;
}

export function BookingCalendar({
  value,
  onChange,
  minMonth,
  maxMonth,
  className,
}: BookingCalendarProps) {
  const [isCalendarOpen, setIsCalendarOpen] = React.useState(false);
  const [calendarMonth, setCalendarMonth] = React.useState<Date | null>(null);

  const displayDate = React.useMemo(() => {
    if (value) {
      const d = new Date(value + "T12:00:00");
      if (!isNaN(d.getTime())) return d;
    }
    return new Date();
  }, [value]);

  React.useEffect(() => {
    setCalendarMonth((prev) => prev ?? displayDate);
  }, [displayDate]);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const defaultMinMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  const defaultMaxMonth = new Date(today.getFullYear(), today.getMonth() + 11, 1);
  const minCalendarMonth = minMonth ?? defaultMinMonth;
  const maxCalendarMonth = maxMonth ?? defaultMaxMonth;

  const currentCalendarMonth = calendarMonth ?? displayDate;
  const calendarMonthKey = (d: Date) => d.getFullYear() * 12 + d.getMonth();
  const canGoPrevMonth =
    calendarMonthKey(currentCalendarMonth) > calendarMonthKey(minCalendarMonth);
  const canGoNextMonth =
    calendarMonthKey(currentCalendarMonth) < calendarMonthKey(maxCalendarMonth);

  const goToCalendarMonth = (deltaMonths: number) => {
    setCalendarMonth((prev) => {
      const base = prev ?? displayDate;
      const next = new Date(base);
      next.setMonth(next.getMonth() + deltaMonths);
      return next;
    });
  };

  const selectFromCalendar = (d: Date) => {
    onChange(toLocalDateString(d));
    setIsCalendarOpen(false);
  };

  const setDisplayDate = (delta: number) => {
    const d = new Date(displayDate);
    d.setDate(d.getDate() + delta);
    onChange(toLocalDateString(d));
  };

  const calendarYear = currentCalendarMonth.getFullYear();
  const calendarMonthIndex = currentCalendarMonth.getMonth();
  const calendarMonthName = currentCalendarMonth.toLocaleString("en-US", {
    month: "long",
    year: "numeric",
  });

  const firstOfMonth = new Date(calendarYear, calendarMonthIndex, 1);
  const startWeekday = firstOfMonth.getDay();
  const daysInMonth = new Date(calendarYear, calendarMonthIndex + 1, 0).getDate();

  const calendarCells: (Date | null)[] = [];
  for (let i = 0; i < startWeekday; i++) {
    calendarCells.push(null);
  }
  for (let day = 1; day <= daysInMonth; day++) {
    calendarCells.push(new Date(calendarYear, calendarMonthIndex, day));
  }
  while (calendarCells.length % 7 !== 0) {
    calendarCells.push(null);
  }

  return (
    <div className={cn("relative w-full max-w-full", className)}>
      <div className={segmentedStripClass}>
        <button
          type="button"
          onClick={() => setDisplayDate(-1)}
          className={segmentedSideBtnClass}
          aria-label="Previous date"
        >
          <ChevronLeft className="w-4 h-4 shrink-0" />
        </button>
        <button
          type="button"
          onClick={() => setIsCalendarOpen((open) => !open)}
          className={segmentedMainBtnClass}
          aria-label="Open date picker"
          aria-expanded={isCalendarOpen}
        >
          {formatDialogDateShort(displayDate)}
        </button>
        <button
          type="button"
          onClick={() => setDisplayDate(1)}
          className={segmentedSideBtnClass}
          aria-label="Next date"
        >
          <ChevronRight className="w-4 h-4 shrink-0" />
        </button>
      </div>
      <div className="mt-1 h-[15px] shrink-0" aria-hidden />
      {isCalendarOpen && (
        <div className="absolute top-full z-30 mt-2 w-full max-w-xs rounded-2xl border border-zinc-700/70 bg-zinc-900 shadow-xl shadow-black/40">
          <div className="flex items-center justify-between border-b border-zinc-700/60 px-4 py-2">
            <button
              type="button"
              onClick={() => goToCalendarMonth(-1)}
              disabled={!canGoPrevMonth}
              className={cn(
                "p-1 rounded-lg transition-colors",
                canGoPrevMonth
                  ? "text-gray-400 hover:text-white hover:bg-[#252525] cursor-pointer"
                  : "text-gray-600 cursor-not-allowed opacity-40"
              )}
              aria-label="Previous month"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-sm font-medium text-white">{calendarMonthName}</span>
            <button
              type="button"
              onClick={() => goToCalendarMonth(1)}
              disabled={!canGoNextMonth}
              className={cn(
                "p-1 rounded-lg transition-colors",
                canGoNextMonth
                  ? "text-gray-400 hover:text-white hover:bg-[#252525] cursor-pointer"
                  : "text-gray-600 cursor-not-allowed opacity-40"
              )}
              aria-label="Next month"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          <div className="px-4 pb-3 pt-2 text-xs text-zinc-500">
            <div className="grid grid-cols-7 gap-1 mb-1">
              {["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"].map((d) => (
                <div key={d} className="h-7 flex items-center justify-center tracking-[0.08em]">
                  {d}
                </div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-1">
              {calendarCells.map((cell, idx) => {
                if (!cell) {
                  return <div key={idx} className="h-8" />;
                }

                const cellDate = new Date(cell);
                cellDate.setHours(0, 0, 0, 0);

                const selectedDate = value ? new Date(value + "T12:00:00") : null;
                if (selectedDate) {
                  selectedDate.setHours(0, 0, 0, 0);
                }

                const isSelected =
                  !!selectedDate && selectedDate.getTime() === cellDate.getTime();
                const isToday = cellDate.getTime() === today.getTime();
                const isPast = cellDate.getTime() < today.getTime();

                return (
                  <button
                    key={cell.toISOString()}
                    type="button"
                    onClick={() => !isPast && selectFromCalendar(cell)}
                    disabled={isPast}
                    aria-current={isToday ? "date" : undefined}
                    aria-selected={isSelected}
                    aria-label={cell.toLocaleDateString(undefined, {
                      weekday: "long",
                      month: "long",
                      day: "numeric",
                    })}
                    className={cn(
                      "h-8 w-8 flex items-center justify-center rounded-full text-xs transition-colors",
                      isPast && !isSelected
                        ? "text-gray-600 opacity-40 cursor-default"
                        : "cursor-pointer",
                      isSelected
                        ? "bg-primary-1 text-black"
                        : isToday
                          ? "border border-primary-1/60 text-white"
                          : "text-primary/90 hover:bg-[#333]"
                    )}
                  >
                    {cell.getDate()}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
