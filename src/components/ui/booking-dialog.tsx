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
import { useCart } from "@/contexts/CartContext";
import { cn } from "@/lib/utils";
import { StepAvailabilitySelection } from "@/components/ui/booking/StepAvailabilitySelection";
import { StepFoodSelection } from "@/components/ui/booking/StepFoodSelection";
import { StepHolderDetails } from "@/components/ui/booking/StepHolderDetails";
import { StepPayment } from "@/components/ui/booking/StepPayment";
import { nextStep, prevStep, resetBooking, addActivity, addPackage, addFood, setStep, setFlowMode } from "@/store/bookingSlice";
import type { Activity, Package, Food, AttributeCombinationItem } from "@/lib/api/types";
import { X, Clock, ShoppingBag } from "lucide-react";
import { useRouter } from "next/navigation";
import { CartPopup } from "@/components/ui/CartPopup";

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
  const cart = useCart();
  const { clearCart } = cart;
  const totalItems = cart.getTotalItems();
  const shopId = useAppSelector((state) => state.shop.shopId);
  const { step, flowMode, date, timeSlot, timeOfDay, persons, holderDetails, selectedActivities, selectedPackages, selectedFoods } =
    useAppSelector((state) => state.booking);

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
  const [isCartOpen, setIsCartOpen] = React.useState(false);
  const timerRef = React.useRef<ReturnType<typeof setInterval> | null>(null);

  const minutes = Math.floor(remainingSeconds / 60);
  const seconds = remainingSeconds % 60;
  const formattedRemaining = `${minutes.toString().padStart(2, "0")}:${seconds
    .toString()
    .padStart(2, "0")}`;

  React.useEffect(() => {
    if (!isOpen) return;
    console.log("[BookingDialog] shopId:", shopId);
    clearCart();
    dispatch(resetBooking());
    if (initialActivity) {
      const combos = (initialActivity as Activity & { attributeCombinations?: AttributeCombinationItem[] })
        .attributeCombinations;
      const hasCombos = Array.isArray(combos) && combos.length > 0;
      if (hasCombos && combos![0]) {
        dispatch(addActivity({ activity: initialActivity, gameNo: 1, combination: combos![0] }));
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
      dispatch(addPackage(initialPackage));
    }
    if (initialFood) {
      dispatch(addFood({ food: initialFood, quantity: 1 }));
      if (!initialActivity && !initialPackage) {
        dispatch(setFlowMode("foodFirst"));
        dispatch(setStep(1));
      }
    }
  }, [isOpen, shopId, clearCart, dispatch]);
  React.useEffect(() => {
    if (!isOpen) {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      setRemainingSeconds(REMAINING_TIME);
      return;
    }

    if (timerRef.current) {
      clearInterval(timerRef.current);
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
  }, [isOpen]);

  React.useEffect(() => {
    if (!isOpen) return;
    if (remainingSeconds === 0) {
      setIsOpen(false);
      dispatch(resetBooking());
      clearCart();
    }
  }, [remainingSeconds, isOpen, dispatch, clearCart, setIsOpen]);

  const canProceedStep1 = timeSlot && (persons.adults + persons.kids) > 0;
  const hasSelectionStep1 = selectedActivities.length > 0 || selectedPackages.length > 0;

  const handleHolderSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    cart.addEntry({
      holderDetails,
      persons,
      date,
      timeSlot,
      timeOfDay,
      activities: selectedActivities,
      packages: selectedPackages,
      foods: selectedFoods,
    });
    dispatch(nextStep());
  };

  const handlePaymentFlowComplete = () => {
    onConfirm?.();
    dispatch(resetBooking());
    clearCart();
    setIsOpen(false);
    router.push("/orders");
  };

  const handleClose = () => {
    setIsOpen(false);
    dispatch(resetBooking());
  };

  const isStep1Availability = isFoodFirst ? step === 2 : step === 1;
  const isStep1Food = isFoodFirst ? step === 1 : step === 2;

  const handleNext = () => {
    if (isStep1Availability && !canProceedStep1) return;
    if (isStep1Availability && !hasSelectionStep1) return;
    dispatch(nextStep());
  };

  const handleSkip = () => {
    dispatch(nextStep());
  };

  const handleOpenCartPopup = () => {
    const hasCurrentBookingItems =
      selectedActivities.length > 0 || selectedPackages.length > 0 || selectedFoods.length > 0;

    // If cart is empty but booking has selected items, seed the cart from current step state.
    if (cart.getTotalItems() === 0 && hasCurrentBookingItems) {
      cart.addEntry({
        holderDetails,
        persons,
        date,
        timeSlot,
        timeOfDay,
        activities: selectedActivities,
        packages: selectedPackages,
        foods: selectedFoods,
      });
    }

    setIsCartOpen(true);
  };

  const handleBack = () => {
    if (step === 4) {
      clearCart();
    }
    dispatch(prevStep());
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
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
        <AlertDialogHeader className="relative shrink-0 place-items-stretch overflow-hidden border-b border-zinc-800/90 bg-linear-to-br from-[#1c1c1c] via-[#181818] to-[#141414] px-4 pb-4 pt-[max(0.75rem,env(safe-area-inset-top))] text-left sm:px-6 sm:pb-5 sm:pt-6">
          <div
            className="pointer-events-none absolute inset-y-0 left-0 w-1 bg-linear-to-b from-primary-1 via-primary-1/65 to-primary-1/15"
            aria-hidden
          />
          <div className=" flex flex-col  space-y-3 sm:space-y-4 pl-3 sm:pl-4 w-full">
           <div className="flex flex-row-reverse justify-between   "> <div className="  right-0 top-[max(0.75rem,env(safe-area-inset-top,0px))] z-10 flex shrink-0 items-center gap-2 sm:top-6 sm:gap-2.5">
             <div
                 className="inline-flex items-center gap-1.5 rounded-full border border-primary-1/35 bg-primary-1/10 px-2.5 py-1.5 text-xs font-semibold text-primary-1 tabular-nums shadow-sm shadow-black/20"
                 title={`${formattedRemaining} remaining`}
             >
               <Clock className="size-3.5 shrink-0 opacity-90" aria-hidden />
               <span className="hidden sm:inline">Time </span>
               <span>{formattedRemaining}</span>
             </div>
             <button
                 type="button"
                 onClick={handleClose}
                 className="flex size-9 min-h-9 min-w-9 items-center justify-center rounded-xl border border-zinc-700/80 bg-zinc-900/40 text-zinc-400 transition-colors hover:border-zinc-600 hover:bg-zinc-800/80 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-1/40 sm:size-10 sm:min-h-10 sm:min-w-10"
                 aria-label="Close dialog"
             >
               <X className="size-4" />
             </button>
           </div>
             <div className="min-w-0 pr-29 sm:pr-40">
               <p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-primary-1/90">
                 Booking flow
               </p>
               <AlertDialogTitle className="text-lg font-bold tracking-tight text-primary sm:text-xl">
                 Create booking
               </AlertDialogTitle>
             </div></div>

            <div className=" space-y-2 lg:hidden">
              <div className="flex justify-between gap-2 text-[11px] text-zinc-500">
                <span>
                  Step {step} of {STEPS.length}
                </span>
                <span className="truncate text-right font-medium text-zinc-300">{STEPS[step - 1]?.label}</span>
              </div>
              <div className="h-1 overflow-hidden rounded-full bg-zinc-800">
                <div
                  className="h-full rounded-full bg-primary-1 transition-[width] duration-300 ease-out"
                  style={{ width: `${(step / STEPS.length) * 100}%` }}
                />
              </div>
            </div>

            <div className="hidden min-w-0 lg:flex lg:justify-start">
              <div className="scrollbar-dark flex max-w-full items-center gap-1 overflow-x-auto py-0.5">
                {STEPS.map((s, i) => (
                  <React.Fragment key={`${isFoodFirst ? "f" : "a"}-${s.id}`}>
                    <div
                      className={cn(
                        "flex shrink-0 items-center gap-2 rounded-xl border px-3 py-2 text-xs font-medium transition-all",
                        step === s.id &&
                          "border-primary-1/40 bg-primary-1/12 text-primary-1 shadow-[0_0_20px_-8px_rgba(250,204,21,0.35)]",
                        step > s.id && "border-transparent text-zinc-400",
                        step < s.id && "border-transparent text-zinc-600"
                      )}
                    >
                      <span
                        className={cn(
                          "flex size-6 shrink-0 items-center justify-center rounded-full text-[10px] font-bold",
                          step === s.id && "bg-primary-1 text-zinc-900",
                          step > s.id && "bg-zinc-600 text-zinc-200",
                          step < s.id && "bg-zinc-800 text-zinc-500"
                        )}
                      >
                        {step > s.id ? "✓" : s.id}
                      </span>
                      <span className="whitespace-nowrap">{s.label}</span>
                    </div>
                    {i < STEPS.length - 1 && (
                      <span className="shrink-0 px-0.5 text-xs text-zinc-600" aria-hidden>
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
          className={cn(
            "min-h-0 flex-1 overflow-y-auto overscroll-y-contain scrollbar-dark bg-[#121212]/80",
            (isFoodFirst ? step === 2 : step === 1) ? "flex flex-col overflow-hidden" : "",
            (isFoodFirst ? step === 2 : step === 1) ? "" : "px-4 py-4 sm:px-6 sm:py-5"
          )}
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

        <AlertDialogFooter
          className={cn(
            "shrink-0 flex-row flex-wrap justify-between gap-2 border-t border-zinc-800/90 bg-[#161616]/95 px-4 py-3 backdrop-blur-sm sm:gap-3 sm:px-6 sm:py-4 sm:pb-4 pb-[max(0.75rem,env(safe-area-inset-bottom))]"
          )}
        >
          {step === 4 ? (
            <>
              <div className="flex items-center gap-1.5 sm:gap-2">
                <AlertDialogCancel
                  onClick={handleClose}
                  className="m-0 min-h-10 cursor-pointer rounded-xl border border-zinc-700/90 bg-zinc-900/30 px-3 py-2 text-sm text-zinc-300 transition-colors hover:border-primary-1/35 hover:bg-zinc-800/60 hover:text-white focus-visible:ring-primary-1/50 sm:min-h-11 sm:px-4"
                >
                  Cancel
                </AlertDialogCancel>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleBack}
                  className="min-h-10 cursor-pointer rounded-xl border border-zinc-700/90 bg-zinc-900/30 px-3 py-2 text-sm text-zinc-300 transition-colors hover:border-primary-1/35 hover:bg-zinc-800/60 hover:text-white focus-visible:ring-primary-1/50 sm:min-h-11 sm:px-4"
                >
                  Back
                </Button>
              </div>
              <div className="flex items-center gap-1.5 sm:gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleOpenCartPopup}
                  className="min-h-10 cursor-pointer rounded-xl border border-zinc-700/90 bg-zinc-900/30 px-3 py-2 text-sm text-zinc-300 transition-colors hover:border-primary-1/35 hover:bg-zinc-800/60 hover:text-white focus-visible:ring-primary-1/50 sm:min-h-11 sm:px-4"
                >
                  <ShoppingBag className="w-4 h-4" />
                  Cart
                </Button>
              </div>
            </>
          ) : (
            <>
              <div className="flex items-center gap-1.5 sm:gap-2">
                <AlertDialogCancel
                  onClick={handleClose}
                  className="m-0 min-h-10 cursor-pointer rounded-xl border border-zinc-700/90 bg-zinc-900/30 px-3 py-2 text-sm text-zinc-300 transition-colors hover:border-primary-1/35 hover:bg-zinc-800/60 hover:text-white focus-visible:ring-primary-1/50 sm:min-h-11 sm:px-4"
                >
                  Cancel
                </AlertDialogCancel>
                {step > 1 && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleBack}
                    className="min-h-10 cursor-pointer rounded-xl border border-zinc-700/90 bg-zinc-900/30 px-3 py-2 text-sm text-zinc-300 transition-colors hover:border-primary-1/35 hover:bg-zinc-800/60 hover:text-white focus-visible:ring-primary-1/50 sm:min-h-11 sm:px-4"
                  >
                    Back
                  </Button>
                )}
              </div>
              <div className="flex items-center gap-1.5 sm:gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleOpenCartPopup}
                  className="min-h-10 cursor-pointer rounded-xl border border-zinc-700/90 bg-zinc-900/30 px-3 py-2 text-sm text-zinc-300 transition-colors hover:border-primary-1/35 hover:bg-zinc-800/60 hover:text-white focus-visible:ring-primary-1/50 sm:min-h-11 sm:px-4"
                >
                  <ShoppingBag className="w-4 h-4" />
                  Cart
                </Button>
                {step === 1 && (
                  <Button
                    type="button"
                    disabled={isStep1Availability && (!canProceedStep1 || !hasSelectionStep1)}
                    onClick={handleNext}
                    className="min-h-10 cursor-pointer rounded-xl bg-primary-1 px-4 py-2 text-sm font-semibold text-black shadow-sm shadow-primary-1/15 transition-all hover:bg-primary-1-hover hover:shadow-[0_0_24px_rgba(255,236,0,0.28)] disabled:opacity-50 focus-visible:ring-primary-1/50 sm:min-h-11 sm:px-5"
                  >
                    Next
                  </Button>
                )}
                {step === 2 && (
                  <>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleSkip}
                      aria-label="Skip food selection"
                      className="min-h-10 cursor-pointer rounded-xl border border-zinc-700/90 bg-zinc-900/20 px-3 py-2 text-sm text-zinc-500 transition-colors hover:border-zinc-600 hover:bg-zinc-800/50 hover:text-zinc-200 focus-visible:ring-primary-1/50 sm:min-h-11 sm:px-4"
                    >
                      Skip
                    </Button>
                    <Button
                      type="button"
                      disabled={isStep1Availability && (!canProceedStep1 || !hasSelectionStep1)}
                      onClick={handleNext}
                      className="min-h-10 cursor-pointer rounded-xl bg-primary-1 px-4 py-2 text-sm font-semibold text-black shadow-sm shadow-primary-1/15 transition-all hover:bg-primary-1-hover hover:shadow-[0_0_24px_rgba(255,236,0,0.28)] disabled:opacity-50 focus-visible:ring-primary-1/50 sm:min-h-11 sm:px-5"
                    >
                      Next
                    </Button>
                  </>
                )}
                {step === 3 && (
                  <Button
                    type="submit"
                    form="bookingForm"
                    className="min-h-10 cursor-pointer rounded-xl bg-primary-1 px-4 py-2 text-sm font-semibold text-black shadow-sm shadow-primary-1/15 transition-all hover:bg-primary-1-hover hover:shadow-[0_0_24px_rgba(255,236,0,0.28)] focus-visible:ring-primary-1/50 sm:min-h-11 sm:px-5"
                  >
                    Continue to payment
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
