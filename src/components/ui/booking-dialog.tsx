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
import { Step1AvailabilitySelection } from "@/components/ui/booking/Step1AvailabilitySelection";
import { Step2FoodSelection } from "@/components/ui/booking/Step2FoodSelection";
import { Step3HolderDetails } from "@/components/ui/booking/Step3HolderDetails";
import { nextStep, prevStep, resetBooking, addActivity, addPackage, addFood, setStep, setFlowMode } from "@/store/bookingSlice";
import type { Activity, Package, Food, AttributeCombinationItem } from "@/lib/api/types";
import { X, Clock } from "lucide-react";

const REMAINING_TIME = 60 * 5; // 5 minutes
const STEPS_ACTIVITY_FIRST = [
  { id: 1, label: "Availability & Selection" },
  { id: 2, label: "Food Selection" },
  { id: 3, label: "Booking Holder Details" },
] as const;

const STEPS_FOOD_FIRST = [
  { id: 1, label: "Food Selection" },
  { id: 2, label: "Availability & Selection" },
  { id: 3, label: "Booking Holder Details" },
] as const;

interface BookingDialogProps {
  children: React.ReactNode;
  /** When provided (e.g. from "Book Now" on a card), dialog opens with this activity pre-selected in step 1 */
  initialActivity?: Activity;
  /** When provided, dialog opens with this package pre-selected in step 1 */
  initialPackage?: Package;
  /** When provided, dialog opens with this food pre-selected in step 2 */
  initialFood?: Food;
  onConfirm?: () => void;
}

export function BookingDialog({
  children,
  initialActivity,
  initialPackage,
  initialFood,
  onConfirm,
}: BookingDialogProps) {
  const dispatch = useAppDispatch();
  const cart = useCart();
  const shopId = useAppSelector((state) => state.shop.shopId);
  const { step, flowMode, date, timeSlot, timeOfDay, persons, holderDetails, selectedActivities, selectedPackages, selectedFoods } =
    useAppSelector((state) => state.booking);

  const isFoodFirst = flowMode === "foodFirst";
  const STEPS = isFoodFirst ? STEPS_FOOD_FIRST : STEPS_ACTIVITY_FIRST;

  const [isOpen, setIsOpen] = React.useState(false);

  const [remainingSeconds, setRemainingSeconds] = React.useState(REMAINING_TIME);
  const timerRef = React.useRef<ReturnType<typeof setInterval> | null>(null);

  const minutes = Math.floor(remainingSeconds / 60);
  const seconds = remainingSeconds % 60;
  const formattedRemaining = `${minutes.toString().padStart(2, "0")}:${seconds
    .toString()
    .padStart(2, "0")}`;

  React.useEffect(() => {
    if (!isOpen) return;
    console.log("[BookingDialog] shopId:", shopId);
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
  }, [isOpen, shopId]); // eslint-disable-line react-hooks/exhaustive-deps -- only when dialog opens

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
    }
  }, [remainingSeconds, isOpen, dispatch]);

  const canProceedStep1 = timeSlot && (persons.adults + persons.kids) > 0;
  const hasSelectionStep1 = selectedActivities.length > 0 || selectedPackages.length > 0;

  const handleAddBooking = (e?: React.FormEvent) => {
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
    onConfirm?.();
    dispatch(resetBooking());
    setIsOpen(false);
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

  const handleBack = () => {
    dispatch(prevStep());
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) dispatch(resetBooking());
    setIsOpen(open);
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={handleOpenChange}>
      <AlertDialogTrigger asChild>{children}</AlertDialogTrigger>
      <AlertDialogContent
        className={cn(
          "flex flex-col bg-[#161616] p-0 gap-0 text-white overflow-hidden",
          "max-sm:inset-0 max-sm:top-0 max-sm:left-0 max-sm:right-0 max-sm:bottom-0 max-sm:translate-x-0 max-sm:translate-y-0 max-sm:w-full max-sm:h-full max-sm:min-w-0 max-sm:max-w-none max-sm:min-h-dvh max-sm:max-h-dvh max-sm:rounded-none max-sm:border-0",
          "sm:min-w-[90%] sm:max-w-4xl sm:h-[90vh] sm:rounded-2xl sm:border sm:border-gray-800/80"
        )}
      >
        <AlertDialogHeader className="px-4 sm:px-6 pt-[max(0.75rem,env(safe-area-inset-top))] sm:pt-6 pb-3 sm:pb-5 border-b border-gray-800/80 shrink-0">
          <div className="flex items-center justify-between gap-4 w-full min-w-0">
            <AlertDialogTitle className="text-base sm:text-lg font-semibold text-white whitespace-nowrap shrink-0">
              Create booking
            </AlertDialogTitle>

            <div className="flex items-center min-w-0 flex-1 overflow-x-auto scrollbar-dark justify-center py-1">
              <div className="flex items-center gap-2 shrink-0">
                {STEPS.map((s, i) => (
                  <React.Fragment key={`${isFoodFirst ? "f" : "a"}-${s.id}`}>
                    <div
                      className={cn(
                        "flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg text-xs font-medium transition-colors shrink-0",
                        step === s.id && "bg-primary-1/15 text-primary-1",
                        step > s.id && "text-gray-400",
                        step < s.id && "text-gray-500"
                      )}
                    >
                      <span
                        className={cn(
                          "flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-semibold shrink-0",
                          step === s.id && "bg-primary-1 text-black",
                          step > s.id && "bg-gray-700 text-gray-300",
                          step < s.id && "bg-gray-800 text-gray-500"
                        )}
                      >
                        {step > s.id ? "✓" : s.id}
                      </span>
                      <span className="whitespace-nowrap">{s.label}</span>
                    </div>
                    {i < STEPS.length - 1 && (
                      <span className="text-gray-700 px-1 shrink-0 text-xs">›</span>
                    )}
                  </React.Fragment>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <span
                className="flex items-center gap-1.5 text-xs font-medium text-primary-1 whitespace-nowrap"
                title={`${formattedRemaining} left`}
              >
                <Clock className="w-3.5 h-3.5 shrink-0" />
                {formattedRemaining}<span className="hidden sm:inline"> left</span>
              </span>
              <button
                type="button"
                onClick={handleClose}
                className="min-h-9 min-w-9 sm:min-h-10 sm:min-w-10 p-2 rounded-xl text-gray-400 hover:text-white hover:bg-[#1e1e1e] transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-1/50 focus-visible:ring-offset-2 focus-visible:ring-offset-[#161616] flex items-center justify-center"
                aria-label="Close dialog"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </AlertDialogHeader>

        <div
          className={cn(
            "flex-1 min-h-0 scrollbar-dark overflow-y-auto overscroll-y-contain",
            (isFoodFirst ? step === 2 : step === 1) ? "flex flex-col overflow-hidden" : "",
            (isFoodFirst ? step === 2 : step === 1) ? "" : "px-4 py-4 sm:px-6 sm:py-5"
          )}
          style={{ WebkitOverflowScrolling: "touch" } as React.CSSProperties}
        >
          {isFoodFirst ? (
            <>
              {step === 1 && <Step2FoodSelection />}
              {step === 2 && <Step1AvailabilitySelection />}
              {step === 3 && <Step3HolderDetails onSubmit={handleAddBooking} />}
            </>
          ) : (
            <>
              {step === 1 && <Step1AvailabilitySelection />}
              {step === 2 && <Step2FoodSelection />}
              {step === 3 && <Step3HolderDetails onSubmit={handleAddBooking} />}
            </>
          )}
        </div>

        <AlertDialogFooter
          className={cn(
            "px-4 sm:px-6 py-3 sm:py-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:pb-4 border-t border-gray-800/80 flex-row justify-between gap-2 sm:gap-3 flex-wrap bg-[#161616] shrink-0"
          )}
        >
          <div className="flex items-center gap-1.5 sm:gap-2">
            <AlertDialogCancel
              onClick={handleClose}
              className="m-0 min-h-10 sm:min-h-11 px-3 sm:px-4 py-2 text-sm border border-gray-700 text-gray-300 bg-transparent hover:bg-gray-800/80 hover:border-primary-1/40 hover:text-white rounded-xl cursor-pointer transition-colors focus-visible:ring-primary-1/50"
            >
              Cancel
            </AlertDialogCancel>
            {step > 1 && (
              <Button
                type="button"
                variant="outline"
                onClick={handleBack}
                className="min-h-10 sm:min-h-11 px-3 sm:px-4 py-2 text-sm border border-gray-700 text-gray-300 bg-transparent hover:bg-gray-800/80 hover:border-primary-1/40 hover:text-white rounded-xl cursor-pointer transition-colors focus-visible:ring-primary-1/50"
              >
                Back
              </Button>
            )}
          </div>
          <div className="flex items-center gap-1.5 sm:gap-2">
            {step === 1 && (
              <Button
                type="button"
                disabled={isStep1Availability && (!canProceedStep1 || !hasSelectionStep1)}
                onClick={handleNext}
                className="min-h-10 sm:min-h-11 py-2 px-4 sm:px-5 text-sm bg-primary-1 text-black hover:bg-primary-1/90 hover:shadow-[0_0_20px_rgba(255,236,0,0.35)] disabled:opacity-50 font-medium rounded-xl cursor-pointer transition-all focus-visible:ring-primary-1/50"
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
                  className="min-h-10 sm:min-h-11 px-3 sm:px-4 py-2 text-sm border border-gray-700 text-gray-400 bg-transparent hover:bg-gray-800/80 hover:border-primary-1/40 hover:text-white rounded-xl cursor-pointer transition-colors focus-visible:ring-primary-1/50"
                >
                  Skip
                </Button>
                <Button
                  type="button"
                  disabled={isStep1Availability && (!canProceedStep1 || !hasSelectionStep1)}
                  onClick={handleNext}
                  className="min-h-10 sm:min-h-11 py-2 px-4 sm:px-5 text-sm bg-primary-1 text-black hover:bg-primary-1/90 hover:shadow-[0_0_20px_rgba(255,236,0,0.35)] disabled:opacity-50 font-medium rounded-xl cursor-pointer transition-all focus-visible:ring-primary-1/50"
                >
                  Next
                </Button>
              </>
            )}
            {step === 3 && (
              <Button
                type="submit"
                form="bookingForm"
                className="min-h-10 sm:min-h-11 py-2 px-4 sm:px-5 text-sm bg-primary-1 text-black hover:bg-primary-1/90 hover:shadow-[0_0_20px_rgba(255,236,0,0.35)] font-medium rounded-xl cursor-pointer transition-all focus-visible:ring-primary-1/50"
              >
                Add to booking
              </Button>
            )}
          </div>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
