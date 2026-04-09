"use client";

import * as React from "react";
import { useCart } from "@/contexts/CartContext";
import { appendPaidOrder, patchPaidOrder } from "@/lib/paidOrdersStorage";
import { saveOrderToBackend } from "@/lib/api/orderHttp";
import { parsePrice } from "@/lib/utils";

export const CREDIT_CARD_FEE_RATE = 0.03;

export interface UsePaymentStepOptions {
  /** Passed to Stripe PaymentIntent metadata (string values only). */
  checkoutMetadata?: Record<string, string>;
}

export function usePaymentStep(options?: UsePaymentStepOptions) {
  const { entries, foodItems, activityItems, packageItems, getTotalItems, clearCart } = useCart();

  const [showSuccess, setShowSuccess] = React.useState(false);
  const [paymentIntentResetKey, setPaymentIntentResetKey] = React.useState(0);

  const foodSubtotal = foodItems.reduce(
    (sum, item) => sum + parsePrice(item.food.price) * item.quantity,
    0
  );
  const activitySubtotal = activityItems.reduce(
    (sum, item) => sum + parsePrice(item.activity.price) * item.gameNo,
    0
  );
  const packageSubtotal = packageItems.reduce((sum, item) => {
    const c = item.combination;
    if (c && typeof c.fixedPrice === "number" && !Number.isNaN(c.fixedPrice) && c.fixedPrice >= 0) {
      return sum + c.fixedPrice;
    }
    return sum + parsePrice(item.pkg.price);
  }, 0);
  const subtotal = foodSubtotal + activitySubtotal + packageSubtotal;
  const serviceFee = subtotal * 0.05;
  const discount = 0;
  const totalBeforeFees = subtotal + serviceFee - discount;

  const creditCardFee = Math.round(totalBeforeFees * CREDIT_CARD_FEE_RATE * 100) / 100;
  const totalPaymentAmount = totalBeforeFees + creditCardFee;
  const amountTotalCents = Math.max(50, Math.round(totalPaymentAmount * 100));

  const checkoutMetadata = options?.checkoutMetadata;

  const resetForm = React.useCallback(() => {
    setPaymentIntentResetKey((k) => k + 1);
  }, []);

  const completePaymentSuccess = React.useCallback(
    (paymentMeta?: { stripePaymentIntentId?: string }) => {
      const record =
        entries.length > 0
          ? appendPaidOrder(entries, totalPaymentAmount, {
              stripePaymentIntentId: paymentMeta?.stripePaymentIntentId,
            })
          : null;
      clearCart();
      resetForm();
      setShowSuccess(true);
      if (record) {
        console.log("[paid-order-record]", record);
        void saveOrderToBackend(record)
          .then((res) => {
            patchPaidOrder(record.id, {
              salesOrder: {
                orderId: res.orderId,
                orderNumber: res.orderNumber,
                uniqueOrderRef: res.uniqueOrderRef,
                tokenNumber: res.tokenNumber,
                grossAmount: res.grossAmount,
                totalLineTax: res.totalLineTax,
                netAmount: res.netAmount,
                paymentStatus: res.paymentStatus,
                createdAt: res.createdAt,
                updatedAt: res.updatedAt,
              },
              serverReceivedAt: res.createdAt ?? record.serverReceivedAt,
            });
            console.log("[saveOrderToBackend] sales order response", res);
          })
          .catch((err) => {
            console.error("[saveOrderToBackend]", err);
          });
      }
    },
    [entries, totalPaymentAmount, clearCart, resetForm]
  );

  const handleCloseSuccess = React.useCallback(() => {
    setShowSuccess(false);
  }, []);

  const isCartEmpty = getTotalItems() === 0;

  return {
    showSuccess,
    handleCloseSuccess,
    completePaymentSuccess,
    paymentIntentResetKey,
    foodSubtotal,
    activitySubtotal,
    packageSubtotal,
    subtotal,
    serviceFee,
    discount,
    totalBeforeFees,
    creditCardFee,
    totalPaymentAmount,
    amountTotalCents,
    isCartEmpty,
    checkoutMetadata,
    resetForm,
  };
}

export type PaymentStepState = ReturnType<typeof usePaymentStep>;
