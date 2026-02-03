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
import { useBookingCart } from "@/contexts/BookingCartContext";
import { cn } from "@/lib/utils";
import {
  STEPS,
  BookingProductList,
  Step1Products,
  Step2DateTime,
  Step3Quantity,
  Step4YourDetails,
} from "@/components/ui/booking";

interface BookingDialogProps {
  children: React.ReactNode;
  onConfirm?: () => void;
  initialActivityId?: number;
}

export function BookingDialog({
  children,
  onConfirm,
}: BookingDialogProps) {
  const {
    step,
    setStep,
    selectedProducts,
    totalSelectedQty,
    resetBookingCart,
  } = useBookingCart();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onConfirm?.();
    resetBookingCart();
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>{children}</AlertDialogTrigger>
      <AlertDialogContent
        className="min-w-[90%] max-w-5xl max-h-[90vh] flex flex-col bg-secondary-2   p-0 gap-0 text-foreground"
      >
        <AlertDialogHeader className="px-6 pt-6 pb-2 border-b">
          <AlertDialogTitle className="text-lg font-semibold text-primary">
            Add Booking
          </AlertDialogTitle>
          {/* Stepper - project colors */}
          <div className="flex items-center gap-2 mt-3 w-full">
            {STEPS.map((s, i) => {
              const isActive = step === s.id;
              const isPast = step > s.id;
              return (
                <React.Fragment key={s.id}>
                  <button
                    type="button"
                    onClick={() => setStep(s.id)}
                    className={cn(
                      "flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
                      isActive && "bg-primary-1 text-black",
                      isPast && "bg-primary-1/20 text-foreground",
                      !isActive && !isPast && "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <span
                      className={cn(
                        "flex size-6 shrink-0 items-center justify-center rounded-full text-xs font-bold",
                        (isActive || isPast)
                          ? "bg-primary-1 text-black"
                          : "bg-muted text-muted-foreground"
                      )}
                    >
                      {isPast ? "✓" : s.id}
                    </span>
                    <span className="hidden sm:inline">{s.label}</span>
                  </button>
                  {i < STEPS.length - 1 && (
                    <div
                      className={cn(
                        "h-0.5 flex-1 min-w-4 rounded",
                        isPast ? "bg-primary-1" : "bg-muted"
                      )}
                    />
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </AlertDialogHeader>

        <div className="px-6 py-4 overflow-y-auto flex-1" style={{ maxHeight: "500px" }}>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            {step <= 3 && (
              <div className="lg:col-span-4 p-0">
                <BookingProductList currentStep={step} />
              </div>
            )}

            <div
              className={cn(
                step <= 3 ? "lg:col-span-8 pl-0 lg:pl-1" : "lg:col-span-12"
              )}
            >
              {step === 1 && <Step1Products />}
              {step === 2 && <Step2DateTime />}
              {step === 3 && <Step3Quantity />}
              {step === 4 && <Step4YourDetails onSubmit={handleSubmit} />}
            </div>
          </div>
        </div>

        <AlertDialogFooter className="px-6 py-4 border-t border-border flex-row justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-2">
            <AlertDialogCancel className="m-0 border-border text-foreground">
              Cancel
            </AlertDialogCancel>
            {step > 1 && (
              <Button
                type="button"
                variant="outline"
                onClick={() => setStep(step - 1)}
                className="border-border text-foreground"
              >
                Back
              </Button>
            )}
          </div>
          {step === 4 ? (
            <Button
              type="submit"
              form="bookingForm"
              disabled={totalSelectedQty < 1}
              variant="primary"
              className="bg-primary-1 text-black hover:bg-primary-1-hover disabled:opacity-50"
            >
              Booking Request with {totalSelectedQty > 0 ? totalSelectedQty : ""} Person
            </Button>
          ) : (
            <Button
              type="button"
              disabled={
                step === 1 ? selectedProducts.length === 0 : totalSelectedQty < 1
              }
              variant="primary"
              className="bg-primary-1 text-black hover:bg-primary-1-hover disabled:opacity-50"
              onClick={() => setStep(step + 1)}
            >
              {step === 1 && "Next: Date & Time"}
              {step === 2 && "Next: Quantity"}
              {step === 3 && "Next: Your Details"}
            </Button>
          )}
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
