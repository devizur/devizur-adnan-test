"use client";

import * as React from "react";
import { Input } from "@/components/ui/input";
import { formatPrice } from "@/lib/utils";
import type { PaymentStepState } from "@/components/ui/booking/usePaymentStep";

interface PaymentStepFormProps {
  payment: PaymentStepState;
}

export function PaymentStepForm({ payment }: PaymentStepFormProps) {
  const {
    cardNumber,
    setCardNumber,
    nameOnCard,
    setNameOnCard,
    expiryMM,
    setExpiryMM,
    expiryYY,
    setExpiryYY,
    cvv,
    setCvv,
    paymentAmountInput,
    setPaymentAmountInput,
    subtotal,
    serviceFee,
    discount,
    defaultPaymentAmount,
    creditCardFee,
    totalPaymentAmount,
    isCartEmpty,
  } = payment;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      <div className="space-y-5">
        <div className="space-y-4 p-4 rounded-xl bg-[#1e1e1e] border border-gray-800">
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">Card details</p>
          <div>
            <label className="block text-xs text-gray-400 mb-1.5">Card number</label>
            <Input
              placeholder="1234 5678 9012 3456"
              value={cardNumber}
              onChange={(e) => setCardNumber(e.target.value)}
              className="h-10 rounded-xl bg-[#161616] border-gray-700 text-white placeholder:text-gray-500 focus-visible:ring-primary-1/50"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1.5">Name on card</label>
            <Input
              placeholder="John Doe"
              value={nameOnCard}
              onChange={(e) => setNameOnCard(e.target.value)}
              className="h-10 rounded-xl bg-[#161616] border-gray-700 text-white placeholder:text-gray-500 focus-visible:ring-primary-1/50"
            />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2">
              <label className="block text-xs text-gray-400 mb-1.5">Expiry</label>
              <div className="flex gap-2">
                <Input
                  placeholder="MM"
                  maxLength={2}
                  value={expiryMM}
                  onChange={(e) => setExpiryMM(e.target.value.replace(/\D/g, "").slice(0, 2))}
                  className="h-10 rounded-xl bg-[#161616] border-gray-700 text-white placeholder:text-gray-500"
                />
                <Input
                  placeholder="YY"
                  maxLength={2}
                  value={expiryYY}
                  onChange={(e) => setExpiryYY(e.target.value.replace(/\D/g, "").slice(0, 2))}
                  className="h-10 rounded-xl bg-[#161616] border-gray-700 text-white placeholder:text-gray-500"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1.5">CVV</label>
              <Input
                placeholder="•••"
                maxLength={4}
                type="password"
                value={cvv}
                onChange={(e) => setCvv(e.target.value.replace(/\D/g, ""))}
                className="h-10 rounded-xl bg-[#161616] border-gray-700 text-white placeholder:text-gray-500"
              />
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Amount to pay</label>
          <Input
            disabled
            aria-label="Amount to pay (fixed)"
            placeholder={formatPrice(defaultPaymentAmount)}
            value={paymentAmountInput}
            onChange={(e) => setPaymentAmountInput(e.target.value)}
            className="h-10 rounded-xl bg-[#1e1e1e] border-gray-700 text-white placeholder:text-gray-500 focus-visible:ring-primary-1/50 disabled:opacity-60 disabled:cursor-not-allowed"
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
