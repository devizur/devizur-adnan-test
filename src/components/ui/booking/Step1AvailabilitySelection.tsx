"use client";

import React from "react";
import { useAppDispatch, useAppSelector } from "@/store";
import { useActivities, usePackages, useAvailabilitySlots } from "@/lib/api/hooks";
import { cn } from "@/lib/utils";
import { SHIFT, OPTIONS } from "./constants";
import {
  setDate,
  setTimeOfDay,
  setTimeSlot,
  addActivity,
  removeActivity,
  setActivityGameNo,
  addPackage,
  removePackage,
} from "@/store/bookingSlice";
import { Check } from "lucide-react";
import { formatTimeForDisplay } from "@/lib/utils";
import { BookingCalendar, toLocalDateString } from "./BookingCalendar";
import { BookingGuests } from "./BookingGuests";
import { BookingTimelineBar } from "./BookingTimelineBar";

export function Step1AvailabilitySelection() {
  const dispatch = useAppDispatch();
  const shopId = useAppSelector((state) => state.shop.shopId);
  const { date, timeOfDay, timeSlot, selectedActivities, selectedPackages, persons } =
    useAppSelector((state) => state.booking);

  const { data: activities = [] } = useActivities();
  const { data: packages = [] } = usePackages();
  const activityList = activities.slice(0, 10);
  const suggestedPackages = packages.slice(0, 4);

  const slotsParams =
    date && (selectedActivities.length > 0 || selectedPackages.length > 0) && persons.adults + persons.children > 0
      ? {
          date,
          timeOfDay,
          activityIds: selectedActivities.map((a) => a.activity.id),
          packageIds: selectedPackages.map((p) => p.id),
          selectedBookableProducts: [
            ...selectedActivities.map((a) => ({
              id: (a.activity as { productId?: number }).productId ?? a.activity.id,
              attributeOptionId: a.gameNo,
            })),
            ...selectedPackages.map((p) => ({ id: p.id, attributeOptionId: 1 })),
          ],
          adults: persons.adults,
          children: persons.children,
          shopId,
        }
      : null;
  const { data: slotsData, isLoading: slotsLoading } = useAvailabilitySlots(slotsParams);
  const periodsWithSlots = slotsData?.periodsWithSlots ?? [];
  const slots = React.useMemo(() => {
    const ts = slotsData?.timeSlots;
    if (!ts) return [];
    const apiKey = SHIFT.find((t) => t.id === timeOfDay)?.apiKey ?? "Morning";
    const raw = ts[apiKey];
    if (!Array.isArray(raw) || raw.length === 0) return [];
    return raw.map((t) => ({
      startTime: formatTimeForDisplay(t),
      available: 1,
    }));
  }, [slotsData?.timeSlots, timeOfDay]);
  const visibleShifts = React.useMemo(
    () => SHIFT.filter((tab) => periodsWithSlots.includes(tab.apiKey)),
    [periodsWithSlots.join(",")]
  );

  const getAvailableOptions = (activity: { games?: (1 | 2 | 3)[] }) => {
    const allowedValues =
      activity.games && activity.games.length > 0
        ? activity.games
        : OPTIONS.map((o) => o.value as 1 | 2 | 3);
    return OPTIONS.filter((opt) => allowedValues.includes(opt.value as 1 | 2 | 3));
  };

  const getDefaultGameNo = (activity: { games?: (1 | 2 | 3)[] }): 1 | 2 | 3 => {
    const available = getAvailableOptions(activity);
    return (available[0]?.value ?? 1) as 1 | 2 | 3;
  };

  React.useEffect(() => {
    if (!date) {
      dispatch(setDate(toLocalDateString(new Date())));
    }
  }, [date, dispatch]);

  React.useEffect(() => {
    if (periodsWithSlots.length === 0) return;
    const validIds = SHIFT.filter((t) => periodsWithSlots.includes(t.apiKey)).map((t) => t.id);
    if (validIds.length > 0 && !validIds.includes(timeOfDay)) {
      dispatch(setTimeOfDay(validIds[0] as 1 | 2 | 3));
    }
  }, [periodsWithSlots.join(","), timeOfDay, dispatch]);

  const isActivitySelected = (id: number) => selectedActivities.some((i) => i.activity.id === id);
  const getActivityGameNo = (id: number) =>
    selectedActivities.find((i) => i.activity.id === id)?.gameNo ?? 1;
  const isPackageSelected = (id: number) => selectedPackages.some((p) => p.id === id);

  return (
    <div className="flex flex-1 min-h-0 overflow-hidden">
      {/* Left panel - Activity List */}
      <div className="w-full lg:w-[380px] shrink-0 border-r border-gray-800/80 flex flex-col bg-[#161616]">
        <div className="px-4 py-3.5 border-b border-gray-800/80">
          <h3 className="text-xs font-medium text-gray-400 uppercase tracking-wider">
            Choose activities
          </h3>
        </div>
        <div className="flex-1 overflow-y-auto p-3 space-y-3 scrollbar-dark">
          {activityList.map((activity) => {
            const selected = isActivitySelected(activity.id);
            const gameNo = getActivityGameNo(activity.id);
            return (
              <div key={activity.id} className="relative group">
                <button
                  type="button"
                  onClick={() =>
                    selected
                      ? dispatch(removeActivity(activity.id))
                      : dispatch(addActivity({ activity, gameNo: getDefaultGameNo(activity) }))
                  }
                  aria-pressed={selected}
                  aria-label={selected ? `Remove ${activity.title}` : `Select ${activity.title}`}
                  className={cn(
                    "w-full text-left rounded-2xl border transition-all duration-200 overflow-hidden cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-1/50 focus-visible:ring-offset-2 focus-visible:ring-offset-[#161616]",
                    selected
                      ? "border-primary-1/60 bg-primary-1/5 shadow-[0_0_0_1px_rgba(255,212,0,0.2)]"
                      : "border-gray-800 bg-[#1e1e1e] hover:bg-[#252525] hover:border-gray-700"
                  )}
                >
                  <div className="relative aspect-2/1 sm:aspect-3/1 overflow-hidden">
                    <img
                      src={activity.image || "https://picsum.photos/400/200"}
                      alt=""
                      className={cn(
                        "w-full h-full object-cover transition-transform duration-200",
                        selected ? "brightness-110" : "group-hover:scale-[1.02]"
                      )}
                    />
                    {selected && (
                      <div className="absolute top-2.5 right-2.5 w-8 h-8 rounded-full bg-primary-1 flex items-center justify-center shadow-lg">
                        <Check className="w-4 h-4 text-secondary" strokeWidth={2.5} />
                      </div>
                    )}
                  </div>
                  <div className="p-3">
                    <h4 className="font-medium text-white truncate">{activity.title}</h4>
                    <p className="text-xs text-gray-400 mt-1 line-clamp-2">
                      {activity.timeSlots?.slice(0, 3).join(", ") || "6:00 am, 6:30 am, 7:00 am"}
                      {activity.timeSlots && activity.timeSlots.length > 3 ? ", ..." : ""}
                    </p>
                  </div>
                </button>
                {selected && (
                  <div className="flex gap-1.5 mt-2 px-0.5">
                    {getAvailableOptions(activity).map((opt) => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          dispatch(setActivityGameNo({ activityId: activity.id, gameNo: opt.value }));
                        }}
                        aria-pressed={gameNo === opt.value}
                        aria-label={`${opt.label} $${opt.price.toFixed(2)} for ${activity.title}`}
                        className={cn(
                          "flex-1 min-h-10 py-2 rounded-xl text-[12px] font-medium transition-all duration-150 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-1/50 focus-visible:ring-offset-2 focus-visible:ring-offset-[#161616]",
                          gameNo === opt.value
                            ? "bg-primary-1 text-secondary"
                            : "bg-[#1e1e1e] text-gray-400 hover:text-gray-300 hover:bg-[#252525] border border-gray-800"
                        )}
                      >
                        <span className=" ">{opt.label}</span>
                        <span className="  opacity-80">/</span>
                        <span className=" text-[10px] opacity-80">${opt.price.toFixed(2)}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        
          {suggestedPackages.length > 0 && (
            <>
              <p className="text-[11px] text-gray-500 font-medium mt-5 mb-2 uppercase tracking-wider">Packages</p>
              {suggestedPackages.map((pkg) => {
                const selected = isPackageSelected(pkg.id);
                return (
                  <div key={pkg.id} className="relative group">
                    <button
                      type="button"
                      onClick={() =>
                        selected ? dispatch(removePackage(pkg.id)) : dispatch(addPackage(pkg))
                      }
                      aria-pressed={selected}
                      aria-label={selected ? `Remove ${pkg.title} from booking` : `Select ${pkg.title}`}
                      className={cn(
                        "w-full text-left rounded-2xl border transition-all duration-200 overflow-hidden cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-1/50 focus-visible:ring-offset-2 focus-visible:ring-offset-[#161616]",
                        selected
                          ? "border-primary-1/60 bg-primary-1/5 shadow-[0_0_0_1px_rgba(255,212,0,0.2)]"
                          : "border-gray-800 bg-[#1e1e1e] hover:bg-[#252525] hover:border-gray-700"
                      )}
                    >
                      <div className="relative aspect-2/1 sm:aspect-3/1 overflow-hidden">
                        <img
                          src={pkg.image || "https://picsum.photos/400/200"}
                          alt=""
                          className={cn(
                            "w-full h-full object-cover transition-transform duration-200",
                            selected ? "brightness-110" : "group-hover:scale-[1.02]"
                          )}
                        />
                        {selected && (
                          <div className="absolute top-2.5 right-2.5 w-8 h-8 rounded-full bg-primary-1 flex items-center justify-center shadow-lg">
                            <Check className="w-4 h-4 text-secondary" strokeWidth={2.5} />
                          </div>
                        )}
                      </div>
                      <div className="p-3">
                        <h4 className="font-medium text-white truncate">{pkg.title}</h4>
                        <p className="text-xs text-gray-400 mt-1">{pkg.price}</p>
                      </div>
                    </button>
                  </div>
                );
              })}
            </>
          )}
        </div>
      </div>

      {/* Right panel - Date, time & availability */}
      <div className="flex-1 flex flex-col min-w-0 bg-[#161616]">
        <div className="px-5 py-4 border-b border-gray-800/80 flex flex-col gap-4">
          <BookingGuests />

          <BookingCalendar
            value={date ?? ""}
            onChange={(d) => dispatch(setDate(d))}
          />

          <BookingTimelineBar
            bookingId={slotsData?.bookingId}
            timeSlot={timeSlot}
            selectedDate={date ?? undefined}
            selectedActivities={selectedActivities}
            selectedPackages={selectedPackages}
          />

          <div className="flex gap-2" role="tablist" aria-label="Time of day">
            {visibleShifts.map((tab) => (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={timeOfDay === tab.id}
                aria-label={`${tab.apiKey} sessions`}
                onClick={() => dispatch(setTimeOfDay(tab.id as 1 | 2 | 3))}
                className={cn(
                  "flex-1 min-h-11 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-1/50 focus-visible:ring-offset-2 focus-visible:ring-offset-[#161616]",
                  timeOfDay === tab.id
                    ? "bg-primary-1 text-secondary"
                    : "bg-[#1e1e1e] text-gray-400 border border-gray-800 hover:border-gray-700 hover:text-gray-300"
                )}
              >
                {tab.apiKey}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5 scrollbar-dark">
          <div>
            <p className="text-[11px] text-gray-500 uppercase tracking-wider mb-3">
              {!slotsParams
                ? "Start time · Select date, time of day, at least one activity or package, and guests"
                : slotsLoading
                  ? "Start time · Loading…"
                  : `Start time · ${slots.length} slot${slots.length !== 1 ? "s" : ""} available`
            }
            </p>
            {slotsParams && (
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2" role="group" aria-label="Select start time">
                {slotsLoading ? (
                  <div className="col-span-full py-8 flex flex-col items-center justify-center gap-3 text-gray-400 text-sm">
                    <div className="w-8 h-8 border-2 border-primary-1/40 border-t-primary-1 rounded-full animate-spin" />
                    <span>Loading available times…</span>
                  </div>
                ) : (
                  slots.map((s) => (
                    <button
                      key={s.startTime}
                      type="button"
                      disabled={s.available <= 0}
                      onClick={() => dispatch(setTimeSlot(s.startTime))}
                      aria-pressed={timeSlot === s.startTime}
                     
                      className={cn(
                        "relative min-h-18 py-3 px-2 rounded-xl border text-xs transition-all duration-150 flex flex-col items-center justify-center gap-0.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-1/50 focus-visible:ring-offset-2 focus-visible:ring-offset-[#161616]",
                        s.available <= 0 && "opacity-50 cursor-not-allowed",
                        timeSlot === s.startTime
                          ? "bg-primary-1 text-secondary border-primary-1 shadow-md cursor-pointer"
                          : s.available > 0
                            ? "bg-[#1e1e1e] text-gray-300 border-gray-800 hover:bg-[#252525] hover:border-gray-700 cursor-pointer"
                            : "bg-[#1e1e1e] text-gray-500 border-gray-800"
                      )}
                    >
                      <span className="font-semibold text-sm">{s.startTime}</span>
                      <span className="text-xs opacity-70">{s.available} available</span>
                      
                    </button>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
