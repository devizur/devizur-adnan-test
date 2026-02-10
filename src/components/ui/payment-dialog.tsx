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

const PAYMENT_METHODS = ["Credit Card", "Cash"] as const;
type PaymentMethod = (typeof PAYMENT_METHODS)[number];

const CREDIT_CARD_FEE_RATE = 0.03; // 3%

function resetPaymentForm(
  setPaymentMethod: (v: PaymentMethod) => void,
  setCardNumber: (v: string) => void,
  setNameOnCard: (v: string) => void,
  setExpiryMM: (v: string) => void,
  setExpiryYY: (v: string) => void,
  setCvv: (v: string) => void,
  setPaymentAmountInput: (v: string) => void
) {
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
    getTotalItems,
  } = useCart();

  const [isOpen, setIsOpen] = React.useState(false);
  const [showSuccess, setShowSuccess] = React.useState(false);
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

  const defaultPaymentAmount = totalBeforeFees;
  const paymentAmountRaw = paymentAmountInput ? parseFloat(paymentAmountInput.replace(/[^0-9.]/g, "")) : defaultPaymentAmount;
  const paymentAmount = Number.isNaN(paymentAmountRaw) || paymentAmountRaw <= 0 ? defaultPaymentAmount : paymentAmountRaw;

  const isCreditCard = paymentMethod === "Credit Card";
  const creditCardFee = isCreditCard ? Math.round(paymentAmount * CREDIT_CARD_FEE_RATE * 100) / 100 : 0;
  const totalPaymentAmount = paymentAmount + creditCardFee;

  React.useEffect(() => {
    if (!isOpen) return;
    setPaymentAmountInput(formatPrice(totalBeforeFees));
  }, [isOpen, totalBeforeFees]);

  const handleTakePayment = () => {
    clearCart();
    resetPaymentForm(
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

  const handlePaymentDialogOpenChange = (open: boolean) => {
    if (!open) {
      resetPaymentForm(
        setPaymentMethod,
        setCardNumber,
        setNameOnCard,
        setExpiryMM,
        setExpiryYY,
        setCvv,
        setPaymentAmountInput
      );
    }
    setIsOpen(open);
  };

  const isCartEmpty = getTotalItems() === 0;
  const cannotTakePayment = isCartEmpty || totalBeforeFees <= 0;

  return (
    <>
    <AlertDialog open={isOpen} onOpenChange={handlePaymentDialogOpenChange}>
      <AlertDialogTrigger asChild>{children}</AlertDialogTrigger>
      <AlertDialogContent
        className="min-w-[90%] max-w-3xl max-h-[90vh] flex flex-col bg-[#161616] p-0 gap-0 text-white border border-gray-800/80 rounded-2xl overflow-hidden"
      >
        <AlertDialogHeader className="px-6 pt-5 pb-4 border-b border-gray-800/80 shrink-0">
          <div className="flex items-center justify-between w-full">
            <AlertDialogTitle className="text-lg font-semibold text-white">
              Payment
            </AlertDialogTitle>
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Left: Payment options */}
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Payment method</label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                  aria-label="Payment method"
                  className="w-full min-h-11 rounded-xl border border-gray-700 bg-[#1e1e1e] text-white px-3 text-sm focus:border-primary-1 focus:outline-none focus:ring-2 focus:ring-primary-1/30 transition-shadow cursor-pointer"
                >
                  {PAYMENT_METHODS.map((m) => (
                    <option key={m} value={m} className="bg-[#1e1e1e] text-white">
                      {m}
                    </option>
                  ))}
                </select>
              </div>

              {isCreditCard && (
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
              )}

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Amount to pay</label>
                <Input
                  placeholder={formatPrice(defaultPaymentAmount)}
                  value={paymentAmountInput}
                  onChange={(e) => setPaymentAmountInput(e.target.value)}
                  className="h-10 rounded-xl bg-[#1e1e1e] border-gray-700 text-white placeholder:text-gray-500 focus-visible:ring-primary-1/50"
                />
              </div>
            </div>

            {/* Right: Summary */}
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
                    {isCreditCard && (
                      <div className="flex justify-between text-gray-400">
                        <span>Card fee (3%)</span>
                        <span>{formatPrice(creditCardFee)}</span>
                      </div>
                    )}
                  </div>
                  <div className="border-t border-gray-800 pt-3 flex justify-between items-center">
                    <span className="text-sm font-medium text-white">Total</span>
                    <span className="text-lg font-semibold text-white">{formatPrice(totalPaymentAmount)}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
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
            onClick={handleTakePayment}
            disabled={cannotTakePayment}
            aria-label={`Pay ${formatPrice(totalPaymentAmount)}`}
            className="min-h-11 bg-primary-1 text-black hover:bg-primary-1/90 hover:shadow-[0_0_20px_rgba(255,236,0,0.35)] font-medium rounded-xl px-5 cursor-pointer transition-all focus-visible:ring-primary-1/50 disabled:opacity-50 disabled:pointer-events-none disabled:cursor-not-allowed"
          >
            Pay {formatPrice(totalPaymentAmount)}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>

    {/* Payment success modal */}
    <AlertDialog open={showSuccess} onOpenChange={(open) => !open && handleCloseSuccess()}>
      <AlertDialogContent className="max-w-sm bg-[#161616] border border-gray-800/80 rounded-2xl text-white p-0 gap-0 overflow-hidden">
        <div className="flex flex-col items-center px-6 pt-8 pb-6 text-center">
          <div className="w-14 h-14 rounded-full bg-emerald-500/20 flex items-center justify-center mb-4 ring-4 ring-emerald-500/30">
            <Check className="w-7 h-7 text-emerald-400 stroke-[2.5]" />
          </div>
          <AlertDialogTitle className="text-lg font-semibold text-white mb-2">
            Payment successful
          </AlertDialogTitle>
          <p className="text-sm text-gray-400 leading-relaxed">
            You’ll get a check-in code by SMS. Show it at the counter to complete check-in.
          </p>
        </div>
        <AlertDialogFooter className="px-6 pb-6 pt-0 justify-center border-0">
          <Button
            type="button"
            onClick={handleCloseSuccess}
            autoFocus
            className="min-h-11 bg-primary-1 text-black hover:bg-primary-1-hover font-medium rounded-xl w-full sm:min-w-[120px] cursor-pointer focus-visible:ring-primary-1/50"
          >
            Done
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
    </>
  );
}
