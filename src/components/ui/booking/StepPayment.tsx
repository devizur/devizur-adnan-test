"use client";

import * as React from "react";
import { PaymentStepForm } from "@/components/ui/booking/PaymentStepForm";
import { PaymentSuccessModal } from "@/components/ui/booking/PaymentSuccessModal";
import { usePaymentStep } from "@/components/ui/booking/usePaymentStep";
import { useAppSelector } from "@/store";

interface StepPaymentProps {
  onFlowComplete?: () => void;
}

export function StepPayment({ onFlowComplete }: StepPaymentProps) {
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
      <PaymentSuccessModal
        open={payment.showSuccess}
        onOpenChange={(open) => !open && payment.handleCloseSuccess()}
        onDone={handleSuccessDone}
      />
    </>
  );
}
