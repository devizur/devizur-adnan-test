"use client";

import * as React from "react";
import { useCart } from "@/contexts/CartContext";
import { formatPrice, parsePrice } from "@/lib/utils";

export const CREDIT_CARD_FEE_RATE = 0.03;

export function resetPaymentFormFields(
  setCardNumber: (v: string) => void,
  setNameOnCard: (v: string) => void,
  setExpiryMM: (v: string) => void,
  setExpiryYY: (v: string) => void,
  setCvv: (v: string) => void,
  setPaymentAmountInput: (v: string) => void
) {
  setCardNumber("");
  setNameOnCard("");
  setExpiryMM("");
  setExpiryYY("");
  setCvv("");
  setPaymentAmountInput("");
}

export function usePaymentStep(onPaymentSuccess?: () => void) {
  const { foodItems, activityItems, packageItems, clearCart, getTotalItems } = useCart();

  const [cardNumber, setCardNumber] = React.useState("");
  const [nameOnCard, setNameOnCard] = React.useState("");
  const [expiryMM, setExpiryMM] = React.useState("");
  const [expiryYY, setExpiryYY] = React.useState("");
  const [cvv, setCvv] = React.useState("");
  const [paymentAmountInput, setPaymentAmountInput] = React.useState("");
  const [showSuccess, setShowSuccess] = React.useState(false);

  const foodSubtotal = foodItems.reduce(
    (sum, item) => sum + parsePrice(item.food.price) * item.quantity,
    0
  );
  const activitySubtotal = activityItems.reduce(
    (sum, item) => sum + parsePrice(item.activity.price) * item.gameNo,
    0
  );
  const packageSubtotal = packageItems.reduce(
    (sum, item) => sum + parsePrice(item.pkg.price),
    0
  );
  const subtotal = foodSubtotal + activitySubtotal + packageSubtotal;
  const serviceFee = subtotal * 0.05;
  const discount = 0;
  const totalBeforeFees = subtotal + serviceFee - discount;

  const defaultPaymentAmount = totalBeforeFees;
  const paymentAmountRaw = paymentAmountInput
    ? parseFloat(paymentAmountInput.replace(/[^0-9.]/g, ""))
    : defaultPaymentAmount;
  const paymentAmount =
    Number.isNaN(paymentAmountRaw) || paymentAmountRaw <= 0 ? defaultPaymentAmount : paymentAmountRaw;

  const creditCardFee = Math.round(paymentAmount * CREDIT_CARD_FEE_RATE * 100) / 100;
  const totalPaymentAmount = paymentAmount + creditCardFee;

  const resetForm = React.useCallback(() => {
    resetPaymentFormFields(
      setCardNumber,
      setNameOnCard,
      setExpiryMM,
      setExpiryYY,
      setCvv,
      setPaymentAmountInput
    );
  }, []);

  const handleTakePayment = React.useCallback(() => {
    clearCart();
    resetForm();
    onPaymentSuccess?.();
    setShowSuccess(true);
  }, [clearCart, resetForm, onPaymentSuccess]);

  const handleCloseSuccess = React.useCallback(() => {
    setShowSuccess(false);
  }, []);

  const isCartEmpty = getTotalItems() === 0;
  const cannotTakePayment = isCartEmpty || totalBeforeFees <= 0;

  const api = {
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
    showSuccess,
    setShowSuccess,
    foodSubtotal,
    activitySubtotal,
    packageSubtotal,
    subtotal,
    serviceFee,
    discount,
    totalBeforeFees,
    defaultPaymentAmount,
    creditCardFee,
    totalPaymentAmount,
    isCartEmpty,
    cannotTakePayment,
    handleTakePayment,
    handleCloseSuccess,
    resetForm,
  };

  return api;
}

export type PaymentStepState = ReturnType<typeof usePaymentStep>;
