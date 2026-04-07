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
  setPackageCombination,
} from "@/store";
import { store } from "@/store/store";
import { useActivities, usePackages, useAvailabilitySlots } from "@/lib/api/hooks";
import { useQueryClient } from "@tanstack/react-query";
import type { Activity } from "@/lib/api/types";
import {
  pickDefaultCombination,
  getActivityCardPricingSubtitle,
  getProductCombinations,
  attributeOptionsForFlatDisplay,
  optionsWithSameAttributeId,
  buildFullCombinationOptionIds,
  findCombinationByOptionIds,
  stripGuestDerivedOptionIds,
  resolveGuestDerivedCombinationUpdate,
} from "@/lib/booking/catalog-selection";
import { Check, Loader2, CalendarClock, Package as PackageIcon, Ticket } from "lucide-react";
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

/** Shared catalog row cards — fixed width so activities + packages share one horizontal scroll row */
const catalogCardBtnBase =
  "group/card  w-[min(238px,82vw)] sm:w-full shrink-0 text-left rounded-xl border transition-all duration-300 ease-out overflow-hidden cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-1/45 focus-visible:ring-offset-2 focus-visible:ring-offset-[#141414] flex flex-col";

const catalogColumnClass =
  "flex   w-[min(238px,82vw)] shrink-0 flex-col sm:w-[252px] lg:w-full";

const catalogCardImageShell =
  "relative  h-[4.25rem] sm:h-[4.75rem] overflow-hidden shrink-0 w-full";

const catalogCardImgClass =
  "h-full w-full object-cover transition-transform duration-500 ease-out will-change-transform ";

const catalogCardImgOverlay =
  "pointer-events-none absolute inset-0 bg-linear-to-t from-black/70 via-black/20 to-transparent w-full";

const catalogCardBody =
  "flex min-h-0 flex-col justify-center gap-1 border-t border-white/[0.06] bg-zinc-950/40 px-2.5 py-2.5 sm:px-3 sm:py-3";

const catalogCardTitleClass =
  "line-clamp-2 text-left text-[12px] sm:text-[13px] font-semibold leading-snug tracking-tight text-zinc-50";

const catalogCardMetaClass =
  "line-clamp-2 text-left text-[10px] sm:text-[11px] font-medium leading-snug tabular-nums text-zinc-500 transition-colors group-hover/card:text-zinc-400";

const catalogSelectedCheckClass =
  "absolute right-2 top-2 flex size-6 items-center justify-center rounded-full bg-primary-1 shadow-lg shadow-black/40 ring-2 ring-black/60";

const packageCardBadgeClass =
  "pointer-events-none absolute left-2 top-2 z-[1] inline-flex items-center gap-0.5 rounded-md border border-primary-1/40 bg-zinc-950/90 px-1.5 py-0.5 text-[7px] font-bold uppercase tracking-[0.12em] text-primary-1 shadow-sm backdrop-blur-sm sm:text-[8px]";

const optionChipBase =
  "min-h-9 rounded-lg border px-2.5 py-2 text-[11px] font-semibold transition-all duration-200 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-1/45 focus-visible:ring-offset-2 focus-visible:ring-offset-[#141414]";

const optionChipIdle =
  "border-zinc-700/55 bg-zinc-900/60 text-accent hover:border-zinc-600/70 hover:bg-zinc-800/60 hover:text-zinc-100";

const optionChipActive = "border-primary-1/55 bg-primary-1 text-secondary shadow-md shadow-primary-1/10";

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
    shopId > 0 &&
    !!date &&
    (selectedActivities.length > 0 || selectedPackages.length > 0) &&
    persons.adults + persons.kids > 0;

  const slotsParams =
    canFetchSlots && slotsRequested
      ? {
          date,
          timeOfDay,
          activityIds: selectedActivities.map((a) => a.activity.id),
          packageIds: selectedPackages.map((p) => p.pkg.id),
          selectedBookableProducts: [
            ...selectedActivities.map((a) => ({
              id: (a.activity as { productId?: number }).productId ?? a.activity.id,
              attributeOptionId:
                a.combination && a.combination.attributeCombinationSet?.length > 0
                  ? a.combination.attributeCombinationSet[0]
                  : a.gameNo,
            })),
            ...selectedPackages.map((p) => ({
              id: (p.pkg as { productId?: number }).productId ?? p.pkg.id,
              attributeOptionId:
                p.combination?.attributeCombinationSet?.length
                  ? p.combination.attributeCombinationSet[0]
                  : 1,
            })),
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
    selectedPackages
      .map((p) => `${p.pkg.id}-${p.combination?.productAttributeCombinationId ?? 0}`)
      .join(","),
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

 
  const getSelectedCombination = (activityId: number) =>
    selectedActivities.find((i) => i.activity.id === activityId)?.combination;

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

  /** When adults/kids change, remap hidden age-group options inside each selected combination. */
  React.useEffect(() => {
    const { selectedActivities: acts, selectedPackages: pkgs } = store.getState().booking;
    acts.forEach(({ activity, combination }) => {
      const next = resolveGuestDerivedCombinationUpdate(activity, combination, persons);
      if (next) {
        dispatch(setActivityCombination({ activityId: activity.id, combination: next }));
      }
    });
    pkgs.forEach(({ pkg, combination }) => {
      const next = resolveGuestDerivedCombinationUpdate(pkg, combination, persons);
      if (next) {
        dispatch(setPackageCombination({ packageId: pkg.id, combination: next }));
      }
    });
  }, [persons.adults, persons.kids, dispatch]);

  const isActivitySelected = (id: number) => selectedActivities.some((i) => i.activity.id === id);
  const getActivityGameNo = (id: number) =>
    selectedActivities.find((i) => i.activity.id === id)?.gameNo ?? 1;
  const isPackageSelected = (id: number) => selectedPackages.some((p) => p.pkg.id === id);

  const getSelectedPackageCombination = (packageId: number) =>
    selectedPackages.find((i) => i.pkg.id === packageId)?.combination;

  return (
    <div
      className="flex min-h-0 flex-1 flex-col overflow-y-auto overscroll-y-contain md:flex-row md:overflow-hidden"
      style={{ WebkitOverflowScrolling: "touch" } as React.CSSProperties}
    >
      {/* Left panel - Activity List (capped on mobile so date/time slots stay reachable) */}
      <div className="flex min-h-0 min-w-0 w-full shrink-0 flex-col border-b border-white/[0.06] bg-[#141414] max-md:max-h-[min(42vh,320px)] md:max-h-none md:w-[300px] md:border-b-0 md:border-r lg:w-[min(400px,38%)]">
        <div className="shrink-0 border-b border-white/[0.06] bg-zinc-950/60 px-3 py-3 sm:px-4">
          <h3 className="whitespace-nowrap text-[11px] font-semibold tracking-tight text-zinc-100 sm:text-xs">
            Activities &amp; packages
          </h3>
        </div>
        <div className="flex-1 min-h-0 min-w-0 overflow-y-auto p-2.5 sm:p-3.5">
          <div
            className={cn(
              "mb-2.5 flex w-full min-w-0 flex-nowrap items-center text-[9px] font-semibold uppercase tracking-[0.12em] text-zinc-500 sm:tracking-[0.16em]",
              suggestedPackages.length > 0 ? "justify-between gap-2" : "justify-start gap-x-2 sm:gap-x-3"
            )}
          >
            <span className="flex shrink-0 items-center gap-1 whitespace-nowrap sm:gap-1.5">
              <Ticket
                className="hidden size-3 shrink-0 text-zinc-500 sm:block"
                aria-hidden
              />
              Activities
              {suggestedPackages.length > 0 ? (
                <>
                  <span className="px-0.5 text-zinc-600" aria-hidden>
                    ·
                  </span>
                  <PackageIcon
                    className="hidden size-3 shrink-0 text-zinc-500 sm:block"
                    aria-hidden
                  />
                  Packages
                </>
              ) : null}
            </span>
          </div>
          <div className="-mx-0.5 flex flex-row  lg:flex-col min-w-0 flex-nowrap items-start gap-2.5 overflow-x-auto px-0.5 pb-2 scrollbar-dark sm:gap-3">
          {activityList.map((activity) => {
            const selected = isActivitySelected(activity.id);
            const gameNo = getActivityGameNo(activity.id);
            const combinations = getProductCombinations(activity);
            const hasDynamicOptions = combinations.length > 0;
            const defaultCombo = pickDefaultCombination(activity, persons);
            const selectedCombo = selected ? getSelectedCombination(activity.id) : undefined;
            const pricingSubtitle = getActivityCardPricingSubtitle(
              activity,
              combinations,
              selected,
              selectedCombo
            );

            return (
              <div key={activity.id} className={cn(catalogColumnClass, "relative")}>
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
                    catalogCardBtnBase,
                    "shadow-md shadow-black/30",
                    selected
                      ? "border-primary-1/45 bg-gradient-to-b from-primary-1/[0.08] to-zinc-950/90 shadow-lg shadow-primary-1/[0.12]"
                      : "border-zinc-800/80 bg-zinc-950/50 hover:border-zinc-600/50 hover:bg-zinc-900/70 hover:shadow-lg hover:shadow-black/40"
                  )}
                >
                  <div className={catalogCardImageShell}>
                    <img   
                      src={
                        activity.image ||
                        `https://picsum.photos/seed/a-${activity.id}/800/600`
                      }
                      alt={(activity as any).title || "Activity image"}
                      className={cn(
                        catalogCardImgClass,
                        selected ? "scale-[1.02] brightness-[1.03]" : "group-hover/card:scale-[1.04]"
                      )}
                    />
                    <div className={catalogCardImgOverlay} aria-hidden />
                    {selected && (
                      <div className={catalogSelectedCheckClass}>
                        <Check className="size-3.5 text-secondary" strokeWidth={2.5} aria-hidden />
                      </div>
                    )}
                  </div>
                  <div className={catalogCardBody}>
                    <h4 className={catalogCardTitleClass}>{activity.title}</h4>
                    <p className={catalogCardMetaClass}>{pricingSubtitle}</p>
                  </div>
                </button>
                {selected && hasDynamicOptions && (
                  <div className="mt-2 px-0.5 sm:px-0">
                    <div className="flex flex-wrap gap-1.5">
                      {attributeOptionsForFlatDisplay(activity).map((opt) => {
                        const selectedIds =
                          getSelectedCombination(activity.id)?.attributeCombinationSet ?? [];
                        const isOptSelected = selectedIds.includes(opt.attributeOptionId);
                        return (
                          <button
                            key={`${opt.attributeId}-${opt.attributeOptionId}`}
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              const sameAttr = optionsWithSameAttributeId(
                                activity,
                                opt.attributeId
                              );
                              const otherIds = selectedIds.filter(
                                (id) => !sameAttr.some((o) => o.attributeOptionId === id)
                              );
                              const strippedOther = stripGuestDerivedOptionIds(
                                activity,
                                otherIds
                              );
                              const tentative = [...strippedOther, opt.attributeOptionId];
                              const merged = buildFullCombinationOptionIds(
                                activity,
                                tentative,
                                persons
                              );
                              const matched = findCombinationByOptionIds(activity, merged);
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
                            aria-label={opt.attributeOptionName}
                            className={cn(
                              optionChipBase,
                              isOptSelected ? optionChipActive : optionChipIdle
                            )}
                          >
                            {opt.attributeOptionName}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
                {selected && !hasDynamicOptions && (
                  <div className="mt-2 space-y-1.5 px-0.5 sm:px-0">
                    <p className="text-[9px] font-semibold uppercase tracking-[0.12em] text-zinc-600">
                      Games
                    </p>
                    <div className="flex flex-wrap gap-1.5">
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
                              optionChipBase,
                              "min-w-[4.5rem] flex-1 flex flex-col items-center justify-center gap-0.5 py-2",
                              gameNo === opt.value ? optionChipActive : optionChipIdle
                            )}
                          >
                            <span>{opt.label}</span>
                            <span
                              className={cn(
                                "text-[10px] font-semibold tabular-nums",
                                gameNo === opt.value ? "text-secondary/90" : "text-zinc-500"
                              )}
                            >
                              {priceLabel}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
            {suggestedPackages.length > 0 ? (
              <div
                className="mx-0.5 w-px shrink-0 self-stretch bg-zinc-700/45"
                aria-hidden
              />
            ) : null}
            {suggestedPackages.map((pkg) => {
              const selected = isPackageSelected(pkg.id);
              const pkgCombinations = getProductCombinations(pkg);
              const hasPkgDynamic = pkgCombinations.length > 0;
              const defaultPkgCombo = pickDefaultCombination(pkg, persons);
              const selectedPkgCombo = selected ? getSelectedPackageCombination(pkg.id) : undefined;
              const pkgPricingSubtitle = getActivityCardPricingSubtitle(
                pkg,
                pkgCombinations,
                selected,
                selectedPkgCombo
              );
              return (
                <div key={pkg.id} className={cn(catalogColumnClass, "relative")}>
                  <button
                    type="button"
                    onClick={() => {
                      if (selected) {
                        dispatch(removePackage(pkg.id));
                      } else if (hasPkgDynamic && defaultPkgCombo) {
                        dispatch(addPackage({ pkg, combination: defaultPkgCombo }));
                      } else {
                        dispatch(addPackage({ pkg }));
                      }
                    }}
                    aria-pressed={selected}
                    aria-label={
                      selected ? `Remove ${pkg.title} from booking` : `Select ${pkg.title}`
                    }
                    className={cn(
                      catalogCardBtnBase,
                      "shadow-md shadow-black/30",
                      selected
                        ? "border-primary-1/45 bg-gradient-to-b from-primary-1/[0.08] to-zinc-950/90 shadow-lg shadow-primary-1/[0.12]"
                        : "border-zinc-800/80 bg-zinc-950/50 hover:border-zinc-600/50 hover:bg-zinc-900/70 hover:shadow-lg hover:shadow-black/40"
                    )}
                  >
                    <div className={catalogCardImageShell}>
                      <img
                        src={pkg.image || `https://picsum.photos/seed/p-${pkg.id}/800/600`}
                        alt={pkg.title || "Package image"}
                        className={cn(
                          catalogCardImgClass,
                          selected ? "scale-[1.02] brightness-[1.03]" : "group-hover/card:scale-[1.04]"
                        )}
                      />
                      <div className={catalogCardImgOverlay} aria-hidden />
                      <span className={packageCardBadgeClass}>
                        <PackageIcon className="size-2.5 shrink-0 opacity-90 sm:size-3" aria-hidden />
                        Package
                      </span>
                      {selected && (
                        <div className={catalogSelectedCheckClass}>
                          <Check className="size-3.5 text-secondary" strokeWidth={2.5} aria-hidden />
                        </div>
                      )}
                    </div>
                    <div className={catalogCardBody}>
                      <h4 className={catalogCardTitleClass}>{pkg.title}</h4>
                      <p className={catalogCardMetaClass}>{pkgPricingSubtitle}</p>
                    </div>
                  </button>
                  {selected && hasPkgDynamic && (
                    <div className="mt-2 px-0.5 sm:px-0">
                      <div className="flex flex-wrap gap-1.5">
                        {attributeOptionsForFlatDisplay(pkg).map((opt) => {
                          const selectedIds =
                            getSelectedPackageCombination(pkg.id)?.attributeCombinationSet ?? [];
                          const isOptSelected = selectedIds.includes(opt.attributeOptionId);
                          return (
                            <button
                              key={`${opt.attributeId}-${opt.attributeOptionId}`}
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                const sameAttr = optionsWithSameAttributeId(
                                  pkg,
                                  opt.attributeId
                                );
                                const otherIds = selectedIds.filter(
                                  (id) => !sameAttr.some((o) => o.attributeOptionId === id)
                                );
                                const strippedOther = stripGuestDerivedOptionIds(pkg, otherIds);
                                const tentative = [...strippedOther, opt.attributeOptionId];
                                const merged = buildFullCombinationOptionIds(
                                  pkg,
                                  tentative,
                                  persons
                                );
                                const matched = findCombinationByOptionIds(pkg, merged);
                                if (matched) {
                                  dispatch(
                                    setPackageCombination({
                                      packageId: pkg.id,
                                      combination: matched,
                                    })
                                  );
                                }
                              }}
                              aria-pressed={isOptSelected}
                              aria-label={opt.attributeOptionName}
                              className={cn(
                                optionChipBase,
                                isOptSelected ? optionChipActive : optionChipIdle
                              )}
                            >
                              {opt.attributeOptionName}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Right panel - Date, time & availability */}
      <div className="flex min-h-0 min-w-0 w-full flex-none flex-col bg-[#161616] max-md:min-h-[min(52dvh,420px)] md:flex-1">
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
                          : "text-zinc-500 hover:text-accent hover:bg-white/[0.03]"
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

        <div
          className="min-h-0 flex-1 overflow-y-auto overscroll-y-contain px-3 py-3 pb-6 scrollbar-dark sm:px-5 sm:py-4 max-md:min-h-[min(36dvh,300px)] max-md:max-h-[min(50dvh,440px)] max-md:flex-none md:max-h-none md:flex-1"
          style={{ WebkitOverflowScrolling: "touch" } as React.CSSProperties}
        >
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
                <div className="grid touch-manipulation grid-cols-3 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-7 gap-1.5 sm:gap-1.5">
                  {slotsLoading ? (
                    <div className="col-span-full py-8 flex flex-col items-center justify-center gap-2 text-zinc-400 text-xs">
                      <Loader2 className="h-6 w-6 text-primary-1 animate-spin" aria-hidden />
                      <span>Loading available times…</span>
                    </div>
                  ) : slots.length === 0 ? (
                    <div className="col-span-full py-7 flex flex-col items-center justify-center gap-1 text-zinc-400 text-xs text-center px-3">
                      <span className="font-medium text-accent">No slots in this window</span>
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
                          "relative min-h-11 min-w-0 py-2 px-1 rounded-md border text-[11px] sm:min-h-11 sm:py-1 sm:text-xs transition-all duration-150 flex items-center justify-center leading-tight focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-1/50 focus-visible:ring-offset-1 focus-visible:ring-offset-[#141414] active:scale-[0.98]",
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
