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
import { useDispatch, useSelector } from "react-redux";
import { useCart } from "@/contexts/CartContext";
import { cn } from "@/lib/utils";
import { Step1AvailabilitySelection } from "@/components/ui/booking/Step1AvailabilitySelection";
import { Step2FoodSelection } from "@/components/ui/booking/Step2FoodSelection";
import { Step3HolderDetails } from "@/components/ui/booking/Step3HolderDetails";
import { nextStep, prevStep, resetBooking, addActivity, addPackage, addFood, setStep, setFlowMode } from "@/store/bookingSlice";
import type { RootState } from "@/store";
import type { Activity, Package, Food } from "@/lib/api/types";
import { X } from "lucide-react";

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
  const dispatch = useDispatch();
  const cart = useCart();
  const { step, flowMode, timeSlot, persons, selectedActivities, selectedPackages, selectedFoods } =
    useSelector((state: RootState) => state.booking);

  const isFoodFirst = flowMode === "foodFirst";
  const STEPS = isFoodFirst ? STEPS_FOOD_FIRST : STEPS_ACTIVITY_FIRST;

  const [isOpen, setIsOpen] = React.useState(false);

  React.useEffect(() => {
    if (!isOpen) return;
    dispatch(resetBooking());
    if (initialActivity) {
      dispatch(addActivity({ activity: initialActivity, gameNo: 1 }));
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
  }, [isOpen]); // eslint-disable-line react-hooks/exhaustive-deps -- only when dialog opens

  const canProceedStep1 = timeSlot && (persons.adults + persons.children) > 0;
  const hasSelectionStep1 = selectedActivities.length > 0 || selectedPackages.length > 0;

  const handleAddBooking = (e?: React.FormEvent) => {
    e?.preventDefault();
    selectedActivities.forEach(({ activity, gameNo }) => {
      cart.addActivity(activity, gameNo);
    });
    selectedPackages.forEach((pkg) => {
      cart.addPackage(pkg);
    });
    selectedFoods.forEach(({ food, quantity }) => {
      cart.addFood(food, quantity);
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

  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogTrigger asChild>{children}</AlertDialogTrigger>
      <AlertDialogContent
        className="min-w-[90%] max-w-4xl max-h-[90vh] flex flex-col bg-[#1a1a1a] p-0 gap-0 text-white border-gray-800"
      >
        <AlertDialogHeader className="px-6 pt-5 pb-4 border-b border-gray-800 shrink-0">
          <div className="flex items-center justify-between w-full">
            <AlertDialogTitle className="text-xl font-bold text-white">
              Create Booking
            </AlertDialogTitle>
            <button
              type="button"
              onClick={handleClose}
              className="p-1.5 rounded-md text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="flex items-center gap-2 mt-4">
            {STEPS.map((s, i) => (
              <div key={`${isFoodFirst ? "f" : "a"}-${s.id}`} className="flex items-center gap-2">
                <span
                  className={cn(
                    "text-xs font-medium",
                    step === s.id ? "text-primary-1" : step > s.id ? "text-gray-400" : "text-gray-500"
                  )}
                >
                  {s.id}. {s.label}
                </span>
                {i < STEPS.length - 1 && (
                  <span className="text-gray-600">/</span>
                )}
              </div>
            ))}
          </div>
        </AlertDialogHeader>

        <div
          className={cn(
            "flex-1 scrollbar-dark",
            (isFoodFirst ? step === 2 : step === 1) ? "min-h-0 flex flex-col overflow-hidden" : "overflow-y-auto px-6 py-5"
          )}
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

        <AlertDialogFooter className="px-6 py-4 border-t border-gray-800 flex-row justify-between gap-3 flex-wrap bg-[#1a1a1a] shrink-0">
          <div className="flex items-center gap-2">
            <AlertDialogCancel
              onClick={handleClose}
              className="m-0 border-gray-700 text-white bg-transparent hover:bg-gray-800"
            >
              Cancel
            </AlertDialogCancel>
            {step > 1 && (
              <Button
                type="button"
                variant="outline"
                onClick={handleBack}
                className="border-gray-700 text-white bg-transparent hover:bg-gray-800"
              >
                Back
              </Button>
            )}
          </div>
          <div className="flex items-center gap-2">
            {step === 1 && (
              <Button
                type="button"
                disabled={isStep1Availability && (!canProceedStep1 || !hasSelectionStep1)}
                onClick={handleNext}
                className="bg-primary-1 text-black hover:bg-primary-1-hover disabled:opacity-50 font-semibold"
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
                  className="border-gray-700 text-white bg-transparent hover:bg-gray-800"
                >
                  Skip
                </Button>
                <Button
                  type="button"
                  disabled={isStep1Availability && (!canProceedStep1 || !hasSelectionStep1)}
                  onClick={handleNext}
                  className="bg-primary-1 text-black hover:bg-primary-1-hover disabled:opacity-50 font-semibold"
                >
                  Next
                </Button>
              </>
            )}
            {step === 3 && (
              <Button
                type="submit"
                form="bookingForm"
                className="bg-primary-1 text-black hover:bg-primary-1-hover font-semibold"
              >
                Add Booking
              </Button>
            )}
          </div>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
