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
  addActivity,
  removeActivity,
  setActivityGameNo,
  addPackage,
  removePackage,
} from "@/store/bookingSlice";
import { Check } from "lucide-react";
import { BookingCalendar, toLocalDateString } from "./BookingCalendar";
import { BookingGuests } from "./BookingGuests";

export function Step1AvailabilitySelection() {
  const dispatch = useDispatch();
  const { date, timeOfDay, timeSlot, selectedActivities, selectedPackages } =
    useSelector((state: RootState) => state.booking);

  const { data: activities = [] } = useActivities();
  const { data: packages = [] } = usePackages();
  const activityList = activities.slice(0, 10);
  const suggestedPackages = packages.slice(0, 4);

  React.useEffect(() => {
    if (!date) {
      dispatch(setDate(toLocalDateString(new Date())));
    }
  }, [date, dispatch]);

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
                      : dispatch(addActivity({ activity, gameNo: 1 }))
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
                        <Check className="w-4 h-4 text-black" strokeWidth={2.5} />
                      </div>
                    )}
                  </div>
                  <div className="p-3">
                    <h4 className="font-medium text-white truncate">{activity.title}</h4>
                    <p className="text-xs text-gray-400 mt-1 line-clamp-2">
                      {activity.timeSlots?.slice(0, 3).join(", ") || "6:00 am, 6:30 am, 7:00 am"}
                      {activity.timeSlots && activity.timeSlots.length > 3 ? ", ..." : ""}
                    </p>
                    <p className="text-[11px] text-gray-500 mt-1.5">
                      {OPTIONS.map((opt, i) => (
                        <span key={opt.label}>
                          {opt.label} ${opt.price.toFixed(2)}
                          {i < OPTIONS.length - 1 ? " · " : ""}
                        </span>
                      ))}
                    </p>
                  </div>
                </button>
                {selected && (
                  <div className="flex gap-1.5 mt-2 px-0.5">
                    {OPTIONS.map((opt) => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          dispatch(setActivityGameNo({ activityId: activity.id, gameNo: opt.value }));
                        }}
                        aria-pressed={gameNo === opt.value}
                        aria-label={`${opt.label} for ${activity.title}`}
                        className={cn(
                          "flex-1 min-h-10 py-2 rounded-xl text-sm font-medium transition-all duration-150 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-1/50 focus-visible:ring-offset-2 focus-visible:ring-offset-[#161616]",
                          gameNo === opt.value
                            ? "bg-primary-1 text-black"
                            : "bg-[#1e1e1e] text-gray-400 hover:text-gray-300 hover:bg-[#252525] border border-gray-800"
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
                            <Check className="w-4 h-4 text-black" strokeWidth={2.5} />
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

          <div className="flex gap-2" role="tablist" aria-label="Time of day">
            {SHIFT.map((tab) => (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={timeOfDay === tab.id}
                aria-label={`${tab.label} sessions`}
                onClick={() => dispatch(setTimeOfDay(tab.id as 1 | 2 | 3))}
                className={cn(
                  "flex-1 min-h-11 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-1/50 focus-visible:ring-offset-2 focus-visible:ring-offset-[#161616]",
                  timeOfDay === tab.id
                    ? "bg-primary-1 text-black"
                    : "bg-[#1e1e1e] text-gray-400 border border-gray-800 hover:border-gray-700 hover:text-gray-300"
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5 scrollbar-dark">
          <div>
            <p className="text-[11px] text-gray-500 uppercase tracking-wider mb-3">
              Start time · 34 available
            </p>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2" role="group" aria-label="Select start time">
              {SLOTS.map((s) => (
                <button
                  key={s.t}
                  type="button"
                  onClick={() => dispatch(setTimeSlot(s.t))}
                  aria-pressed={timeSlot === s.t}
                  aria-label={`Select ${s.t}, 100 available${"off" in s && s.off ? ", $5 off" : ""}`}
                  className={cn(
                    "relative min-h-[4.5rem] py-3 px-2 rounded-xl border text-xs transition-all duration-150 flex flex-col items-center justify-center gap-0.5 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-1/50 focus-visible:ring-offset-2 focus-visible:ring-offset-[#161616]",
                    timeSlot === s.t
                      ? "bg-primary-1 text-black border-primary-1 shadow-md"
                      : "bg-[#1e1e1e] text-gray-300 border-gray-800 hover:bg-[#252525] hover:border-gray-700"
                  )}
                >
                  <span className="font-semibold">{s.t}</span>
                  <span className="text-[10px] opacity-70">100 avail</span>
                  {"off" in s && s.off ? (
                    <span className="absolute top-1 right-1 bg-primary-1 text-black text-[9px] font-bold px-1.5 py-0.5 rounded-md">
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
