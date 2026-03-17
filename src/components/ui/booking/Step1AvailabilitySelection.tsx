"use client";

import React from "react";
import {
  useAppDispatch,
  useAppSelector,
  setDate,
  setTimeOfDay,
  setTimeSlot,
  setBookingId,
  addActivity,
  removeActivity,
  setActivityGameNo,
  setActivityCombination,
  addPackage,
  removePackage,
} from "@/store";
import { useActivities, usePackages, useAvailabilitySlots } from "@/lib/api/hooks";
import type { Activity, AttributeCombinationItem } from "@/lib/api/types";
import { Check } from "lucide-react";
import { cn, formatTimeForDisplay } from "@/lib/utils";
import { BookingCalendar, toLocalDateString } from "./BookingCalendar";
import { BookingGuests } from "./BookingGuests";
import { BookingTimelineBar } from "./BookingTimelineBar";

const OPTIONS = [
  { label: "1 Game", value: 1 },
  { label: "2 Games", value: 2 },
  { label: "3 Games", value: 3 },
] as const;

const SHIFT = [
  { id: 1, label: "Morning", apiKey: "Morning" as const },
  { id: 2, label: "Afternoon", apiKey: "Afternoon" as const },
  { id: 3, label: "Evening", apiKey: "Night" as const },
] as const;

export function Step1AvailabilitySelection() {
  const dispatch = useAppDispatch();
  const shopId = useAppSelector((state) => state.shop.shopId);
  const { date, timeOfDay, timeSlot, bookingId: reduxBookingId, selectedActivities, selectedPackages, persons } =
    useAppSelector((state) => state.booking);

  const { data: activities = [] } = useActivities();
  const { data: packages = [] } = usePackages();
  const activityList = activities.slice(0, 10);
  const suggestedPackages = packages.slice(0, 4);

  const [slotsRequested, setSlotsRequested] = React.useState(false);

  const canFetchSlots =
    !!date && (selectedActivities.length > 0 || selectedPackages.length > 0) && persons.adults + persons.kids > 0;

  const slotsParams =
    canFetchSlots && slotsRequested
      ? {
          date,
          timeOfDay,
          activityIds: selectedActivities.map((a) => a.activity.id),
          packageIds: selectedPackages.map((p) => p.id),
          selectedBookableProducts: [
            ...selectedActivities.map((a) => ({
              id: (a.activity as { productId?: number }).productId ?? a.activity.id,
              attributeOptionId:
                a.combination && a.combination.attributeCombinationSet?.length > 0
                  ? a.combination.attributeCombinationSet[0]
                  : a.gameNo,
            })),
            ...selectedPackages.map((p) => ({ id: p.id, attributeOptionId: 1 })),
          ],
          adults: persons.adults,
          kids: persons.kids,
          shopId,
        }
      : null;
  const { data: slotsData, isLoading: slotsLoading } = useAvailabilitySlots(slotsParams);

  // Reset slotsRequested when key inputs change so user must click again
  React.useEffect(() => {
    setSlotsRequested(false);
    dispatch(setTimeSlot(""));
  }, [
    date,
    selectedActivities.map((a) => `${a.activity.id}-${a.combination?.productAttributeCombinationId ?? a.gameNo}`).join(","),
    selectedPackages.map((p) => p.id).join(","),
    persons.adults,
    persons.kids,
  ]);
  // Hide stale cached data when user hasn't clicked "Get Time Slots" yet
  const effectiveSlotsData = slotsRequested ? slotsData : undefined;
  const periodsWithSlots = effectiveSlotsData?.periodsWithSlots ?? [];
  const slots = React.useMemo(() => {
    const ts = effectiveSlotsData?.timeSlots;
    if (!ts) return [];
    const apiKey = SHIFT.find((t) => t.id === timeOfDay)?.apiKey ?? "Morning";
    const raw = ts[apiKey];
    if (!Array.isArray(raw) || raw.length === 0) return [];
    return raw.map((t) => ({
      startTime: formatTimeForDisplay(t),
      available: 1,
    }));
  }, [effectiveSlotsData?.timeSlots, timeOfDay]);
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

  /** Activity has dynamic options from API (attributeCombinations) */
  const getCombinations = (activity: Activity): AttributeCombinationItem[] => {
    const combos = (activity as Activity & { attributeCombinations?: AttributeCombinationItem[] })
      .attributeCombinations;
    return Array.isArray(combos) && combos.length > 0 ? combos : [];
  };

  const getSelectedCombination = (activityId: number) =>
    selectedActivities.find((i) => i.activity.id === activityId)?.combination;

  /** Group attributeOptions by attributeName for per-attribute selection UI */
  const getAttributeGroups = (activity: Activity) => {
    const options = activity.attributeOptions ?? [];
    const groups: { attributeId: number; attributeName: string; options: typeof options }[] = [];
    for (const opt of options) {
      let group = groups.find((g) => g.attributeId === opt.attributeId);
      if (!group) {
        group = { attributeId: opt.attributeId, attributeName: opt.attributeName, options: [] };
        groups.push(group);
      }
      group.options.push(opt);
    }
    return groups;
  };

  /** Find the combination whose attributeCombinationSet matches the given option IDs */
  const findCombinationByOptions = (activity: Activity, selectedOptionIds: number[]) => {
    const combos = getCombinations(activity);
    return combos.find((c) => {
      const set = c.attributeCombinationSet;
      return (
        set.length === selectedOptionIds.length &&
        selectedOptionIds.every((id) => set.includes(id))
      );
    });
  };

  React.useEffect(() => {
    if (!date) {
      dispatch(setDate(toLocalDateString(new Date())));
    }
  }, [date, dispatch]);

  React.useEffect(() => {
    if (effectiveSlotsData?.bookingId) dispatch(setBookingId(effectiveSlotsData.bookingId));
  }, [effectiveSlotsData?.bookingId, dispatch]);

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
    <div className="flex flex-col md:flex-row flex-1 min-h-0 overflow-y-auto md:overflow-hidden">
      {/* Left panel - Activity List */}
      <div className="w-full md:w-[300px] lg:w-1/3 shrink-0 md:min-h-0 flex flex-col border-b md:border-b-0 md:border-r border-gray-800/80 bg-[#161616]">
        <div className="px-3 sm:px-4 py-3 sm:py-3.5 border-b border-gray-800/80 shrink-0">
          <h3 className="text-xs font-medium text-gray-400 uppercase tracking-wider">
            Choose activities
          </h3>
        </div>
        <div className="flex-1 min-h-0 overflow-y-auto p-2 sm:p-3 md:p-3">
          <div className="flex gap-2 sm:gap-3 overflow-x-auto md:overflow-x-visible md:flex-col md:space-y-3 scrollbar-dark pb-1 -mx-1 px-1 md:pb-0 md:mx-0 md:px-0">
          {activityList.map((activity) => {
            const selected = isActivitySelected(activity.id);
            const gameNo = getActivityGameNo(activity.id);
            const combinations = getCombinations(activity);
            const hasDynamicOptions = combinations.length > 0;
            const defaultCombo = combinations[0];

            return (
              <div key={activity.id} className="relative group">
                <button
                  type="button"
                  onClick={() => {
                    if (selected) {
                      dispatch(removeActivity(activity.id));
                    } else if (hasDynamicOptions && defaultCombo) {
                      dispatch(
                        addActivity({
                          activity,
                          gameNo: 1,
                          combination: defaultCombo,
                        })
                      );
                    } else {
                      dispatch(addActivity({ activity, gameNo: getDefaultGameNo(activity) }));
                    }
                  }}
                  aria-pressed={selected}
                  aria-label={selected ? `Remove ${activity.title}` : `Select ${activity.title}`}
                  className={cn(
                    "w-[220px] sm:w-[260px] md:w-full text-left rounded-lg sm:rounded-2xl border transition-all duration-200 overflow-hidden cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-1/50 focus-visible:ring-offset-2 focus-visible:ring-offset-[#161616] flex flex-col shrink-0 md:shrink",
                    selected
                      ? "border-primary-1/60 bg-primary-1/5 shadow-[0_0_0_1px_rgba(255,212,0,0.2)]"
                      : "border-gray-800 bg-[#1e1e1e] hover:bg-[#252525] hover:border-gray-700"
                  )}
                >
                  <div className="relative h-16 sm:h-auto sm:aspect-2/1 md:aspect-3/1 overflow-hidden shrink-0">
                    <img
                      src={activity.image || "https://picsum.photos/400/200"}
                      alt={(activity as any).title || "Activity image"}
                      className={cn(
                        "w-full h-full object-cover transition-transform duration-200",
                        selected ? "brightness-110" : "group-hover:scale-[1.02]"
                      )}
                    />
                    {selected && (
                      <div className="absolute top-1.5 right-1.5 sm:top-2.5 sm:right-2.5 w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-primary-1 flex items-center justify-center shadow-lg">
                        <Check className="w-3 h-3 sm:w-4 sm:h-4 text-secondary" strokeWidth={2.5} />
                      </div>
                    )}
                  </div>
                  <div className="p-2 sm:p-3 flex flex-col justify-center min-h-0">
                    <h4 className="font-medium text-xs sm:text-base text-white truncate">{activity.title}</h4>
                    <p className="text-[10px] sm:text-xs text-gray-400 mt-0.5 line-clamp-1 sm:line-clamp-2">
                      {activity.timeSlots?.slice(0, 3).join(", ") || "--"}
                      {activity.timeSlots && activity.timeSlots.length > 3 ? ", ..." : ""}
                    </p>
                  </div>
                </button>
                {selected && hasDynamicOptions && (
                  <div className="mt-1 sm:mt-2 px-0.5 space-y-1 sm:space-y-2">
                    {getAttributeGroups(activity).filter((g) => g.attributeName === "Game Type").map((group) => {
                        const selectedIds =
                          getSelectedCombination(activity.id)?.attributeCombinationSet ?? [];
                        return (
                          <div key={group.attributeId}>
                            <div className="flex flex-wrap gap-1 sm:gap-1.5">
                              {group.options.map((opt) => {
                                const isOptSelected = selectedIds.includes(opt.attributeOptionId);
                                return (
                                  <button
                                    key={opt.attributeOptionId}
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      const otherIds = selectedIds.filter(
                                        (id) =>
                                          !group.options.some(
                                            (o) => o.attributeOptionId === id
                                          )
                                      );
                                      const newIds = [...otherIds, opt.attributeOptionId];
                                      const matched = findCombinationByOptions(activity, newIds);
                                      if (matched) {
                                        dispatch(
                                          setActivityCombination({
                                            activityId: activity.id,
                                            combination: matched,
                                          })
                                        );
                                      }
                                    }}
                                    aria-pressed={isOptSelected}
                                    aria-label={`${group.attributeName}: ${opt.attributeOptionName}`}
                                    className={cn(
                                      "min-h-9 sm:min-h-10 py-1.5 sm:py-2 px-2.5 sm:px-3 rounded-lg sm:rounded-xl text-[11px] sm:text-[12px] font-medium transition-all duration-150 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-1/50 focus-visible:ring-offset-2 focus-visible:ring-offset-[#161616]",
                                      isOptSelected
                                        ? "bg-primary-1 text-secondary"
                                        : "bg-[#1e1e1e] text-gray-400 hover:text-gray-300 hover:bg-[#252525] border border-gray-800"
                                    )}
                                  >
                                    {opt.attributeOptionName}
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                      );
                    })}
                  </div>
                )}
                {selected && !hasDynamicOptions && (
                  <div className="flex gap-1 sm:gap-1.5 mt-1 sm:mt-2 px-0.5">
                      {getAvailableOptions(activity).map((opt) => {
                        const basePrice = Number((activity as any).fixedPrice);
                        const hasPrice = !Number.isNaN(basePrice) && basePrice > 0;
                        const optionPrice = hasPrice ? basePrice * opt.value : undefined;
                        const priceLabel = hasPrice
                          ? `$${optionPrice!.toFixed(2)}`
                          : "Unavailable";
                        return (
                          <button
                            key={opt.value}
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              dispatch(
                                setActivityGameNo({ activityId: activity.id, gameNo: opt.value })
                              );
                            }}
                            aria-pressed={gameNo === opt.value}
                            aria-label={
                              hasPrice
                                ? `${opt.label} ${priceLabel} for ${activity.title}`
                                : `${opt.label} price unavailable for ${activity.title}`
                            }
                            className={cn(
                              "flex-1 min-h-9 sm:min-h-10 py-1.5 sm:py-2 rounded-lg sm:rounded-xl text-[11px] sm:text-[12px] font-medium transition-all duration-150 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-1/50 focus-visible:ring-offset-2 focus-visible:ring-offset-[#161616]",
                              gameNo === opt.value
                                ? "bg-primary-1 text-secondary"
                                : "bg-[#1e1e1e] text-gray-400 hover:text-gray-300 hover:bg-[#252525] border border-gray-800"
                            )}
                          >
                            <span>{opt.label}</span>
                            <span className="opacity-80">/</span>
                            <span className="text-[10px] opacity-80">{priceLabel}</span>
                          </button>
                        );
                      })}
                  </div>
                )}
              </div>
            );
          })}
          </div>

          {suggestedPackages.length > 0 && (
            <>
              <p className="text-[11px] text-gray-500 font-medium mt-3 sm:mt-5 mb-1.5 sm:mb-2 uppercase tracking-wider">Packages</p>
              <div className="flex gap-2 sm:gap-3 overflow-x-auto md:overflow-x-visible md:flex-col md:space-y-3 scrollbar-dark pb-1 -mx-1 px-1 md:pb-0 md:mx-0 md:px-0">
                {suggestedPackages.map((pkg) => {
                  const selected = isPackageSelected(pkg.id);
                  return (
                    <div key={pkg.id} className="relative group shrink-0 md:shrink">
                      <button
                        type="button"
                        onClick={() =>
                          selected ? dispatch(removePackage(pkg.id)) : dispatch(addPackage(pkg))
                        }
                        aria-pressed={selected}
                        aria-label={selected ? `Remove ${pkg.title} from booking` : `Select ${pkg.title}`}
                        className={cn(
                          "w-[220px] sm:w-[260px] md:w-full text-left rounded-lg sm:rounded-2xl border transition-all duration-200 overflow-hidden cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-1/50 focus-visible:ring-offset-2 focus-visible:ring-offset-[#161616] flex flex-col shrink-0 md:shrink",
                          selected
                            ? "border-primary-1/60 bg-primary-1/5 shadow-[0_0_0_1px_rgba(255,212,0,0.2)]"
                            : "border-gray-800 bg-[#1e1e1e] hover:bg-[#252525] hover:border-gray-700"
                        )}
                      >
                        <div className="relative h-16 sm:h-auto sm:aspect-2/1 md:aspect-3/1 overflow-hidden shrink-0">
                          <img
                            src={pkg.image || "https://picsum.photos/400/200"}
                            alt={pkg.title || "Package image"}
                            className={cn(
                              "w-full h-full object-cover transition-transform duration-200",
                              selected ? "brightness-110" : "group-hover:scale-[1.02]"
                            )}
                          />
                          {selected && (
                            <div className="absolute top-1.5 right-1.5 sm:top-2.5 sm:right-2.5 w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-primary-1 flex items-center justify-center shadow-lg">
                              <Check className="w-3 h-3 sm:w-4 sm:h-4 text-secondary" strokeWidth={2.5} />
                            </div>
                          )}
                        </div>
                        <div className="p-2 sm:p-3 flex flex-col justify-center min-h-0">
                          <h4 className="font-medium text-xs sm:text-base text-white truncate">{pkg.title}</h4>
                          <p className="text-[10px] sm:text-xs text-gray-400 mt-0.5">{pkg.price}</p>
                        </div>
                      </button>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Right panel - Date, time & availability */}
      <div className="flex-1 flex flex-col min-w-0 min-h-0 bg-[#161616]">
        <div className="px-4 sm:px-5 md:px-5 py-3 sm:py-4 border-b border-gray-800/80 flex flex-col gap-3 sm:gap-4 md:gap-4 shrink-0">
          <div className="flex flex-col sm:flex-row sm:flex-wrap sm:justify-between gap-3 md:gap-4">
            <BookingGuests />
            <BookingCalendar
              value={date ?? ""}
              onChange={(d) => dispatch(setDate(d))}
            />
            <button
              type="button"
              disabled={!canFetchSlots || slotsLoading}
              onClick={() => setSlotsRequested(true)}
              className={cn(
                "min-h-8 py-1.5 px-3 sm:min-h-9 sm:py-2.5 sm:px-5 rounded-lg sm:rounded-xl text-[11px] sm:text-xs font-medium transition-all duration-200 bg-primary-1 text-secondary focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-1/50 focus-visible:ring-offset-2 focus-visible:ring-offset-[#161616]",
                canFetchSlots && !slotsLoading
                  ? "cursor-pointer hover:brightness-110"
                  : "opacity-50 cursor-not-allowed"
              )}
            >
              {slotsLoading ? "Loading…" : "Get Time Slots"}
            </button>
          </div>
          

          <BookingTimelineBar
            bookingId={reduxBookingId || effectiveSlotsData?.bookingId}
            timeSlot={timeSlot}
            selectedDate={date ?? undefined}
            slotsResponseReceived={!!effectiveSlotsData && !!timeSlot}
            selectedActivities={selectedActivities}
            selectedPackages={selectedPackages}
          />



          <div className="flex gap-1.5 sm:gap-2 md:gap-2" role="tablist" aria-label="Time of day">
            {visibleShifts.map((tab) => (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={timeOfDay === tab.id}
                aria-label={`${tab.apiKey} sessions`}
                onClick={() => dispatch(setTimeOfDay(tab.id as 1 | 2 | 3))}
                className={cn(
                  "flex-1 min-h-10 sm:min-h-11 md:min-h-11 py-2 sm:py-2.5 rounded-lg sm:rounded-xl md:rounded-xl text-xs sm:text-sm font-medium transition-all duration-200 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-1/50 focus-visible:ring-offset-2 focus-visible:ring-offset-[#161616]",
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

        <div className="flex-1 min-h-0 overflow-y-auto px-4 sm:px-5 md:px-5 py-3 sm:py-4 md:py-4 space-y-4 sm:space-y-5 scrollbar-dark">
          <div>
            <p className="text-[11px] text-gray-500 uppercase tracking-wider mb-2 sm:mb-3 md:mb-3">
              {!slotsParams
                ? "Start time · Select date, time of day, at least one activity or package, and guests"
                : slotsLoading
                  ? "Start time · Loading…"
                  : slots.length === 0
                    ? "Start time · No slots available"
                    : !timeSlot
                      ? "Start time · Select a time below"
                      : `Start time · ${slots.length} slot${slots.length !== 1 ? "s" : ""} available`
              }
            </p>
            {slotsParams && (
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-4 gap-1.5 sm:gap-2 md:gap-2" role="group" aria-label="Select start time">
                {slotsLoading ? (
                  <div className="col-span-full py-6 sm:py-8 flex flex-col items-center justify-center gap-2 sm:gap-3 text-gray-400 text-xs sm:text-sm">
                    <div className="w-6 h-6 sm:w-8 sm:h-8 border-2 border-primary-1/40 border-t-primary-1 rounded-full animate-spin" />
                    <span>Loading available times…</span>
                  </div>
                ) : slots.length === 0 ? (
                  <div className="col-span-full py-6 sm:py-8 flex flex-col items-center justify-center gap-1.5 sm:gap-2 text-gray-400 text-xs sm:text-sm text-center px-3 sm:px-4">
                    <span>No time slots available for this period.</span>
                    <span className="text-[11px] sm:text-xs text-gray-500">Try selecting another time of day or date.</span>
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
                        "relative min-h-14 sm:min-h-18 md:min-h-18 py-2.5 sm:py-3 md:py-3 px-1.5 sm:px-2 md:px-2 rounded-lg sm:rounded-xl border text-xs sm:text-sm md:text-sm transition-all duration-150 flex flex-col items-center justify-center gap-0.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-1/50 focus-visible:ring-offset-2 focus-visible:ring-offset-[#161616]",
                        s.available <= 0 && "opacity-50 cursor-not-allowed",
                        timeSlot === s.startTime
                          ? "bg-primary-1 text-secondary border-primary-1 shadow-md cursor-pointer"
                          : s.available > 0
                            ? "bg-[#1e1e1e] text-gray-300 border-gray-800 hover:bg-[#252525] hover:border-gray-700 cursor-pointer"
                            : "bg-[#1e1e1e] text-gray-500 border-gray-800"
                      )}
                    >
                      <span className="font-semibold text-xs sm:text-sm">{s.startTime}</span>
                      <span className="text-[10px] sm:text-xs opacity-70">{s.available} available</span>
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
