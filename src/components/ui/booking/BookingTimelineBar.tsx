"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { useGenerateBookingItemSteps } from "@/lib/api/hooks";
import { displayTimeToApiSlot } from "@/lib/utils";
import type { Activity, Package } from "@/lib/api/types";

/** Parse duration string like "60 mins" to minutes. */
function parseDurationMins(value: string): number {
  const s = String(value || "").toLowerCase().trim();
  const num = parseFloat(s.replace(/[^0-9.]/g, ""));
  if (Number.isNaN(num)) return 30;
  if (s.includes("hour") || s.includes("hr")) return Math.round(num * 60);
  return Math.round(num);
}

/** Parse "HH:mm" offset to minutes (e.g. "00:43" → 43, "03:16" → 196). */
function parseHhMmToMinutes(s: string): number {
  const parts = String(s || "00:00").trim().split(":");
  const h = parseInt(parts[0], 10) || 0;
  const m = parseInt(parts[1], 10) || 0;
  return h * 60 + m;
}

/** Parse display time like "9:00 am" to minutes since midnight. */
function parseDisplayTimeToMinutes(t: string): number {
  const s = String(t || "").trim().toLowerCase();
  const m12 = s.match(/^(\d{1,2})(?::(\d{2}))?\s*(am|pm)$/);
  if (!m12) return 9 * 60;
  let h = parseInt(m12[1], 10) || 0;
  const mins = parseInt(m12[2], 10) || 0;
  const isPm = m12[3] === "pm";
  if (isPm && h !== 12) h += 12;
  if (!isPm && h === 12) h = 0;
  return h * 60 + mins;
}

/** Format minutes since midnight to display time like "9:00 AM". */
function formatMinutesToTime(m: number): string {
  const h = Math.floor(m / 60) % 24;
  const min = m % 60;
  if (h === 0) return `12:${String(min).padStart(2, "0")} AM`;
  if (h === 12) return `12:${String(min).padStart(2, "0")} PM`;
  if (h < 12) return `${h}:${String(min).padStart(2, "0")} AM`;
  return `${h - 12}:${String(min).padStart(2, "0")} PM`;
}

const SEGMENT_COLORS = [
  { bg: "bg-[#e85d3c]", text: "text-[#e85d3c]" },
  { bg: "bg-[#3b82f6]", text: "text-[#3b82f6]" },
  { bg: "bg-[#22c55e]", text: "text-[#22c55e]" },
  { bg: "bg-[#f97316]", text: "text-[#f97316]" },
  { bg: "bg-[#a855f7]", text: "text-[#a855f7]" },
  { bg: "bg-[#ec4899]", text: "text-[#ec4899]" },
];

export interface BookingTimelineBarProps {
  /** Booking ID from retrieveTimeSlots (optional – API called with "" if missing) */
  bookingId: string | undefined;
  /** Display time slot e.g. "9:00 am" */
  timeSlot: string;
  /** Selected date YYYY-MM-DD (from BookingCalendar) */
  selectedDate: string | undefined;
  /** Fallback: build segments from selected items when API returns no data */
  selectedActivities?: { activity: Activity; gameNo: number }[];
  selectedPackages?: Package[];
  className?: string;
}

export function BookingTimelineBar({
  bookingId,
  timeSlot,
  selectedDate,
  selectedActivities = [],
  selectedPackages = [],
  className,
}: BookingTimelineBarProps) {
  const effectiveTimeSlot = timeSlot || "9:00 am";
  const selectedSlotApi = displayTimeToApiSlot(effectiveTimeSlot);

  const { data: steps = [], isLoading } = useGenerateBookingItemSteps(
    bookingId ?? "",
    selectedSlotApi,
    selectedDate
  );

  const fallbackSegments = React.useMemo(() => {
    const items: { name: string; durationMins: number }[] = [];
    for (const { activity } of selectedActivities) {
      items.push({
        name: activity.productName || activity.title,
        durationMins: parseDurationMins(activity.duration || "60 mins"),
      });
    }
    for (const pkg of selectedPackages) {
      items.push({
        name: pkg.productName || pkg.title,
        durationMins: parseDurationMins(pkg.duration || "60 mins"),
      });
    }
    return items;
  }, [selectedActivities, selectedPackages]);

  const { startMinutes, totalMins, segments } = React.useMemo(() => {
    const start = parseDisplayTimeToMinutes(effectiveTimeSlot);
    if (steps.length > 0) {
      const lastEnd = parseHhMmToMinutes(steps[steps.length - 1]!.endingTime);
      const segs = steps.map((s) => ({
        name: s.itemName,
        durationMins: parseHhMmToMinutes(s.endingTime) - parseHhMmToMinutes(s.startingTime),
      }));
      return { startMinutes: start, totalMins: lastEnd, segments: segs };
    }
    if (fallbackSegments.length > 0) {
      const total = fallbackSegments.reduce((a, s) => a + s.durationMins, 0);
      return { startMinutes: start, totalMins: total, segments: fallbackSegments };
    }
    return { startMinutes: start, totalMins: 60, segments: [] };
  }, [steps, fallbackSegments, effectiveTimeSlot]);

  const timeMarkers = React.useMemo(() => {
    const markers: number[] = [];
    const interval = 30;
    const end = startMinutes + totalMins;
    let t = Math.floor(startMinutes / interval) * interval;
    while (t <= end) {
      markers.push(t);
      t += interval;
    }
    if (markers.length === 0) markers.push(startMinutes, end);
    return markers;
  }, [startMinutes, totalMins]);

  const hasSegments = segments.length > 0;
  const canShow = selectedDate && hasSegments;

  if (!canShow) return null;

  if (isLoading && !hasSegments) {
    return (
      <div className={cn("rounded-xl bg-[#1e1e1e] border border-gray-800 p-4", className)}>
        <div className="flex items-center justify-center gap-2 py-6 text-gray-400 text-sm">
          <div className="w-4 h-4 border-2 border-primary-1/40 border-t-primary-1 rounded-full animate-spin" />
          Loading timeline…
        </div>
      </div>
    );
  }

  return (
    <div className={cn("rounded-xl bg-[#1e1e1e] border border-gray-800 p-4", className)}>
      {/* Top row: Start | time markers | Finish */}
      <div className="relative flex items-start gap-2 mb-1">
        <span className="text-[11px] text-gray-400 uppercase tracking-wider shrink-0">Start</span>
        <div className="flex-1 relative min-h-[20px]">
          {timeMarkers.map((m) => {
            const pct = totalMins > 0 ? ((m - startMinutes) / totalMins) * 100 : 0;
            const clamped = Math.max(0, Math.min(100, pct));
            return (
              <div
                key={m}
                className="absolute top-0 flex flex-col items-center"
                style={{ left: `${clamped}%`, transform: "translateX(-50%)" }}
              >
                <div className="w-px h-2.5 bg-gray-600" />
                <span className="text-[10px] text-gray-400 mt-0.5 whitespace-nowrap">
                  {formatMinutesToTime(m)}
                </span>
              </div>
            );
          })}
        </div>
        <span className="text-[11px] text-primary-1 uppercase tracking-wider shrink-0">Finish</span>
      </div>
      {/* Activity bar */}
      <div className="flex h-8 rounded-lg overflow-hidden border border-gray-700/50">
        {segments.map((seg, idx) => {
          const pct = totalMins > 0 ? (seg.durationMins / totalMins) * 100 : 0;
          const color = SEGMENT_COLORS[idx % SEGMENT_COLORS.length];
          const isFirst = idx === 0;
          const isLast = idx === segments.length - 1;
          return (
            <div
              key={`${seg.name}-${idx}`}
              className={cn(
                color.bg,
                isFirst && "rounded-l-md",
                isLast && "rounded-r-md"
              )}
              style={{ flex: `0 0 ${pct}%` }}
              title={`${seg.name} (${seg.durationMins} mins)`}
            />
          );
        })}
      </div>
      {/* Activity labels */}
      <div className="flex mt-1.5 overflow-hidden">
        {segments.map((seg, idx) => {
          const pct = totalMins > 0 ? (seg.durationMins / totalMins) * 100 : 0;
          const color = SEGMENT_COLORS[idx % SEGMENT_COLORS.length];
          return (
            <div
              key={`${seg.name}-${idx}`}
              className={cn("text-[11px] font-medium truncate", color.text)}
              style={{ flex: `0 0 ${pct}%`, minWidth: 0 }}
              title={seg.name}
            >
              {seg.name}
            </div>
          );
        })}
      </div>
    </div>
  );
}
