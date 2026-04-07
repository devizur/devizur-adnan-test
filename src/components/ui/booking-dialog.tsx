"use client";

import * as React from "react";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { useAppDispatch, useAppSelector } from "@/store";
import { store } from "@/store/store";
import { useCart } from "@/contexts/CartContext";
import { cn, displayTimeToApiSlot } from "@/lib/utils";
import { bookingApi } from "@/lib/api/services";
import { toast } from "sonner";
import { StepAvailabilitySelection } from "@/components/ui/booking/StepAvailabilitySelection";
import { getProductCombinations, pickDefaultCombination } from "@/lib/booking/catalog-selection";
import { StepFoodSelection } from "@/components/ui/booking/StepFoodSelection";
import { StepHolderDetails } from "@/components/ui/booking/StepHolderDetails";
import { StepPayment } from "@/components/ui/booking/StepPayment";
import {
  nextStep,
  prevStep,
  resetBooking,
  addActivity,
  addPackage,
  addFood,
  setStep,
  setFlowMode,
  setBookingReferenceId,
} from "@/store/bookingSlice";
import type { Activity, Package, Food } from "@/lib/api/types";
import { X, Clock, ShoppingBag } from "lucide-react";
import { useRouter } from "next/navigation";
import { CartPopup } from "@/components/ui/CartPopup";
import { useQueryClient } from "@tanstack/react-query";

const REMAINING_TIME = 60 * 10; // 10 minutes
const STEPS_ACTIVITY_FIRST = [
  { id: 1, label: "Availability & Selection" },
  { id: 2, label: "Food Selection" },
  { id: 3, label: "Booking Holder Details" },
  { id: 4, label: "Payment" },
] as const;

const STEPS_FOOD_FIRST = [
  { id: 1, label: "Food Selection" },
  { id: 2, label: "Availability & Selection" },
  { id: 3, label: "Booking Holder Details" },
  { id: 4, label: "Payment" },
] as const;

const bookingFooterBar =
  "shrink-0 flex flex-row flex-wrap items-center justify-between gap-x-2 gap-y-1.5 border-t border-white/[0.06] bg-[#141414]/95 px-3 py-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] sm:px-5 sm:py-2.5";

const bookingFooterBtnSecondary =
  "m-0 h-8 min-h-8 gap-1.5 rounded-md border border-white/[0.08] bg-[#1c1c1c] px-2.5 text-xs font-medium text-accent shadow-sm shadow-black/15 transition-colors hover:border-white/[0.12] hover:bg-[#252525] hover:text-white focus-visible:ring-2 focus-visible:ring-primary-1/35 focus-visible:ring-offset-2 focus-visible:ring-offset-[#141414] [&_svg]:size-3.5";

const bookingFooterBtnPrimary =
  "h-8 min-h-8 rounded-md border border-zinc-700/60 bg-primary-1 px-3 text-xs font-semibold text-secondary shadow-sm shadow-black/20 transition-all hover:brightness-110 focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary-1/45 disabled:opacity-45 disabled:hover:brightness-100";

const bookingFooterBtnMuted =
  "h-8 min-h-8 gap-1.5 rounded-md border border-white/[0.06] bg-transparent px-2.5 text-xs font-medium text-zinc-500 transition-colors hover:border-white/[0.1] hover:bg-white/[0.04] hover:text-accent focus-visible:ring-2 focus-visible:ring-primary-1/35 focus-visible:ring-offset-2 focus-visible:ring-offset-[#141414] [&_svg]:size-3.5";

interface BookingDialogProps {
  children: React.ReactNode;

  initialActivity?: Activity;

  initialPackage?: Package;

  initialFood?: Food;
  onConfirm?: () => void;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function BookingDialog({
  children,
  initialActivity,
  initialPackage,
  initialFood,
  onConfirm,
  open: openControlled,
  onOpenChange: onOpenChangeControlled,
}: BookingDialogProps) {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const queryClient = useQueryClient();
  const cart = useCart();
  const { clearCart, syncBookingEntry } = cart;
  /** Cart only reflects the current reserved slot — no sync before reserveBooking succeeds */
  const [cartSyncedAfterReserve, setCartSyncedAfterReserve] = React.useState(false);
  const totalItems = cart.getTotalItems();
  const {
    step,
    flowMode,
    date,
    timeSlot,
    timeOfDay,
    persons,
    holderDetails,
    selectedActivities,
    selectedPackages,
    selectedFoods,
    bookingReferenceId,
  } = useAppSelector((state) => state.booking);

  const isFoodFirst = flowMode === "foodFirst";
  const STEPS = isFoodFirst ? STEPS_FOOD_FIRST : STEPS_ACTIVITY_FIRST;

  const [uncontrolledOpen, setUncontrolledOpen] = React.useState(false);
  const isControlled = openControlled !== undefined;
  const isOpen = isControlled ? openControlled : uncontrolledOpen;
  const setIsOpen = React.useCallback(
    (next: boolean) => {
      if (isControlled) {
        onOpenChangeControlled?.(next);
      } else {
        setUncontrolledOpen(next);
      }
    },
    [isControlled, onOpenChangeControlled]
  );

  const [remainingSeconds, setRemainingSeconds] = React.useState(REMAINING_TIME);
  /** Countdown runs only after reserveBooking succeeds; cleared on unreserve / close */
  const [bookingTimerActive, setBookingTimerActive] = React.useState(false);
  const [isCartOpen, setIsCartOpen] = React.useState(false);
  const [reserveSubmitting, setReserveSubmitting] = React.useState(false);
  /** True after successful POST reserveBooking until unreserve or dialog reset */
  const slotReservedRef = React.useRef(false);
  const timerRef = React.useRef<ReturnType<typeof setInterval> | null>(null);

  const tryUnreserveSlot = React.useCallback(async () => {
    if (!slotReservedRef.current) return;
    const ref = store.getState().booking.bookingReferenceId?.trim();
    if (!ref) {
      slotReservedRef.current = false;
      return;
    }
    try {
      await bookingApi.unreserveBooking({ bookingReferenceId: ref });
      slotReservedRef.current = false;
      dispatch(setBookingReferenceId(""));
      queryClient.invalidateQueries({ queryKey: ["availability"] });
      queryClient.invalidateQueries({ queryKey: ["booking", "itemSteps"] });
      setBookingTimerActive(false);
      setRemainingSeconds(REMAINING_TIME);
      clearCart();
      setCartSyncedAfterReserve(false);
    } catch {
      /* non-blocking: user can still change slot or retry */
    }
  }, [dispatch, queryClient, clearCart]);

  const minutes = Math.floor(remainingSeconds / 60);
  const seconds = remainingSeconds % 60;
  const formattedRemaining = `${minutes.toString().padStart(2, "0")}:${seconds
    .toString()
    .padStart(2, "0")}`;

  React.useEffect(() => {
    if (!isOpen) return;
    slotReservedRef.current = false;
    clearCart();
    dispatch(resetBooking());
    const personsAfterReset = store.getState().booking.persons;
    if (initialActivity) {
      const hasCombos = getProductCombinations(initialActivity).length > 0;
      const defaultCombo = pickDefaultCombination(initialActivity, personsAfterReset);
      if (hasCombos && defaultCombo) {
        dispatch(addActivity({ activity: initialActivity, gameNo: 1, combination: defaultCombo }));
      } else {
        const allowedValues =
          initialActivity.games && initialActivity.games.length > 0
            ? initialActivity.games
            : [1, 2, 3];
        const defaultGameNo = (allowedValues[0] ?? 1) as 1 | 2 | 3;
        dispatch(addActivity({ activity: initialActivity, gameNo: defaultGameNo }));
      }
    }
    if (initialPackage) {
      const defaultPkgCombo = pickDefaultCombination(initialPackage, personsAfterReset);
      if (getProductCombinations(initialPackage).length > 0 && defaultPkgCombo) {
        dispatch(addPackage({ pkg: initialPackage, combination: defaultPkgCombo }));
      } else {
        dispatch(addPackage({ pkg: initialPackage }));
      }
    }
    if (initialFood) {
      dispatch(addFood({ food: initialFood, quantity: 1 }));
      if (!initialActivity && !initialPackage) {
        dispatch(setFlowMode("foodFirst"));
        dispatch(setStep(1));
      }
    }
    setBookingTimerActive(false);
    setRemainingSeconds(REMAINING_TIME);
    setCartSyncedAfterReserve(false);
  }, [isOpen, clearCart, dispatch]);

  /** After reserve: keep cart aligned with Redux (food, holder, etc.) — never before reserve. */
  React.useEffect(() => {
    if (!isOpen || !cartSyncedAfterReserve) return;
    const hasSchedule =
      Boolean(date && timeSlot.trim()) && (persons.adults + persons.kids) > 0;
    const hasLineItems =
      selectedActivities.length > 0 ||
      selectedPackages.length > 0 ||
      selectedFoods.length > 0;
    if (!hasSchedule || !hasLineItems) return;

    syncBookingEntry({
      holderDetails,
      persons,
      date,
      timeSlot,
      timeOfDay,
      activities: selectedActivities.map(({ activity, gameNo }) => ({ activity, gameNo })),
      packages: selectedPackages,
      foods: selectedFoods.map(({ food, quantity }) => ({ food, quantity })),
    });
  }, [
    isOpen,
    cartSyncedAfterReserve,
    date,
    timeSlot,
    timeOfDay,
    persons,
    holderDetails,
    selectedActivities,
    selectedPackages,
    selectedFoods,
    syncBookingEntry,
  ]);

  React.useEffect(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    if (!isOpen) {
      setBookingTimerActive(false);
      setRemainingSeconds(REMAINING_TIME);
      return;
    }

    if (!bookingTimerActive) {
      return;
    }

    timerRef.current = setInterval(() => {
      setRemainingSeconds((prev) => {
        if (prev <= 1) {
          if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [isOpen, bookingTimerActive]);

  React.useEffect(() => {
    if (!isOpen || remainingSeconds !== 0) return;

    let cancelled = false;
    void (async () => {
      await tryUnreserveSlot();
      if (cancelled) return;
      slotReservedRef.current = false;
      setBookingTimerActive(false);
      setCartSyncedAfterReserve(false);
      dispatch(resetBooking());
      clearCart();
      queryClient.invalidateQueries({ queryKey: ["availability"] });
      queryClient.invalidateQueries({ queryKey: ["booking", "itemSteps"] });
      toast.info("Your hold expired. This window closed and your cart was cleared.", {
        duration: 8000,
      });
      setIsOpen(false);
    })();

    return () => {
      cancelled = true;
    };
  }, [
    remainingSeconds,
    isOpen,
    dispatch,
    clearCart,
    setIsOpen,
    tryUnreserveSlot,
    queryClient,
  ]);

  const canProceedStep1 = timeSlot && (persons.adults + persons.kids) > 0;
  const hasSelectionStep1 = selectedActivities.length > 0 || selectedPackages.length > 0;

  const handleHolderSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    syncBookingEntry({
      holderDetails,
      persons,
      date,
      timeSlot,
      timeOfDay,
      activities: selectedActivities.map(({ activity, gameNo }) => ({ activity, gameNo })),
      packages: selectedPackages,
      foods: selectedFoods.map(({ food, quantity }) => ({ food, quantity })),
    });
    dispatch(nextStep());
  };

  const handlePaymentFlowComplete = () => {
    onConfirm?.();
    setCartSyncedAfterReserve(false);
    dispatch(resetBooking());
    clearCart();
    setIsOpen(false);
    router.push("/orders");
  };

  const handleClose = () => {
    void tryUnreserveSlot();
    setCartSyncedAfterReserve(false);
    clearCart();
    setIsOpen(false);
    dispatch(resetBooking());
  };

  const isStep1Availability = isFoodFirst ? step === 2 : step === 1;
  const isStep1Food = isFoodFirst ? step === 1 : step === 2;

  const handleNext = async () => {
    if (isStep1Availability && !canProceedStep1) return;
    if (isStep1Availability && !hasSelectionStep1) return;

    if (isStep1Availability) {
      const ref = bookingReferenceId?.trim();
      if (!ref) {
        toast.error('Run "Check availability" first to get a booking reference.');
        return;
      }
      setReserveSubmitting(true);
      try {
        await bookingApi.reserveBooking({
          bookingReferenceId: ref,
          selectedSlot: displayTimeToApiSlot(timeSlot),
          selectedDate: date,
        });
        slotReservedRef.current = true;
        clearCart();
        syncBookingEntry({
          holderDetails,
          persons,
          date,
          timeSlot,
          timeOfDay,
          activities: selectedActivities.map(({ activity, gameNo }) => ({ activity, gameNo })),
          packages: selectedPackages,
          foods: selectedFoods.map(({ food, quantity }) => ({ food, quantity })),
        });
        setCartSyncedAfterReserve(true);
        setRemainingSeconds(REMAINING_TIME);
        setBookingTimerActive(true);
        dispatch(nextStep());
      } catch (err) {
        const msg =
          err instanceof Error ? err.message : "Could not reserve this time slot.";
        toast.error(msg);
      } finally {
        setReserveSubmitting(false);
      }
      return;
    }

    dispatch(nextStep());
  };

  const handleSkip = () => {
    dispatch(nextStep());
  };

  const handleOpenCartPopup = () => {
    const hasSchedule =
      Boolean(date && timeSlot.trim()) && (persons.adults + persons.kids) > 0;
    const hasLineItems =
      selectedActivities.length > 0 ||
      selectedPackages.length > 0 ||
      selectedFoods.length > 0;
    if (
      cartSyncedAfterReserve &&
      cart.getTotalItems() === 0 &&
      hasSchedule &&
      hasLineItems
    ) {
      syncBookingEntry({
        holderDetails,
        persons,
        date,
        timeSlot,
        timeOfDay,
        activities: selectedActivities.map(({ activity, gameNo }) => ({ activity, gameNo })),
        packages: selectedPackages,
        foods: selectedFoods.map(({ food, quantity }) => ({ food, quantity })),
      });
    }
    setIsCartOpen(true);
  };

  const handleBack = () => {
    if (step === 4) {
      clearCart();
    }
    // Leaving food step back to availability — release previous slot reservation
    if (step === 2) {
      void tryUnreserveSlot();
    }
    dispatch(prevStep());
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      void tryUnreserveSlot();
      setCartSyncedAfterReserve(false);
      clearCart();
      dispatch(resetBooking());
    }
    setIsOpen(open);
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={handleOpenChange}>
      <AlertDialogTrigger asChild>{children}</AlertDialogTrigger>
      <AlertDialogContent
        className={cn(
          "flex flex-col gap-0 overflow-hidden border-0 bg-transparent p-0 text-primary shadow-none outline-none focus-visible:ring-0",
          "max-sm:inset-0 max-sm:top-0 max-sm:left-0 max-sm:right-0 max-sm:bottom-0 max-sm:translate-x-0 max-sm:translate-y-0 max-sm:h-full max-sm:min-h-dvh max-sm:max-h-dvh max-sm:w-full max-sm:min-w-0 max-sm:max-w-none max-sm:rounded-none",
          "sm:min-w-[90%] sm:max-w-4xl sm:h-[90vh] sm:rounded-2xl"
        )}
      >
        <div
          className={cn(
            "flex h-full min-h-0 flex-col overflow-hidden rounded-none border-0 bg-[#141414] sm:rounded-2xl",
            "sm:border sm:border-zinc-700/70",
            "sm:shadow-[0_0_0_1px_rgba(250,204,21,0.1),0_28px_90px_-24px_rgba(0,0,0,0.75)]"
          )}
        >
        <AlertDialogHeader className="relative shrink-0 place-items-stretch overflow-hidden border-b border-white/[0.06] bg-[#161616] px-3 pb-2.5 pt-[max(0.5rem,env(safe-area-inset-top))] text-left sm:px-4 sm:pb-3 sm:pt-3.5">
          <div
            className="pointer-events-none absolute inset-y-2 left-0 w-px rounded-full bg-linear-to-b from-primary-1/90 via-primary-1/45 to-primary-1/10 sm:inset-y-1.5"
            aria-hidden
          />
          <div className="w-full space-y-2 pl-2.5 sm:space-y-2 sm:pl-3">
            <div className="absolute right-3 top-[max(0.5rem,env(safe-area-inset-top,0px))] z-10 flex shrink-0 items-center gap-1.5 sm:right-4 sm:top-3.5">
              {bookingTimerActive ? (
                <div
                  role="status"
                  aria-live="polite"
                  aria-label={`${formattedRemaining} left to complete checkout`}
                  title={`Finish checkout within ${formattedRemaining}, or your reserved slot will be released.`}
                  className="inline-flex items-center gap-1 rounded-md border border-primary-1/30 bg-primary-1/[0.08] px-2 py-1 text-[10px] font-semibold text-primary-1 shadow-sm shadow-black/15"
                >
                  <Clock className="size-3 shrink-0 opacity-90" aria-hidden />
                  <span className="min-w-0 shrink-0 text-primary-1/85">Time left:</span>
                  <span className="tabular-nums text-primary-1">{formattedRemaining}</span>
                </div>
              ) : null}
              <button
                type="button"
                onClick={handleClose}
                className="flex size-8 min-h-8 min-w-8 items-center justify-center rounded-md border border-white/[0.08] bg-[#1c1c1c] text-zinc-400 shadow-sm shadow-black/10 transition-colors hover:border-white/[0.12] hover:bg-[#252525] hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-1/35 focus-visible:ring-offset-2 focus-visible:ring-offset-[#161616]"
                aria-label="Close dialog"
              >
                <X className="size-3.5" />
              </button>
            </div>
            <div
              className={cn(
                "min-w-0",
                bookingTimerActive ? "pr-[5.5rem] sm:pr-[6.75rem]" : "pr-11 sm:pr-12"
              )}
            >
              <AlertDialogTitle className="text-base font-semibold leading-tight tracking-tight text-zinc-100 sm:text-[1.0625rem]">
                Create booking
              </AlertDialogTitle>
            </div>

            <div className="space-y-1.5 lg:hidden">
              <div className="flex justify-between gap-2 text-[10px] text-zinc-500">
                <span className="tabular-nums">
                  Step {step} of {STEPS.length}
                </span>
                <span className="max-w-[58%] truncate text-right font-medium text-zinc-400">
                  {STEPS[step - 1]?.label}
                </span>
              </div>
              <div className="h-0.5 overflow-hidden rounded-full bg-zinc-800/90">
                <div
                  className="h-full rounded-full bg-primary-1 transition-[width] duration-300 ease-out"
                  style={{ width: `${(step / STEPS.length) * 100}%` }}
                />
              </div>
            </div>

            <div className="hidden min-w-0 lg:flex lg:justify-start">
              <div className="scrollbar-dark flex max-w-full items-center gap-0.5 overflow-x-auto py-0.5">
                {STEPS.map((s, i) => (
                  <React.Fragment key={`${isFoodFirst ? "f" : "a"}-${s.id}`}>
                    <div
                      className={cn(
                        "flex shrink-0 items-center gap-1.5 rounded-md border px-2 py-1 text-[11px] font-medium transition-all",
                        step === s.id &&
                          "border-primary-1/35 bg-primary-1/[0.1] text-primary-1 shadow-sm shadow-primary-1/10",
                        step > s.id && "border-transparent text-zinc-500",
                        step < s.id && "border-transparent text-zinc-600"
                      )}
                    >
                      <span
                        className={cn(
                          "flex size-5 shrink-0 items-center justify-center rounded-full text-[9px] font-bold leading-none",
                          step === s.id && "bg-primary-1 text-zinc-900",
                          step > s.id && "bg-zinc-600 text-zinc-200",
                          step < s.id && "bg-zinc-800 text-zinc-500"
                        )}
                      >
                        {step > s.id ? "✓" : s.id}
                      </span>
                      <span className="max-w-[9.5rem] truncate whitespace-nowrap">{s.label}</span>
                    </div>
                    {i < STEPS.length - 1 && (
                      <span className="shrink-0 px-0.5 text-[10px] text-zinc-600" aria-hidden>
                        ›
                      </span>
                    )}
                  </React.Fragment>
                ))}
              </div>
            </div>
          </div>
        </AlertDialogHeader>

        <div
          className="min-h-0 flex-1 flex flex-col overflow-hidden overscroll-y-contain scrollbar-dark bg-[#121212]/80"
          style={{ WebkitOverflowScrolling: "touch" } as React.CSSProperties}
        >
          {isFoodFirst ? (
            <>
              {step === 1 && <StepFoodSelection />}
              {step === 2 && <StepAvailabilitySelection />}
              {step === 3 && <StepHolderDetails onSubmit={handleHolderSubmit} />}
              {step === 4 && <StepPayment onFlowComplete={handlePaymentFlowComplete} />}
            </>
          ) : (
            <>
              {step === 1 && <StepAvailabilitySelection />}
              {step === 2 && <StepFoodSelection />}
              {step === 3 && <StepHolderDetails onSubmit={handleHolderSubmit} />}
              {step === 4 && <StepPayment onFlowComplete={handlePaymentFlowComplete} />}
            </>
          )}
        </div>

        <AlertDialogFooter className={cn(bookingFooterBar)}>
          {step === 4 ? (
            <>
              <div className="flex flex-wrap items-center gap-1.5">
                <AlertDialogCancel
                  onClick={handleClose}
                  className={cn(bookingFooterBtnSecondary, "cursor-pointer")}
                >
                  Cancel
                </AlertDialogCancel>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleBack}
                  className={cn(bookingFooterBtnSecondary, "cursor-pointer")}
                >
                  Back
                </Button>
              </div>
              <div className="flex flex-wrap items-center gap-1.5">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleOpenCartPopup}
                  className={cn(bookingFooterBtnSecondary, "cursor-pointer")}
                  aria-label={`Cart${totalItems > 0 ? `, ${totalItems} items` : ""}`}
                >
                  <ShoppingBag className="shrink-0" aria-hidden />
                  <span>Cart</span>
                  {totalItems > 0 ? (
                    <span className="min-w-[1.125rem] rounded bg-primary-1/20 px-1 text-[10px] font-semibold tabular-nums text-primary-1">
                      {totalItems}
                    </span>
                  ) : null}
                </Button>
              </div>
            </>
          ) : (
            <>
              <div className="flex flex-wrap items-center gap-1.5">
                <AlertDialogCancel
                  onClick={handleClose}
                  className={cn(bookingFooterBtnSecondary, "cursor-pointer")}
                >
                  Cancel
                </AlertDialogCancel>
                {step > 1 && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleBack}
                    className={cn(bookingFooterBtnSecondary, "cursor-pointer")}
                  >
                    Back
                  </Button>
                )}
              </div>
              <div className="flex flex-wrap items-center justify-end gap-1.5 sm:ml-auto">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleOpenCartPopup}
                  className={cn(bookingFooterBtnSecondary, "cursor-pointer")}
                  aria-label={`Cart${totalItems > 0 ? `, ${totalItems} items` : ""}`}
                >
                  <ShoppingBag className="shrink-0" aria-hidden />
                  <span>Cart</span>
                  {totalItems > 0 ? (
                    <span className="min-w-[1.125rem] rounded bg-primary-1/20 px-1 text-[10px] font-semibold tabular-nums text-primary-1">
                      {totalItems}
                    </span>
                  ) : null}
                </Button>
                {step === 1 && (
                  <Button
                    type="button"
                    disabled={
                      isStep1Availability &&
                      (!canProceedStep1 || !hasSelectionStep1 || reserveSubmitting)
                    }
                    onClick={() => void handleNext()}
                    className={cn(bookingFooterBtnPrimary, "cursor-pointer")}
                  >
                    {isStep1Availability && reserveSubmitting ? "Saving…" : "Next"}
                  </Button>
                )}
                {step === 2 && (
                  <>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleSkip}
                      aria-label="Skip food selection"
                      className={cn(bookingFooterBtnMuted, "cursor-pointer")}
                    >
                      Skip
                    </Button>
                    <Button
                      type="button"
                      disabled={
                        isStep1Availability &&
                        (!canProceedStep1 || !hasSelectionStep1 || reserveSubmitting)
                      }
                      onClick={() => void handleNext()}
                      className={cn(bookingFooterBtnPrimary, "cursor-pointer")}
                    >
                      {isStep1Availability && reserveSubmitting ? "Saving…" : "Next"}
                    </Button>
                  </>
                )}
                {step === 3 && (
                  <Button
                    type="submit"
                    form="bookingForm"
                    className={cn(bookingFooterBtnPrimary, "cursor-pointer")}
                  >
                    <span className="sm:hidden">Continue</span>
                    <span className="hidden sm:inline">Continue to payment</span>
                  </Button>
                )}
              </div>
            </>
          )}
        </AlertDialogFooter>
        <CartPopup open={isCartOpen} onOpenChange={setIsCartOpen} />
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
}
