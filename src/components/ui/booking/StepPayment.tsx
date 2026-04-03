"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { PaymentStepForm } from "@/components/ui/booking/PaymentStepForm";
import { PaymentSuccessModal } from "@/components/ui/booking/PaymentSuccessModal";
import { usePaymentStep } from "@/components/ui/booking/usePaymentStep";
import { useAppSelector } from "@/store";

interface StepPaymentProps {
  onBack: () => void;
  onFlowComplete?: () => void;
}

export function StepPayment({ onBack, onFlowComplete }: StepPaymentProps) {
  const bookingReferenceId = useAppSelector((s) => s.booking.bookingReferenceId);
  const checkoutMetadata = React.useMemo(
    () => (bookingReferenceId ? { bookingReferenceId } : undefined),
    [bookingReferenceId]
  );
  const payment = usePaymentStep({ checkoutMetadata });

  const handleSuccessDone = () => {
    payment.handleCloseSuccess();
    onFlowComplete?.();
  };

  return (
    <>
      <PaymentStepForm payment={payment} />
      <div className="flex flex-row justify-start gap-2 sm:gap-3 flex-wrap pt-4 mt-4 border-t border-secondary-2">
        <Button
          type="button"
          variant="outline"
          onClick={onBack}
          className="min-h-10 sm:min-h-11 px-3 sm:px-4 py-2 text-sm border border-gray-700 text-gray-300 bg-transparent hover:bg-secondary-2 hover:border-primary-1/40 hover:text-white rounded-xl cursor-pointer transition-colors focus-visible:ring-primary-1/50"
        >
          Back
        </Button>
      </div>
      <PaymentSuccessModal
        open={payment.showSuccess}
        onOpenChange={(open) => !open && payment.handleCloseSuccess()}
        onDone={handleSuccessDone}
      />
    </>
  );
}
