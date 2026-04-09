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
  /** Booking reference from booking state; mapped to SalesOrder.bookingId. */
  bookingReferenceId?: string;
  /** Numeric booking id from reserveBooking. */
  bookingId?: number;
}

export function usePaymentStep(options?: UsePaymentStepOptions) {
  const { entries, foodItems, activityItems, packageItems, getTotalItems, clearCart } = useCart();

  const [showSuccess, setShowSuccess] = React.useState(false);
  const [isSavingSalesOrder, setIsSavingSalesOrder] = React.useState(false);
  const [salesOrderError, setSalesOrderError] = React.useState<string | null>(null);
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
  const bookingReferenceId = options?.bookingReferenceId;
  const bookingId = options?.bookingId;

  const resetForm = React.useCallback(() => {
    setPaymentIntentResetKey((k) => k + 1);
  }, []);

  const completePaymentSuccess = React.useCallback(
    (paymentMeta?: { stripePaymentIntentId?: string }) => {
      setSalesOrderError(null);
      const record =
        entries.length > 0
          ? appendPaidOrder(entries, totalPaymentAmount, {
              stripePaymentIntentId: paymentMeta?.stripePaymentIntentId,
              bookingReferenceId,
              bookingId,
            })
          : null;
      clearCart();
      resetForm();
      if (!record) {
        setSalesOrderError("Order save failed: missing cart snapshot after payment.");
        return;
      }
      setIsSavingSalesOrder(true);
      void saveOrderToBackend(record)
        .then((res) => {
          patchPaidOrder(record.id, {
            salesOrder: res,
            serverReceivedAt: res.createdAt ?? record.serverReceivedAt,
          });
          setShowSuccess(true);
        })
        .catch((err) => {
          const msg = err instanceof Error ? err.message : "Could not save order to /api/SalesOrder";
          setSalesOrderError(msg);
          console.error("[saveOrderToBackend]", err);
        })
        .finally(() => {
          setIsSavingSalesOrder(false);
        });
    },
    [entries, totalPaymentAmount, clearCart, resetForm, bookingReferenceId, bookingId]
  );

  const handleCloseSuccess = React.useCallback(() => {
    setShowSuccess(false);
  }, []);

  const isCartEmpty = getTotalItems() === 0;

  return {
    showSuccess,
    handleCloseSuccess,
    completePaymentSuccess,
    isSavingSalesOrder,
    salesOrderError,
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
