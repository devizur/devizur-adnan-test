"use client";

import React from "react";
import {
  useAppDispatch,
  useAppSelector,
  setDate,
  setTimeOfDay,
  setTimeSlot,
  setBookingReferenceId,
  addActivity,
  removeActivity,
  setActivityGameNo,
  setActivityCombination,
  addPackage,
  removePackage,
} from "@/store";
import { useActivities, usePackages, useAvailabilitySlots } from "@/lib/api/hooks";
import { useQueryClient } from "@tanstack/react-query";
import type { Activity, AttributeCombinationItem } from "@/lib/api/types";
import { Check, Loader2, CalendarClock, Package } from "lucide-react";
import { cn, formatTimeForDisplay } from "@/lib/utils";
import { BookingCalendar, toLocalDateString } from "./BookingCalendar";
import { BookingGuests } from "./BookingGuests";
import { BookingTimelineBar } from "./BookingTimelineBar";
import { segmentedPrimaryCtaClass } from "./booking-segmented-styles";

const OPTIONS = [
  { label: "1 Game", value: 1 },
  { label: "2 Games", value: 2 },
  { label: "3 Games", value: 3 },
] as const;

const SHIFT = [
  { id: 1, label: "Morning", apiKey: "Morning" as const },
  { id: 2, label: "Afternoon", apiKey: "Afternoon" as const },
  { id: 3, label: "Evening", apiKey: "Evening" as const },
] as const;

export function StepAvailabilitySelection() {
  const dispatch = useAppDispatch();
  const queryClient = useQueryClient();
  const shopId = useAppSelector((state) => state.shop.shopId);
  const { date, timeOfDay, timeSlot, bookingReferenceId: reduxBookingReferenceId, selectedActivities, selectedPackages, persons } =
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
    if (!slotsRequested || !effectiveSlotsData) return;
    const id = effectiveSlotsData.bookingReferenceId?.trim();
    if (id) dispatch(setBookingReferenceId(id));
  }, [slotsRequested, effectiveSlotsData, dispatch]);

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
      <div className="w-full md:w-[300px] lg:w-[min(400px,38%)] shrink-0 md:min-h-0 flex flex-col border-b md:border-b-0 md:border-r border-white/[0.06] bg-[#141414]">
        <div className="px-3 sm:px-4 py-2.5 border-b border-white/[0.06] shrink-0 bg-[#121212]/80">
          <h3 className="text-xs font-semibold text-white tracking-tight">
            Activities & packages
          </h3>
        </div>
        <div className="flex-1 min-h-0 overflow-y-auto p-2 sm:p-3">
          <p className="text-[9px] font-semibold uppercase tracking-[0.14em] text-zinc-500 mb-2">
            Activities
          </p>
          <div className="flex gap-2 overflow-x-auto md:overflow-x-visible md:flex-col md:space-y-2 scrollbar-dark pb-1 -mx-1 px-1 md:pb-0 md:mx-0 md:px-0">
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
                    "w-[210px] sm:w-[240px] md:w-full text-left rounded-lg sm:rounded-xl border transition-all duration-200 overflow-hidden cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-1/50 focus-visible:ring-offset-2 focus-visible:ring-offset-[#141414] flex flex-col shrink-0 md:shrink",
                    selected
                      ? "border-primary-1/50 bg-primary-1/[0.06] ring-1 ring-primary-1/25 shadow-sm shadow-black/20"
                      : "border-white/[0.08] bg-[#1a1a1a] hover:bg-[#1f1f1f] hover:border-white/[0.12]"
                  )}
                >
                  <div className="relative h-14 sm:h-[3.75rem] overflow-hidden shrink-0">
                    <img
                      src={
                        activity.image ||
                        `https://picsum.photos/seed/a-${activity.id}/800/600`
                      }
                      alt={(activity as any).title || "Activity image"}
                      className={cn(
                        "w-full h-full object-cover transition-transform duration-300 ease-out",
                        selected ? "brightness-[1.05]" : "group-hover:scale-[1.03]"
                      )}
                    />
                    <div
                      className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-80"
                      aria-hidden
                    />
                    {selected && (
                      <div className="absolute top-1 right-1 w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-primary-1 flex items-center justify-center shadow-md shadow-black/40 ring-1 ring-black/30">
                        <Check className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-secondary" strokeWidth={2.5} />
                      </div>
                    )}
                  </div>
                  <div className="p-2 flex flex-col justify-center min-h-0 gap-0.5">
                    <h4 className="font-semibold text-[11px] sm:text-xs text-white leading-snug line-clamp-2">
                      {activity.title}
                    </h4>
                    <p className="text-[10px] text-zinc-500 mt-0.5 line-clamp-2 leading-snug">
                      {activity.timeSlots && activity.timeSlots.length > 0
                        ? activity.timeSlots.join(", ")
                        : combinations.length > 0
                          ? combinations
                              .map((c) => `${c.attributeCombinationName} $${c.fixedPrice}`)
                              .join(", ")
                          : "--"}
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
                                      "min-h-8 py-1.5 px-2 rounded-md text-[10px] font-medium transition-all duration-150 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-1/50 focus-visible:ring-offset-2 focus-visible:ring-offset-[#141414]",
                                      isOptSelected
                                        ? "bg-primary-1 text-secondary shadow-sm"
                                        : "bg-[#222] text-zinc-400 hover:text-zinc-200 hover:bg-[#2a2a2a] border border-white/[0.08]"
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
                              "flex-1 min-h-9 py-1.5 px-1 rounded-md text-[10px] font-medium transition-all duration-150 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-1/50 focus-visible:ring-offset-2 focus-visible:ring-offset-[#141414] flex flex-col items-center justify-center gap-0.5",
                              gameNo === opt.value
                                ? "bg-primary-1 text-secondary shadow-sm"
                                : "bg-[#222] text-zinc-400 hover:text-zinc-200 hover:bg-[#2a2a2a] border border-white/[0.08]"
                            )}
                          >
                            <span>{opt.label}</span>
                            <span
                              className={cn(
                                "text-[10px] font-normal tabular-nums",
                                gameNo === opt.value ? "text-secondary/85" : "text-zinc-500"
                              )}
                            >
                              {priceLabel}
                            </span>
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
              <div className="flex items-center gap-1.5 mt-5 mb-2 pt-4 border-t border-white/[0.06]">
                <Package className="h-3 w-3 text-zinc-500 shrink-0" aria-hidden />
                <p className="text-[9px] font-semibold uppercase tracking-[0.14em] text-zinc-500">
                  Packages
                </p>
              </div>
              <div className="flex gap-2 overflow-x-auto md:overflow-x-visible md:flex-col md:space-y-2 scrollbar-dark pb-1 -mx-1 px-1 md:pb-0 md:mx-0 md:px-0">
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
                          "w-[210px] sm:w-[240px] md:w-full text-left rounded-lg sm:rounded-xl border transition-all duration-200 overflow-hidden cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-1/50 focus-visible:ring-offset-2 focus-visible:ring-offset-[#141414] flex flex-col shrink-0 md:shrink",
                          selected
                            ? "border-primary-1/50 bg-primary-1/[0.06] ring-1 ring-primary-1/25 shadow-sm shadow-black/20"
                            : "border-white/[0.08] bg-[#1a1a1a] hover:bg-[#1f1f1f] hover:border-white/[0.12]"
                        )}
                      >
                        <div className="relative h-14 sm:h-[3.75rem] overflow-hidden shrink-0">
                          <img
                            src={pkg.image || `https://picsum.photos/seed/p-${pkg.id}/800/600`}
                            alt={pkg.title || "Package image"}
                            className={cn(
                              "w-full h-full object-cover transition-transform duration-300 ease-out",
                              selected ? "brightness-[1.05]" : "group-hover:scale-[1.03]"
                            )}
                          />
                          <div
                            className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-80"
                            aria-hidden
                          />
                          {selected && (
                            <div className="absolute top-1 right-1 w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-primary-1 flex items-center justify-center shadow-md shadow-black/40 ring-1 ring-black/30">
                              <Check className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-secondary" strokeWidth={2.5} />
                            </div>
                          )}
                        </div>
                        <div className="p-2 flex flex-col justify-center min-h-0 gap-0.5">
                          <h4 className="font-semibold text-[11px] sm:text-xs text-white leading-snug line-clamp-2">
                            {pkg.title}
                          </h4>
                          <p className="text-[10px] text-zinc-500">{pkg.price}</p>
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
        <div className="shrink-0 border-b border-white/[0.06] bg-gradient-to-b from-[#181818] to-[#161616]">
          <div className="px-4 sm:px-6 py-4 sm:py-5 space-y-5">
             
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 lg:gap-4 lg:items-start">
              <div className="space-y-1 min-w-0">
                <p className="text-[9px] font-semibold uppercase tracking-[0.14em] text-zinc-500">
                  Guests
                </p>
                <div className="rounded-lg border border-white/[0.08] bg-[#141414]/90 px-2 py-2 sm:px-2.5">
                  <BookingGuests />
                </div>
              </div>
              <div className="space-y-1 min-w-0">
                <p className="text-[9px] font-semibold uppercase tracking-[0.14em] text-zinc-500">
                  Visit date
                </p>
                <div className="rounded-lg border border-white/[0.08] bg-[#141414]/90 px-2 py-2 sm:px-2.5">
                  <BookingCalendar
                    value={date ?? ""}
                    onChange={(d) => dispatch(setDate(d))}
                  />
                </div>
              </div>
              <div className="space-y-1 min-w-0">
                <p className="text-[9px] font-semibold uppercase tracking-[0.14em] text-zinc-500">
                  Availability
                </p>
                <div className="rounded-lg border border-white/[0.08] bg-[#141414]/90 px-2 py-2 sm:px-2.5">
                  <button
                    type="button"
                    disabled={!canFetchSlots || slotsLoading}
                    onClick={() => {
                      queryClient.invalidateQueries({ queryKey: ["availability"] });
                      setSlotsRequested(true);
                    }}
                    aria-label="Load available time slots for your selection"
                    className={cn(
                      segmentedPrimaryCtaClass,
                      canFetchSlots && !slotsLoading
                        ? "cursor-pointer hover:brightness-110 active:scale-[0.99]"
                        : "opacity-45 cursor-not-allowed"
                    )}
                  >
                    {slotsLoading ? (
                      <>
                        <Loader2 className="h-3.5 w-3.5 animate-spin shrink-0" aria-hidden />
                        <span>Loading…</span>
                      </>
                    ) : (
                      <span>Check availability</span>
                    )}
                  </button>
                  <div className="mt-1 h-[15px] shrink-0" aria-hidden />
                </div>
              </div>
            </div>

            <BookingTimelineBar
              bookingReferenceId={reduxBookingReferenceId || effectiveSlotsData?.bookingReferenceId}
              timeSlot={timeSlot}
              selectedDate={date ?? undefined}
              slotsResponseReceived={!!effectiveSlotsData && !!timeSlot}
              selectedActivities={selectedActivities}
              selectedPackages={selectedPackages}
              className="rounded-lg border border-white/[0.06] bg-[#141414]/40 px-2 py-1.5 sm:px-2.5"
            />

            {visibleShifts.length > 0 && (
              <div className="space-y-1">
                <p className="text-[9px] font-semibold uppercase tracking-[0.14em] text-zinc-500">
                  Session period
                </p>
                <div
                  className="flex gap-0.5 p-0.5 rounded-lg bg-[#141414] border border-white/[0.08]"
                  role="tablist"
                  aria-label="Time of day"
                >
                  {visibleShifts.map((tab) => (
                    <button
                      key={tab.id}
                      type="button"
                      role="tab"
                      aria-selected={timeOfDay === tab.id}
                      aria-label={`${tab.apiKey} sessions`}
                      onClick={() => dispatch(setTimeOfDay(tab.id as 1 | 2 | 3))}
                      className={cn(
                        "flex-1 min-h-7 py-1 px-1 rounded-md text-[10px] sm:text-[11px] font-medium leading-tight transition-all duration-200 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-1/50 focus-visible:ring-inset",
                        timeOfDay === tab.id
                          ? "bg-[#2a2a2a] text-white shadow-sm border border-white/[0.06]"
                          : "text-zinc-500 hover:text-zinc-300 hover:bg-white/[0.03]"
                      )}
                    >
                      {tab.apiKey}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto px-3 sm:px-5 py-3 sm:py-4 scrollbar-dark">
          {!slotsParams ? (
              <div
                className="rounded-xl border border-dashed border-white/[0.1] bg-[#141414]/40 px-4 py-6 sm:py-7 text-center"
                role="status"
              >
                <CalendarClock className="mx-auto h-7 w-7 text-zinc-600 mb-2" aria-hidden />
                <p className="text-sm font-medium text-zinc-200 sm:text-[0.9375rem]">
                  Ready when you are
                </p>
                <p className="mt-2 max-w-sm mx-auto text-xs leading-relaxed text-zinc-500 sm:text-[0.8125rem]">
                  Select what you would like to book, set guest counts, choose a date, then use{" "}
                  <span className="font-medium text-zinc-400">Check availability</span> to load start times.
                </p>
              </div>
            ) : (
              <div
                className="rounded-xl border border-white/[0.08] bg-[#141414]/60 p-2 sm:p-2.5"
                role="group"
                aria-label="Select start time"
              >
                <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-7 gap-1 sm:gap-1.5">
                  {slotsLoading ? (
                    <div className="col-span-full py-8 flex flex-col items-center justify-center gap-2 text-zinc-400 text-xs">
                      <Loader2 className="h-6 w-6 text-primary-1 animate-spin" aria-hidden />
                      <span>Loading available times…</span>
                    </div>
                  ) : slots.length === 0 ? (
                    <div className="col-span-full py-7 flex flex-col items-center justify-center gap-1 text-zinc-400 text-xs text-center px-3">
                      <span className="font-medium text-zinc-300">No slots in this window</span>
                      <span className="text-[10px] text-zinc-500 max-w-xs leading-relaxed">
                        Try another session period or pick a different date.
                      </span>
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
                          "relative min-h-[2.625rem] sm:min-h-11 py-1 px-1 rounded-md border text-[11px] sm:text-xs transition-all duration-150 flex items-center justify-center leading-tight focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-1/50 focus-visible:ring-offset-1 focus-visible:ring-offset-[#141414]",
                          s.available <= 0 && "opacity-45 cursor-not-allowed",
                          timeSlot === s.startTime
                            ? "bg-primary-1 text-secondary border-primary-1 shadow-sm shadow-black/20 cursor-pointer font-semibold"
                            : s.available > 0
                              ? "bg-[#1e1e1e] text-zinc-200 border-white/[0.08] hover:bg-[#252525] hover:border-white/[0.12] cursor-pointer font-medium"
                              : "bg-[#1a1a1a] text-zinc-600 border-white/[0.06]"
                        )}
                      >
                        <span className="tabular-nums leading-none">{s.startTime}</span>
                      </button>
                    ))
                  )}
                </div>
              </div>
            )}
        </div>
      </div>
    </div>
  );
}
