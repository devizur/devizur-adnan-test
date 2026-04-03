"use client";

import * as React from "react";
import { formatPrice } from "@/lib/utils";
import type { PaymentStepState } from "@/components/ui/booking/usePaymentStep";
import { StripePaymentElementBlock } from "@/components/ui/booking/StripePaymentElement";

interface PaymentStepFormProps {
  payment: PaymentStepState;
}

export function PaymentStepForm({ payment }: PaymentStepFormProps) {
  const {
    subtotal,
    serviceFee,
    discount,
    creditCardFee,
    totalPaymentAmount,
    amountTotalCents,
    isCartEmpty,
    checkoutMetadata,
    completePaymentSuccess,
    paymentIntentResetKey,
  } = payment;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      <div className="space-y-5">
        <div className="space-y-2">
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">Card</p>
          <StripePaymentElementBlock
            amountTotalCents={amountTotalCents}
            totalLabel={formatPrice(totalPaymentAmount)}
            description="Booking payment"
            metadata={checkoutMetadata}
            disabled={isCartEmpty}
            resetKey={paymentIntentResetKey}
            onPaid={completePaymentSuccess}
          />
        </div>
      </div>

      <div className="space-y-3">
        <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wider">Summary</h3>
        {isCartEmpty ? (
          <div className="rounded-xl border border-gray-800 bg-[#1e1e1e] p-6 text-center">
            <p className="text-sm text-gray-400">Your cart is empty.</p>
            <p className="text-xs text-gray-500 mt-1">Add items to continue.</p>
          </div>
        ) : (
          <div className="rounded-xl border border-gray-800 bg-[#1e1e1e] p-4 space-y-3">
            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-gray-400">
                <span>Subtotal</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between text-gray-400">
                <span>Service fee (5%)</span>
                <span>{formatPrice(serviceFee)}</span>
              </div>
              <div className="flex justify-between text-gray-400">
                <span>Discount</span>
                <span>- {formatPrice(discount)}</span>
              </div>
              <div className="flex justify-between text-gray-400">
                <span>Card fee (3%)</span>
                <span>{formatPrice(creditCardFee)}</span>
              </div>
            </div>
            <div className="border-t border-gray-800 pt-3 flex justify-between items-center">
              <span className="text-sm font-medium text-white">Total</span>
              <span className="text-lg font-semibold text-white">{formatPrice(totalPaymentAmount)}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
