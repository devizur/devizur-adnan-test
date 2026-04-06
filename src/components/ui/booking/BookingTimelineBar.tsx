"use client";

import React from "react";
import { Clock } from "lucide-react";
import { cn, displayTimeToApiSlot } from "@/lib/utils";
import { useGenerateBookingItemSteps } from "@/lib/api/hooks";
import { useAppDispatch } from "@/store";
import { setBookingReferenceId } from "@/store/bookingSlice";
import type { Activity, Package } from "@/lib/api/types";

/** Parse duration string like "60 mins" to minutes. */
function parseDurationMins(value: string): number {
  const s = String(value || "").toLowerCase().trim();
  const num = parseFloat(s.replace(/[^0-9.]/g, ""));
  if (Number.isNaN(num)) return 30;
  if (s.includes("hour") || s.includes("hr")) return Math.round(num * 60);
  return Math.round(num);
}

/** Parse various time formats into minutes since midnight without timezone conversion. */
function parseTimeToMinutes(raw: string): number {
  const s = String(raw || "").trim().toLowerCase();
  if (!s) return 0;

  // "9:00 am", "12:30 pm"
  const m12 = s.match(/^(\d{1,2})(?::(\d{2}))?\s*(am|pm)$/);
  if (m12) {
    let h = parseInt(m12[1], 10) || 0;
    const mins = parseInt(m12[2], 10) || 0;
    const isPm = m12[3] === "pm";
    if (isPm && h !== 12) h += 12;
    if (!isPm && h === 12) h = 0;
    return h * 60 + mins;
  }

  // "HH:mm" or "HH:mm:ss"
  const m24 = s.match(/^(\d{1,2}):(\d{2})(?::\d{2})?$/);
  if (m24) {
    const h = parseInt(m24[1], 10) || 0;
    const mins = parseInt(m24[2], 10) || 0;
    return h * 60 + mins;
  }

  // ISO-like strings: "2026-04-06T12:30:00"
  const isoLike = s.match(/t(\d{2}):(\d{2})/);
  if (isoLike) {
    const h = parseInt(isoLike[1], 10) || 0;
    const mins = parseInt(isoLike[2], 10) || 0;
    return h * 60 + mins;
  }

  return 0;
}

/** Parse display time like "9:00 am" to minutes since midnight. */
function parseDisplayTimeToMinutes(t: string): number {
  const parsed = parseTimeToMinutes(t);
  return parsed > 0 ? parsed : 9 * 60;
}

/** Format minutes since midnight to display time like "4:58pm". */
function formatMinutesToTime(m: number): string {
  const safe = ((m % (24 * 60)) + 24 * 60) % (24 * 60);
  const h24 = Math.floor(safe / 60);
  const min = safe % 60;
  const suffix = h24 >= 12 ? "pm" : "am";
  const h12 = h24 % 12 === 0 ? 12 : h24 % 12;
  return `${h12}:${String(min).padStart(2, "0")}${suffix}`;
}

function formatTotalDuration(mins: number): string {
  if (mins <= 0) return "—";
  const h = Math.floor(mins / 60);
  const m = Math.round(mins % 60);
  if (h === 0) return `${m} min`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}

/** Saturated blocks that stay readable on dark backgrounds */
const SEGMENT_COLORS = [
  { bg: "from-amber-500/95 to-orange-600/90", text: "text-amber-300", dot: "bg-amber-400" },
  { bg: "from-sky-500/95 to-blue-600/90", text: "text-sky-300", dot: "bg-sky-400" },
  { bg: "from-emerald-500/95 to-teal-600/90", text: "text-emerald-300", dot: "bg-emerald-400" },
  { bg: "from-violet-500/95 to-purple-600/90", text: "text-violet-300", dot: "bg-violet-400" },
  { bg: "from-rose-500/95 to-pink-600/90", text: "text-rose-300", dot: "bg-rose-400" },
  { bg: "from-cyan-500/95 to-cyan-600/90", text: "text-cyan-300", dot: "bg-cyan-400" },
];

export interface BookingTimelineBarProps {
  /** Booking reference from retrieveTimeSlots (optional – API called with "" if missing) */
  bookingReferenceId: string | undefined;
  /** Must be true before generateBookingItemSteps is called (i.e. retrieveTimeSlots has returned) */
  slotsResponseReceived?: boolean;
  /** Display time slot e.g. "9:00 am" */
  timeSlot: string;
  /** Selected date YYYY-MM-DD (from BookingCalendar) */
  selectedDate: string | undefined;
  /** Fallback: build segments from selected items when API returns no data */
  selectedActivities?: { activity: Activity; gameNo: number }[];
  selectedPackages?: Package[];
  className?: string;
}

const endpointLabelClass =
  "w-[3.4rem] shrink-0 text-center text-[8px] font-semibold tracking-[0.08em] text-zinc-500 sm:w-[3.6rem]";

export function BookingTimelineBar({
  bookingReferenceId,
  timeSlot,
  selectedDate,
  slotsResponseReceived = false,
  selectedActivities = [],
  selectedPackages = [],
  className,
}: BookingTimelineBarProps) {
  const dispatch = useAppDispatch();
  const effectiveTimeSlot = timeSlot || "9:00 am";
  const selectedSlotApi = displayTimeToApiSlot(effectiveTimeSlot);

  const { data, isLoading } = useGenerateBookingItemSteps(
    bookingReferenceId ?? "",
    selectedSlotApi,
    selectedDate,
    slotsResponseReceived
  );
  const steps = data?.steps ?? [];

  React.useEffect(() => {
    if (data?.bookingReferenceId) dispatch(setBookingReferenceId(data.bookingReferenceId));
  }, [data?.bookingReferenceId, dispatch]);

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
      const firstStart = parseTimeToMinutes(steps[0]!.startingTime);
      const lastEnd = parseTimeToMinutes(steps[steps.length - 1]!.endingTime);
      const total = Math.max(1, lastEnd - firstStart);
      const segs = steps.map((s) => ({
        name: s.itemName,
        durationMins: Math.max(1, parseTimeToMinutes(s.endingTime) - parseTimeToMinutes(s.startingTime)),
        durationLabel: s.itemDuration || `${Math.max(1, parseTimeToMinutes(s.endingTime) - parseTimeToMinutes(s.startingTime))} mins`,
      }));
      return { startMinutes: firstStart, totalMins: total, segments: segs };
    }
    if (slotsResponseReceived && fallbackSegments.length > 0) {
      const total = fallbackSegments.reduce((a, s) => a + s.durationMins, 0);
      return {
        startMinutes: start,
        totalMins: total,
        segments: fallbackSegments.map((s) => ({
          ...s,
          durationLabel: `${s.durationMins} mins`,
        })),
      };
    }
    return { startMinutes: start, totalMins: 60, segments: [] };
  }, [steps, fallbackSegments, effectiveTimeSlot, slotsResponseReceived]);

  const timeMarkers = React.useMemo(() => {
    const markerSet = new Set<number>();
    const interval = 60;
    const end = startMinutes + totalMins;

    markerSet.add(startMinutes);
    markerSet.add(end);

    let t = Math.ceil(startMinutes / interval) * interval;
    while (t < end) {
      markerSet.add(t);
      t += interval;
    }

    return Array.from(markerSet).sort((a, b) => a - b);
  }, [startMinutes, totalMins]);

  const hasSegments = segments.length > 0;
  const isFetching = slotsResponseReceived && !!selectedDate && !!effectiveTimeSlot;
  const canShowContent = selectedDate && hasSegments;

  if (!selectedDate) return null;

  const shellBase =
    "min-w-0 overflow-hidden shadow-sm shadow-black/20 ring-1 ring-white/5";

  const StatusCard: React.FC<{
    children: React.ReactNode;
    alignCenter?: boolean;
    showSpinner?: boolean;
  }> = ({ children, alignCenter = true, showSpinner = false }) => (
    <div className={cn(shellBase, className)}>
      <div
        className={cn(
          "px-2.5 py-2 text-[9px] leading-tight text-zinc-500 sm:px-3",
          alignCenter ? "flex items-center justify-center gap-1.5" : "flex flex-col items-center justify-center gap-1"
        )}
      >
        {showSpinner && (
          <div className="size-3 shrink-0 rounded-full border-2 border-primary-1/30 border-t-primary-1 animate-spin" />
        )}
        {children}
      </div>
    </div>
  );

  const LoadingState = () => (
    <div className={cn(shellBase, "px-2.5 py-2 sm:px-3", className)}>
      <div className="mb-1.5 flex min-w-0 items-center justify-between gap-2">
        <span className="text-[9px] font-semibold uppercase tracking-[0.14em] text-zinc-500">
          Schedule
        </span>
        <div className="h-6 w-16 shrink-0 animate-pulse rounded-full bg-zinc-700/40" aria-hidden />
      </div>
      <div className="relative mb-1 flex min-w-0 items-start gap-1.5">
        <span className={cn(endpointLabelClass, "pt-0.5 text-left text-zinc-400")}>
          {formatMinutesToTime(startMinutes)}
        </span>
        <div
          className="min-h-[18px] flex-1 rounded-md bg-zinc-800/50 ring-1 ring-white/6 animate-pulse"
          aria-hidden
        />
        <span className={cn(endpointLabelClass, "pt-0.5 text-right text-primary-1/40")}>
          {formatMinutesToTime(startMinutes + totalMins)}
        </span>
      </div>
      <div className="flex h-4 gap-px overflow-hidden rounded-md border border-white/10 bg-zinc-950/90 p-px min-w-0">
        <div className="min-w-0 flex-[3] rounded-sm bg-zinc-700/50 animate-pulse" />
        <div className="min-w-0 flex-[2] rounded-sm bg-zinc-700/40 animate-pulse" />
        <div className="min-w-0 flex-[2] rounded-sm bg-zinc-700/50 animate-pulse" />
      </div>
      <div className="mt-1.5 flex min-h-[14px] items-center overflow-hidden min-w-0">
        <div className="min-w-0 flex-[3] pr-0.5">
          <div className="h-2.5 max-w-[92%] rounded-sm bg-zinc-700/35 animate-pulse" />
        </div>
        <div className="min-w-0 flex-[2] px-0.5">
          <div className="h-2.5 max-w-[92%] rounded-sm bg-zinc-700/28 animate-pulse" />
        </div>
        <div className="min-w-0 flex-[2] pl-0.5">
          <div className="h-2.5 max-w-[92%] rounded-sm bg-zinc-700/35 animate-pulse" />
        </div>
      </div>
    </div>
  );

  const EmptyState = () => (
    <StatusCard alignCenter={false}>
      <span className="text-xs font-medium text-zinc-400">No schedule data</span>
      <span className="max-w-[18rem] text-center text-[10px] leading-snug text-zinc-600">
        Pick a time slot or try checking availability again.
      </span>
    </StatusCard>
  );

  const initHint =
    "Select activities, guests, and a start time to preview your day.";

  const InitState = () => (
    <div className={cn(shellBase, className)}>
      <div
        className="flex min-w-0 items-center justify-center gap-1.5 px-2.5 py-2 sm:px-3"
        role="status"
      >
        <Clock className="size-3.5 shrink-0 text-zinc-600" aria-hidden />
        <span
          className="min-w-0 truncate text-[10px] font-normal leading-none text-zinc-400 sm:text-[11px]"
          title={initHint}
        >
          {initHint}
        </span>
      </div>
    </div>
  );

  if (isLoading && isFetching) return <LoadingState />;
  if (!canShowContent) return isFetching ? <EmptyState /> : <InitState />;

  const scheduleSummary = segments
    .map((s) => `${s.name} (${s.durationMins} min)`)
    .join("; ");

  return (
    <div className={cn(shellBase, "px-2.5 py-2 sm:px-3", className)}>
      <div className="mb-1.5 flex min-w-0 items-center justify-between gap-2">
        <span className="text-[9px] font-semibold uppercase tracking-[0.14em] text-zinc-500">
          Schedule
        </span>
        <span className="inline-flex shrink-0 items-center gap-1 rounded-full border border-white/8 bg-zinc-900/80 px-2 py-0.5 text-[9px] font-medium tabular-nums text-zinc-400">
          <Clock className="size-2.5 text-zinc-500" aria-hidden />
          {formatTotalDuration(totalMins)}
        </span>
      </div>

      <div className="relative mb-1 flex min-w-0 items-start gap-1.5">
        <span className={cn(endpointLabelClass, "pt-0.5 text-left text-zinc-400")}>
          {formatMinutesToTime(startMinutes)}
        </span>
        <div className="relative min-h-[18px] flex-1 min-w-0">
          {timeMarkers.map((m) => {
            const pct = totalMins > 0 ? ((m - startMinutes) / totalMins) * 100 : 0;
            const clamped = Math.max(0, Math.min(100, pct));
            return (
              <div
                key={m}
                className="absolute top-0 flex flex-col items-center"
                style={{ left: `${clamped}%`, transform: "translateX(-50%)" }}
              >
                <div className="h-2 w-px rounded-full bg-zinc-500" />
                <span className="mt-0.5 whitespace-nowrap text-[8px] font-medium tabular-nums leading-none text-zinc-500">
                  {formatMinutesToTime(m)}
                </span>
              </div>
            );
          })}
        </div>
        <span className={cn(endpointLabelClass, "pt-0.5 text-right text-primary-1")}>
          {formatMinutesToTime(startMinutes + totalMins)}
        </span>
      </div>

      <div
        className="flex h-4 gap-px overflow-hidden rounded-md border border-white/10 bg-zinc-950/90 p-px shadow-inner shadow-black/50 min-w-0"
        role="img"
        aria-label={`Booking schedule, ${formatTotalDuration(totalMins)} total. ${scheduleSummary}`}
      >
        {segments.map((seg, idx) => {
          const pct = totalMins > 0 ? (seg.durationMins / totalMins) * 100 : 0;
          const color = SEGMENT_COLORS[idx % SEGMENT_COLORS.length];
          const isFirst = idx === 0;
          const isLast = idx === segments.length - 1;
          const widthPct = Math.max(0, pct);
          const minPx = widthPct > 0 && widthPct < 6 ? 6 : 0;
          return (
            <div
              key={`${seg.name}-${idx}`}
              className={cn(
                "relative min-w-0 bg-linear-to-b shadow-sm ring-1 ring-black/25",
                color.bg,
                isFirst && "rounded-l-[5px]",
                isLast && "rounded-r-[5px]"
              )}
              style={{
                flex: `0 0 ${widthPct}%`,
                minWidth: minPx || undefined,
              }}
              title={`${seg.name} — ${seg.durationMins} min`}
            >
              <span
                className="pointer-events-none absolute inset-0 flex items-center justify-center px-1 text-[8px] font-semibold leading-none text-white/90"
                title={seg.durationLabel}
              >
                <span className="truncate">{seg.durationLabel}</span>
              </span>
            </div>
          );
        })}
      </div>

      <div className="mt-1.5 flex min-h-[14px] overflow-hidden min-w-0 leading-snug">
        {segments.map((seg, idx) => {
          const pct = totalMins > 0 ? (seg.durationMins / totalMins) * 100 : 0;
          const color = SEGMENT_COLORS[idx % SEGMENT_COLORS.length];
          const widthPct = Math.max(0, pct);
          const minPx = widthPct > 0 && widthPct < 6 ? 6 : 0;
          return (
            <div
              key={`${seg.name}-${idx}-label`}
              className="min-w-0 flex items-start gap-0.5 px-0.5"
              style={{
                flex: `0 0 ${widthPct}%`,
                minWidth: minPx || undefined,
              }}
            >
              <span
                className={cn("mt-0.5 size-1 shrink-0 rounded-full", color.dot)}
                aria-hidden
              />
              <span
                className={cn(
                  "min-w-0 truncate text-[9px] font-medium sm:text-[10px]",
                  color.text
                )}
                title={`${seg.name} (${seg.durationMins} min)`}
              >
                {seg.name}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
