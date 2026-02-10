"use client";

import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { useActivities, usePackages } from "@/lib/api/hooks";
import { cn } from "@/lib/utils";
import { SLOTS, SHIFT, OPTIONS } from "./constants";
import type { RootState } from "@/store";
import {
  setDate,
  setTimeOfDay,
  setTimeSlot,
  incrementAdults,
  decrementAdults,
  incrementChildren,
  decrementChildren,
  addActivity,
  removeActivity,
  setActivityGameNo,
  addPackage,
  removePackage,
} from "@/store/bookingSlice";
import { Check, ChevronLeft, ChevronRight, Clock } from "lucide-react";

function getOrdinal(n: number) {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

function formatDialogDate(date: Date) {
  const day = date.getDate();
  const month = date.toLocaleString("en-US", { month: "long" });
  const year = date.getFullYear();
  const weekday = date.toLocaleString("en-US", { weekday: "long" });
  return `${weekday}, ${getOrdinal(day)} ${month} ${year}`;
}

export function Step1AvailabilitySelection() {
  const dispatch = useDispatch();
  const { date, timeOfDay, timeSlot, persons, selectedActivities, selectedPackages } =
    useSelector((state: RootState) => state.booking);

  const { data: activities = [] } = useActivities();
  const { data: packages = [] } = usePackages();
  const activityList = activities.slice(0, 10);
  const suggestedPackages = packages.slice(0, 4);

  const displayDate = React.useMemo(() => {
    if (date) {
      const d = new Date(date + "T12:00:00");
      if (!isNaN(d.getTime())) return d;
    }
    return new Date();
  }, [date]);

  const setDisplayDate = (delta: number) => {
    const d = new Date(displayDate);
    d.setDate(d.getDate() + delta);
    dispatch(setDate(d.toISOString().slice(0, 10)));
  };

  React.useEffect(() => {
    if (!date) {
      dispatch(setDate(new Date().toISOString().slice(0, 10)));
    }
  }, [date, dispatch]);

  const isActivitySelected = (id: number) => selectedActivities.some((i) => i.activity.id === id);
  const getActivityGameNo = (id: number) =>
    selectedActivities.find((i) => i.activity.id === id)?.gameNo ?? 1;
  const isPackageSelected = (id: number) => selectedPackages.some((p) => p.id === id);

  return (
    <div className="flex flex-1 min-h-0 overflow-hidden">
      {/* Left panel - Activity List (old design) */}
      <div className="w-full lg:w-[380px] shrink-0 border-r border-gray-800 flex flex-col bg-[#1a1a1a]">
        <div className="px-4 py-3 border-b border-gray-800">
          <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wide">
            Activity List
          </h3>
        </div>
        <div className="flex-1 overflow-y-auto p-3 space-y-3 scrollbar-dark">
          {activityList.map((activity) => {
            const selected = isActivitySelected(activity.id);
            const gameNo = getActivityGameNo(activity.id);
            return (
              <div key={activity.id} className="relative">
                <button
                  type="button"
                  onClick={() =>
                    selected
                      ? dispatch(removeActivity(activity.id))
                      : dispatch(addActivity({ activity, gameNo: 1 }))
                  }
                  className={cn(
                    "w-full text-left rounded-xl border transition-all overflow-hidden",
                    selected
                      ? "border-primary-1 bg-[#252525] ring-1 ring-primary-1/30"
                      : "border-gray-800 bg-[#222] hover:border-gray-700"
                  )}
                >
                  <div className="relative aspect-[2/1] sm:aspect-[3/1] overflow-hidden">
                    <img
                      src={activity.image || "https://picsum.photos/400/200"}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                    {selected && (
                      <div className="absolute top-2 right-2 w-7 h-7 rounded-full bg-primary-1 flex items-center justify-center">
                        <Check className="w-4 h-4 text-black" strokeWidth={3} />
                      </div>
                    )}
                  </div>
                  <div className="p-3">
                    <h4 className="font-semibold text-white truncate">{activity.title}</h4>
                    <p className="text-xs text-gray-400 mt-0.5 line-clamp-2">
                      {activity.timeSlots?.slice(0, 3).join(", ") || "6:00 am, 6:30 am, 7:00 am"}
                      {activity.timeSlots && activity.timeSlots.length > 3 ? ", ..." : ""}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {OPTIONS.map((opt, i) => (
                        <span key={opt.label}>
                          {opt.label} ${opt.price.toFixed(2)}
                          {i < OPTIONS.length - 1 ? ", " : ""}
                        </span>
                      ))}
                    </p>
                  </div>
                </button>
                {selected && (
                  <div className="flex gap-2 mt-2 px-1">
                    {OPTIONS.map((opt) => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          dispatch(setActivityGameNo({ activityId: activity.id, gameNo: opt.value }));
                        }}
                        className={cn(
                          "flex-1 py-2 rounded-lg text-sm font-medium border transition-colors",
                          gameNo === opt.value
                            ? "bg-primary-1 text-black border-primary-1"
                            : "bg-[#222] text-gray-400 border-gray-700 hover:border-gray-600"
                        )}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
          {suggestedPackages.length > 0 && (
            <>
              <p className="text-xs text-gray-500 font-medium mt-4 mb-2">Packages</p>
              {suggestedPackages.map((pkg) => {
                const selected = isPackageSelected(pkg.id);
                return (
                  <div
                    key={pkg.id}
                    className={cn(
                      "p-3 rounded-xl border transition-colors flex gap-2 items-center",
                      selected ? "border-primary-1 bg-primary-1/10" : "border-gray-800 bg-[#222]"
                    )}
                  >
                    <img src={pkg.image || ""} alt="" className="w-14 h-14 rounded-lg object-cover shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-white truncate">{pkg.title}</p>
                      <p className="text-xs text-gray-400">{pkg.price}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        selected ? dispatch(removePackage(pkg.id)) : dispatch(addPackage(pkg))
                      }
                      className={cn(
                        "shrink-0 px-2 py-1 rounded text-xs font-medium",
                        selected ? "bg-primary-1 text-black" : "border border-gray-700 text-gray-400"
                      )}
                    >
                      {selected ? "Selected" : "Add"}
                    </button>
                  </div>
                );
              })}
            </>
          )}
        </div>
      </div>

      {/* Right panel - Availability */}
      <div className="flex-1 flex flex-col min-w-0 bg-[#1a1a1a]">
        <div className="px-5 py-4 border-b border-gray-800 flex flex-col gap-4">
          <div className="flex items-center justify-end">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-primary-1/15 border border-primary-1/40">
              <Clock className="w-4 h-4 text-primary-1" />
              <span className="text-sm font-medium text-primary-1">Time Remaining 29:47</span>
            </div>
          </div>
          <div className="flex items-center justify-center gap-2">
            <button
              type="button"
              onClick={() => setDisplayDate(-1)}
              className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800"
              aria-label="Previous date"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <span className="text-sm font-medium text-white min-w-[220px] text-center">
              {formatDialogDate(displayDate)}
            </span>
            <button
              type="button"
              onClick={() => setDisplayDate(1)}
              className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800"
              aria-label="Next date"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
          <div className="flex gap-2">
            {SHIFT.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => dispatch(setTimeOfDay(tab.id as 1 | 2 | 3))}
                className={cn(
                  "flex-1 py-2 rounded-lg text-sm font-medium transition-colors",
                  timeOfDay === tab.id
                    ? "bg-primary-1 text-black"
                    : "bg-[#222] text-gray-400 border border-gray-700 hover:border-gray-600"
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-6 scrollbar-dark">
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-gray-300">Participants</h4>
            <div className="flex items-center justify-between p-3 rounded-xl bg-[#222] border border-gray-800">
              <div>
                <p className="text-sm font-medium text-white">Adult</p>
                <p className="text-xs text-gray-400">$12.00</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={persons.adults === 0}
                  onClick={() => dispatch(decrementAdults())}
                  className="w-9 h-9 rounded-lg border border-gray-600 text-white hover:bg-gray-800 disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center"
                >
                  −
                </button>
                <span className="text-lg font-semibold text-white min-w-8 text-center">
                  {persons.adults}
                </span>
                <button
                  type="button"
                  onClick={() => dispatch(incrementAdults())}
                  className="w-9 h-9 rounded-lg border border-gray-600 text-white hover:bg-gray-800 flex items-center justify-center"
                >
                  +
                </button>
              </div>
            </div>
            <div className="flex items-center justify-between p-3 rounded-xl bg-[#222] border border-gray-800">
              <div>
                <p className="text-sm font-medium text-white">Child</p>
                <p className="text-xs text-gray-400">$9.00</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={persons.children === 0}
                  onClick={() => dispatch(decrementChildren())}
                  className="w-9 h-9 rounded-lg border border-gray-600 text-white hover:bg-gray-800 disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center"
                >
                  −
                </button>
                <span className="text-lg font-semibold text-white min-w-8 text-center">
                  {persons.children}
                </span>
                <button
                  type="button"
                  onClick={() => dispatch(incrementChildren())}
                  className="w-9 h-9 rounded-lg border border-gray-600 text-white hover:bg-gray-800 flex items-center justify-center"
                >
                  +
                </button>
              </div>
            </div>
          </div>

          <div>
            <p className="text-[11px] text-gray-500 uppercase tracking-wide mb-2">
              SELECT START TIME · 34 sessions found
            </p>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
              {SLOTS.map((s) => (
                <button
                  key={s.t}
                  type="button"
                  onClick={() => dispatch(setTimeSlot(s.t))}
                  className={cn(
                    "relative py-2.5 px-2 rounded-lg border text-xs transition-colors flex flex-col items-center",
                    timeSlot === s.t
                      ? "bg-primary-1 text-black border-primary-1"
                      : "bg-[#222] text-gray-300 border-gray-700 hover:border-gray-600"
                  )}
                >
                  <span className="font-semibold">{s.t}</span>
                  <span className="text-[10px] opacity-80 mt-0.5">100 avail</span>
                  {"off" in s && s.off ? (
                    <span className="absolute top-0.5 right-0.5 bg-primary-1 text-black text-[9px] font-bold px-1 rounded">
                      $5 off
                    </span>
                  ) : null}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
