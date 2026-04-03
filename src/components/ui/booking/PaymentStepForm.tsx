"use client";

import * as React from "react";
import { formatPrice } from "@/lib/utils";
import type { PaymentStepState } from "@/components/ui/booking/usePaymentStep";
import { StripePaymentElementBlock } from "@/components/ui/booking/StripePaymentElement";
import { cn } from "@/lib/utils";

interface PaymentStepFormProps {
  payment: PaymentStepState;
}

const sectionLabel =
  "text-[9px] font-semibold uppercase tracking-[0.14em] text-zinc-500";

const panelClass =
  "rounded-xl border border-white/[0.08] bg-[#141414]/60 p-3 shadow-sm shadow-black/10 sm:p-4";

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
    <div className="mx-auto grid max-w-4xl grid-cols-1 gap-4 md:grid-cols-2 md:gap-5">
      <div className="min-w-0 space-y-2">
        <p className={sectionLabel}>Card & billing</p>
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

      <div className="min-w-0 space-y-2">
        <h3 className={sectionLabel}>Summary</h3>
        {isCartEmpty ? (
          <div className={cn(panelClass, "py-6 text-center")}>
            <p className="text-sm text-zinc-400">Your cart is empty.</p>
            <p className="mt-1 text-xs text-zinc-500">Add items to continue.</p>
          </div>
        ) : (
          <div className={cn(panelClass, "space-y-3")}>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-zinc-500">
                <span>Subtotal</span>
                <span className="tabular-nums text-zinc-300">{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between text-zinc-500">
                <span>Service fee (5%)</span>
                <span className="tabular-nums text-zinc-300">{formatPrice(serviceFee)}</span>
              </div>
              <div className="flex justify-between text-zinc-500">
                <span>Discount</span>
                <span className="tabular-nums text-zinc-300">- {formatPrice(discount)}</span>
              </div>
              <div className="flex justify-between text-zinc-500">
                <span>Card fee (3%)</span>
                <span className="tabular-nums text-zinc-300">{formatPrice(creditCardFee)}</span>
              </div>
            </div>
            <div className="flex items-center justify-between border-t border-white/[0.06] pt-3">
              <span className="text-sm font-medium text-zinc-200">Total</span>
              <span className="text-base font-semibold tabular-nums text-zinc-100 sm:text-lg">
                {formatPrice(totalPaymentAmount)}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
