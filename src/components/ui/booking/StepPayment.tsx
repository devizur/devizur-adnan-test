"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { PaymentStepForm } from "@/components/ui/booking/PaymentStepForm";
import { PaymentSuccessModal } from "@/components/ui/booking/PaymentSuccessModal";
import { usePaymentStep } from "@/components/ui/booking/usePaymentStep";
import { formatPrice } from "@/lib/utils";

interface StepPaymentProps {
  onBack: () => void;
  /** After user taps Done on the success modal */
  onFlowComplete?: () => void;
}

export function StepPayment({ onBack, onFlowComplete }: StepPaymentProps) {
  const payment = usePaymentStep(undefined);

  React.useEffect(() => {
    payment.setPaymentAmountInput(formatPrice(payment.totalBeforeFees));
    // eslint-disable-next-line react-hooks/exhaustive-deps -- initialize amount when entering payment step
  }, []);

  const handleSuccessDone = () => {
    payment.handleCloseSuccess();
    onFlowComplete?.();
  };

  return (
    <>
      <p className="text-[11px] text-gray-500 uppercase tracking-wider mb-4">Payment</p>
      <PaymentStepForm payment={payment} />
      <div className="flex flex-row justify-between gap-2 sm:gap-3 flex-wrap pt-4 mt-4 border-t border-secondary-2">
        <Button
          type="button"
          variant="outline"
          onClick={onBack}
          className="min-h-10 sm:min-h-11 px-3 sm:px-4 py-2 text-sm border border-gray-700 text-gray-300 bg-transparent hover:bg-secondary-2 hover:border-primary-1/40 hover:text-white rounded-xl cursor-pointer transition-colors focus-visible:ring-primary-1/50"
        >
          Back
        </Button>
        <Button
          type="button"
          onClick={payment.handleTakePayment}
          disabled={payment.cannotTakePayment}
          aria-label={`Pay ${formatPrice(payment.totalPaymentAmount)}`}
          className="min-h-10 sm:min-h-11 py-2 px-4 sm:px-5 text-sm bg-primary-1 text-black hover:bg-primary-1/90 hover:shadow-[0_0_20px_rgba(255,236,0,0.35)] font-medium rounded-xl cursor-pointer transition-all focus-visible:ring-primary-1/50 disabled:opacity-50 disabled:pointer-events-none"
        >
          Pay {formatPrice(payment.totalPaymentAmount)}
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
