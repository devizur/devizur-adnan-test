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
import { Input } from "@/components/ui/input";
import { useCart } from "@/contexts/CartContext";
import { formatPrice, parsePrice } from "@/lib/utils";
import { Check, X } from "lucide-react";
import { cn } from "@/lib/utils";

const PAYMENT_METHODS = ["Credit Card", "Cash"] as const;
type PaymentMethod = (typeof PAYMENT_METHODS)[number];

const CREDIT_CARD_FEE_RATE = 0.03; // 3%

function resetPaymentForm(
  setPayFiftyPercent: (v: boolean) => void,
  setPaymentMethod: (v: PaymentMethod) => void,
  setCardNumber: (v: string) => void,
  setNameOnCard: (v: string) => void,
  setExpiryMM: (v: string) => void,
  setExpiryYY: (v: string) => void,
  setCvv: (v: string) => void,
  setPaymentAmountInput: (v: string) => void
) {
  setPayFiftyPercent(false);
  setPaymentMethod("Credit Card");
  setCardNumber("");
  setNameOnCard("");
  setExpiryMM("");
  setExpiryYY("");
  setCvv("");
  setPaymentAmountInput("");
}

export function PaymentDialog({
  children,
  onPaymentSuccess,
}: {
  children: React.ReactNode;
  onPaymentSuccess?: () => void;
}) {
  const {
    foodItems,
    activityItems,
    packageItems,
    clearCart,
  } = useCart();

  const [isOpen, setIsOpen] = React.useState(false);
  const [showSuccess, setShowSuccess] = React.useState(false);
  const [payFiftyPercent, setPayFiftyPercent] = React.useState(false);
  const [paymentMethod, setPaymentMethod] = React.useState<PaymentMethod>("Credit Card");
  const [cardNumber, setCardNumber] = React.useState("");
  const [nameOnCard, setNameOnCard] = React.useState("");
  const [expiryMM, setExpiryMM] = React.useState("");
  const [expiryYY, setExpiryYY] = React.useState("");
  const [cvv, setCvv] = React.useState("");
  const [paymentAmountInput, setPaymentAmountInput] = React.useState("");

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

  const defaultPaymentAmount = payFiftyPercent ? totalBeforeFees * 0.5 : totalBeforeFees;
  const paymentAmountRaw = paymentAmountInput ? parseFloat(paymentAmountInput.replace(/[^0-9.]/g, "")) : defaultPaymentAmount;
  const paymentAmount = Number.isNaN(paymentAmountRaw) || paymentAmountRaw <= 0 ? defaultPaymentAmount : paymentAmountRaw;

  const isCreditCard = paymentMethod === "Credit Card";
  const creditCardFee = isCreditCard ? Math.round(paymentAmount * CREDIT_CARD_FEE_RATE * 100) / 100 : 0;
  const totalPaymentAmount = paymentAmount + creditCardFee;
  const netOutstanding = Math.max(0, totalBeforeFees - paymentAmount);

  React.useEffect(() => {
    if (!isOpen) return;
    setPaymentAmountInput(payFiftyPercent ? formatPrice(totalBeforeFees * 0.5) : formatPrice(totalBeforeFees));
  }, [isOpen, payFiftyPercent, totalBeforeFees]);

  const handleTakePayment = () => {
    clearCart();
    resetPaymentForm(
      setPayFiftyPercent,
      setPaymentMethod,
      setCardNumber,
      setNameOnCard,
      setExpiryMM,
      setExpiryYY,
      setCvv,
      setPaymentAmountInput
    );
    setIsOpen(false);
    onPaymentSuccess?.();
    setShowSuccess(true);
  };

  const handleCloseSuccess = () => {
    setShowSuccess(false);
  };

  return (
    <>
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogTrigger asChild>{children}</AlertDialogTrigger>
      <AlertDialogContent
        className="min-w-[90%] max-w-3xl max-h-[90vh] flex flex-col bg-[#1a1a1a] p-0 gap-0 text-white border-gray-800"
      >
        <AlertDialogHeader className="px-6 pt-5 pb-4 border-b border-gray-800 shrink-0">
          <div className="flex items-center justify-between w-full">
            <AlertDialogTitle className="text-xl font-bold text-white">
              Payment options
            </AlertDialogTitle>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="p-1.5 rounded-md text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </AlertDialogHeader>

        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Left: Payment Method */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">
                  50% payment
                </label>
                <button
                  type="button"
                  role="switch"
                  aria-checked={payFiftyPercent}
                  onClick={() => setPayFiftyPercent((p) => !p)}
                  className={cn(
                    "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors",
                    payFiftyPercent ? "bg-primary-1" : "bg-gray-600"
                  )}
                >
                  <span
                    className={cn(
                      "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition",
                      payFiftyPercent ? "translate-x-5" : "translate-x-0.5"
                    )}
                  />
                </button>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">
                  Payment Method
                </label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                  className="w-full h-9 rounded-md border border-gray-600 bg-gray-800/50 text-white px-3 py-1 text-sm focus:border-primary-1 focus:outline-none focus:ring-1 focus:ring-primary-1"
                >
                  {PAYMENT_METHODS.map((m) => (
                    <option key={m} value={m} className="bg-gray-800 text-white">
                      {m}
                    </option>
                  ))}
                </select>
              </div>

              {isCreditCard && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1.5">
                      Card Number
                    </label>
                    <Input
                      placeholder="Enter card number"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                      className="bg-gray-800/50 border-gray-600 text-white placeholder:text-gray-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1.5">
                      Name on Card
                    </label>
                    <Input
                      placeholder="Enter name on card"
                      value={nameOnCard}
                      onChange={(e) => setNameOnCard(e.target.value)}
                      className="bg-gray-800/50 border-gray-600 text-white placeholder:text-gray-500"
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <div className="col-span-2">
                      <label className="block text-sm font-medium text-gray-300 mb-1.5">
                        Expiry
                      </label>
                      <div className="flex gap-2">
                        <Input
                          placeholder="MM"
                          maxLength={2}
                          value={expiryMM}
                          onChange={(e) => setExpiryMM(e.target.value.replace(/\D/g, "").slice(0, 2))}
                          className="bg-gray-800/50 border-gray-600 text-white placeholder:text-gray-500"
                        />
                        <Input
                          placeholder="YY"
                          maxLength={2}
                          value={expiryYY}
                          onChange={(e) => setExpiryYY(e.target.value.replace(/\D/g, "").slice(0, 2))}
                          className="bg-gray-800/50 border-gray-600 text-white placeholder:text-gray-500"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1.5">
                        CVV
                      </label>
                      <Input
                        placeholder="CVV"
                        maxLength={4}
                        type="password"
                        value={cvv}
                        onChange={(e) => setCvv(e.target.value.replace(/\D/g, ""))}
                        className="bg-gray-800/50 border-gray-600 text-white placeholder:text-gray-500"
                      />
                    </div>
                  </div>
                </>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">
                  Payment Amount
                </label>
                <Input
                  placeholder={formatPrice(defaultPaymentAmount)}
                  value={paymentAmountInput}
                  onChange={(e) => setPaymentAmountInput(e.target.value)}
                  className="bg-gray-800/50 border-gray-600 text-white placeholder:text-gray-500"
                />
              </div>
            </div>

            {/* Right: Transaction Details */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white">Transaction Details</h3>
              {payFiftyPercent && (
                <p className="text-xs text-primary-1 font-medium">50% payment</p>
              )}
              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-gray-300">
                  <span>Subtotal</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between text-gray-300">
                  <span>Service Fee (5%)</span>
                  <span>{formatPrice(serviceFee)}</span>
                </div>
                <div className="flex justify-between text-gray-300">
                  <span>Discount</span>
                  <span>- {formatPrice(discount)}</span>
                </div>
                {isCreditCard && (
                  <div className="flex justify-between text-gray-300">
                    <span>Credit card fee *</span>
                    <span>{formatPrice(creditCardFee)}</span>
                  </div>
                )}
                <div className="flex justify-between text-white font-semibold pt-2 border-t border-gray-700">
                  <span>Total payment amount</span>
                  <span>{formatPrice(totalPaymentAmount)}</span>
                </div>
                <div className="flex justify-between text-gray-300 pt-1">
                  <span>Net amount outstanding</span>
                  <span>{formatPrice(netOutstanding)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <AlertDialogFooter className="px-6 py-4 border-t border-gray-800 flex-row justify-end gap-3 bg-[#1a1a1a] shrink-0">
          <AlertDialogCancel
            onClick={() => setIsOpen(false)}
            className="m-0 border-primary-1 text-white bg-transparent hover:bg-gray-800"
          >
            Cancel
          </AlertDialogCancel>
          <Button
            type="button"
            onClick={handleTakePayment}
            className="bg-primary-1 text-black hover:bg-primary-1-hover font-semibold"
          >
            Take payment {formatPrice(totalPaymentAmount)}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>

    {/* Payment success modal */}
    <AlertDialog open={showSuccess} onOpenChange={(open) => !open && handleCloseSuccess()}>
      <AlertDialogContent className="max-w-sm bg-[#1a1a1a] border-gray-800 text-white p-0 gap-0 overflow-hidden">
        <div className="flex flex-col items-center px-6 pt-8 pb-6 text-center">
          <div className="w-16 h-16 rounded-full bg-green-500 flex items-center justify-center mb-5">
            <Check className="w-8 h-8 text-white stroke-3" />
          </div>
          <AlertDialogTitle className="text-xl font-bold text-white mb-2">
            Your Payment is successful
          </AlertDialogTitle>
          <p className="text-sm text-gray-300 leading-relaxed">
            You will receive a check-in code via SMS. Please show this code at the counter to complete your check-in.
          </p>
        </div>
        <AlertDialogFooter className="px-6 pb-6 pt-0 justify-center border-0">
          <Button
            type="button"
            onClick={handleCloseSuccess}
            className="bg-primary-1 text-black hover:bg-primary-1-hover font-semibold w-full sm:w-auto min-w-[120px]"
          >
            OK
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
    </>
  );
}
