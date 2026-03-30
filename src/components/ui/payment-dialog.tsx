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
import { PaymentStepForm } from "@/components/ui/booking/PaymentStepForm";
import { PaymentSuccessModal } from "@/components/ui/booking/PaymentSuccessModal";
import { usePaymentStep } from "@/components/ui/booking/usePaymentStep";
import { formatPrice } from "@/lib/utils";
import { X } from "lucide-react";

export function PaymentDialog({
  children,
  onPaymentSuccess,
}: {
  children: React.ReactNode;
  onPaymentSuccess?: () => void;
}) {
  const [isOpen, setIsOpen] = React.useState(false);

  const payment = usePaymentStep(() => {
    setIsOpen(false);
    onPaymentSuccess?.();
  });

  const { totalBeforeFees, setPaymentAmountInput } = payment;

  React.useEffect(() => {
    if (!isOpen) return;
    setPaymentAmountInput(formatPrice(totalBeforeFees));
  }, [isOpen, totalBeforeFees, setPaymentAmountInput]);

  const handlePaymentDialogOpenChange = (open: boolean) => {
    if (!open) {
      payment.resetForm();
    }
    setIsOpen(open);
  };

  return (
    <>
      <AlertDialog open={isOpen} onOpenChange={handlePaymentDialogOpenChange}>
        <AlertDialogTrigger asChild>{children}</AlertDialogTrigger>
        <AlertDialogContent className="min-w-[90%] max-w-3xl h-[90vh] flex flex-col bg-[#161616] p-0 gap-0 text-white border border-gray-800/80 rounded-2xl overflow-hidden">
          <AlertDialogHeader className="px-6 pt-5 pb-4 border-b border-gray-800/80 shrink-0">
            <div className="flex items-center justify-between w-full">
              <AlertDialogTitle className="text-lg font-semibold text-white">Payment</AlertDialogTitle>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="min-h-11 min-w-11 p-2 rounded-xl text-gray-400 hover:text-white hover:bg-[#1e1e1e] transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-1/50 focus-visible:ring-offset-2 focus-visible:ring-offset-[#161616] flex items-center justify-center"
                aria-label="Close payment dialog"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </AlertDialogHeader>

          <div className="flex-1 overflow-y-auto p-6">
            <PaymentStepForm payment={payment} />
          </div>

          <AlertDialogFooter className="px-6 py-4 border-t border-gray-800/80 flex-row justify-end gap-3 bg-[#161616] shrink-0">
            <AlertDialogCancel
              onClick={() => setIsOpen(false)}
              className="m-0 min-h-11 px-4 border border-gray-700 text-gray-400 bg-transparent hover:bg-[#262626] hover:border-gray-500 rounded-xl cursor-pointer transition-colors focus-visible:ring-primary-1/50"
            >
              Cancel
            </AlertDialogCancel>
            <Button
              type="button"
              onClick={payment.handleTakePayment}
              disabled={payment.cannotTakePayment}
              aria-label={`Pay ${formatPrice(payment.totalPaymentAmount)}`}
              className="min-h-11 bg-primary-1 text-black hover:bg-primary-1/90 hover:shadow-[0_0_20px_rgba(255,236,0,0.35)] font-medium rounded-xl px-5 cursor-pointer transition-all focus-visible:ring-primary-1/50 disabled:opacity-50 disabled:pointer-events-none disabled:cursor-not-allowed"
            >
              Pay {formatPrice(payment.totalPaymentAmount)}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <PaymentSuccessModal
        open={payment.showSuccess}
        onOpenChange={(open) => !open && payment.handleCloseSuccess()}
        onDone={() => {
          payment.handleCloseSuccess();
        }}
      />
    </>
  );
}
