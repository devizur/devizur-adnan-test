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
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="shrink-0 border-b border-white/[0.06] bg-gradient-to-b from-[#181818] to-[#161616] px-3 py-2.5 sm:px-5 sm:py-3">
        <p className="text-[9px] font-semibold uppercase tracking-[0.14em] text-zinc-500">
          Payment
        </p>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto px-3 py-3 scrollbar-dark sm:px-5 sm:py-4">
        <PaymentStepForm payment={payment} />
      </div>
      <PaymentSuccessModal
        open={payment.showSuccess}
        onOpenChange={(open) => !open && payment.handleCloseSuccess()}
        onDone={handleSuccessDone}
      />
    </div>
  );
}
