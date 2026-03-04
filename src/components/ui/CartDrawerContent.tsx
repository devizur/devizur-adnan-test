import React from "react";
import { IoMdClose } from "react-icons/io";
import { Minus, Plus, Trash2 } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import type { CartEntry } from "@/contexts/CartContext";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PaymentDialog } from "@/components/ui/payment-dialog";
import { DrawerClose } from "@/components/ui/drawer";
import { formatPrice, parsePrice } from "@/lib/utils";

function holderLabel(entry: CartEntry): string {
  const { firstName, lastName, email } = entry.holderDetails;
  const name = [firstName, lastName].filter(Boolean).join(" ").trim();
  return name || email || "Booking";
}

interface CartDrawerContentProps {
  onPaymentSuccess?: () => void;
}

export const CartDrawerContent: React.FC<CartDrawerContentProps> = ({
  onPaymentSuccess,
}) => {
  const {
    entries,
    removeEntry,
    updateEntry,
    clearCart,
    foodItems,
    activityItems,
    packageItems,
  } = useCart();

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
  const total = subtotal + serviceFee - discount;

  return (
    <>
      <div className="p-6 border-b border-accent/20 ">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-2xl font-bold text-primary">Checkout</h2>
          <DrawerClose asChild>
            <div>
              <IoMdClose className="text-2xl cursor-pointer font-bold text-primary" />
            </div>
          </DrawerClose>
        </div>
        <p className="text-sm text-gray-400">
          Items, bookings, and table reservations—all in one place. Cart is saved
          locally until payment.
        </p>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {entries.length === 0 ? (
          <Card className="p-6 bg-secondary border border-accent/10">
            <p className="text-gray-400 text-sm">
              Your cart is empty. Add a booking to continue.
            </p>
          </Card>
        ) : (
          entries.map((entry) => (
            <Card
              key={entry.id}
              className="p-4 bg-secondary border border-accent/10"
            >
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-bold text-primary">
                  Booking for {holderLabel(entry)}
                </h3>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => removeEntry(entry.id)}
                    className="p-1.5 text-gray-400 hover:text-red-400 transition-colors rounded-lg hover:bg-red-500/10"
                    aria-label="Remove this booking"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {entry.activities.length > 0 && (
                <div className="space-y-2 mb-3">
                  <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Activities
                  </p>
                  {entry.activities.map(({ activity, gameNo }) => (
                    <div
                      key={activity.id}
                      className="flex items-center gap-3 border border-accent/40 rounded-xl p-2"
                    >
                      <img
                        src={activity.image}
                        alt={activity.title}
                        className="w-12 h-12 rounded-lg object-cover shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-primary truncate">
                          {activity.title}
                        </p>
                        <p className="text-xs text-accent">
                          {activity.price} × {gameNo}
                        </p>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          type="button"
                          onClick={() =>
                            updateEntry(entry.id, (prev) => ({
                              ...prev,
                              activities: prev.activities.map((a) =>
                                a.activity.id === activity.id
                                  ? {
                                      ...a,
                                      gameNo: Math.max(1, a.gameNo - 1) as 1 | 2 | 3,
                                    }
                                  : a
                              ),
                            }))
                          }
                          disabled={gameNo <= 1}
                          className="w-8 h-8 rounded border border-primary-1/30 bg-secondary-2 text-primary-1 flex items-center justify-center hover:bg-primary-1/10 transition-all disabled:opacity-40 disabled:pointer-events-none"
                          aria-label="Decrease games"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="text-sm font-medium text-primary w-6 text-center">
                          {gameNo}
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            updateEntry(entry.id, (prev) => ({
                              ...prev,
                              activities: prev.activities.map((a) =>
                                a.activity.id === activity.id
                                  ? {
                                      ...a,
                                      gameNo: Math.min(3, a.gameNo + 1) as 1 | 2 | 3,
                                    }
                                  : a
                              ),
                            }))
                          }
                          disabled={gameNo >= 3}
                          className="w-8 h-8 rounded bg-primary-1 text-black flex items-center justify-center hover:bg-primary-1/90 transition-all disabled:opacity-40 disabled:pointer-events-none"
                          aria-label="Increase games"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            updateEntry(entry.id, (prev) => ({
                              ...prev,
                              activities: prev.activities.filter(
                                (a) => a.activity.id !== activity.id
                              ),
                            }))
                          }
                          className="p-1.5 text-gray-400 hover:text-red-400 transition-colors rounded-lg hover:bg-red-500/10"
                          aria-label="Remove activity"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {entry.packages.length > 0 && (
                <div className="space-y-2 mb-3">
                  <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Packages
                  </p>
                  {entry.packages.map((pkg) => (
                    <div
                      key={pkg.id}
                      className="flex items-center gap-3 border border-accent/40 rounded-xl p-2"
                    >
                      <img
                        src={pkg.image}
                        alt={pkg.title}
                        className="w-12 h-12 rounded-lg object-cover shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-primary truncate">
                          {pkg.title}
                        </p>
                        <p className="text-xs text-accent">{pkg.price}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() =>
                          updateEntry(entry.id, (prev) => ({
                            ...prev,
                            packages: prev.packages.filter((p) => p.id !== pkg.id),
                          }))
                        }
                        className="p-1.5 text-gray-400 hover:text-red-400 transition-colors rounded-lg hover:bg-red-500/10 shrink-0"
                        aria-label="Remove package"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {entry.foods.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Food
                  </p>
                  {entry.foods.map(({ food, quantity }) => (
                    <div
                      key={food.id}
                      className="flex items-center gap-3 border border-accent/40 rounded-xl p-2"
                    >
                      <img
                        src={food.image}
                        alt={food.title}
                        className="w-12 h-12 rounded-lg object-cover shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-primary truncate">
                          {food.title}
                        </p>
                        <p className="text-xs text-accent">
                          {food.price} × {quantity}
                        </p>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          type="button"
                          onClick={() =>
                            updateEntry(entry.id, (prev) => {
                              const next = prev.foods
                                .map((f) =>
                                  f.food.id === food.id
                                    ? { ...f, quantity: Math.max(0, f.quantity - 1) }
                                    : f
                                )
                                .filter((f) => f.quantity > 0);
                              return { ...prev, foods: next };
                            })
                          }
                          className="w-8 h-8 rounded border border-primary-1/30 bg-secondary-2 text-primary-1 flex items-center justify-center hover:bg-primary-1/10 transition-all"
                          aria-label="Decrease quantity"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="text-sm font-medium text-primary w-6 text-center">
                          {quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            updateEntry(entry.id, (prev) => ({
                              ...prev,
                              foods: prev.foods.map((f) =>
                                f.food.id === food.id
                                  ? { ...f, quantity: f.quantity + 1 }
                                  : f
                              ),
                            }))
                          }
                          className="w-8 h-8 rounded bg-primary-1 text-black flex items-center justify-center hover:bg-primary-1/90 transition-all"
                          aria-label="Increase quantity"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            updateEntry(entry.id, (prev) => ({
                              ...prev,
                              foods: prev.foods.filter((f) => f.food.id !== food.id),
                            }))
                          }
                          className="p-1.5 text-gray-400 hover:text-red-400 transition-colors rounded-lg hover:bg-red-500/10"
                          aria-label="Remove food"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          ))
        )}

        {entries.length > 0 && (
          <>
            <Card className="p-4 bg-secondary border border-accent/10">
              <h3 className="text-lg font-bold text-primary mb-3">Summary</h3>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-primary">Subtotal</span>
                  <span className="text-primary font-medium">
                    {formatPrice(subtotal)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-primary">Service Fee (5%)</span>
                  <span className="text-primary font-medium">
                    {formatPrice(serviceFee)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-primary-1">Discount</span>
                  <span className="text-primary">{formatPrice(discount)}</span>
                </div>
                <div className="pt-3 border-t border-accent/10 flex justify-between">
                  <span className="text-lg font-semibold text-primary">
                    Total Amount
                  </span>
                  <span className="text-xl font-semibold text-primary">
                    {formatPrice(total)}
                  </span>
                </div>
              </div>

              <div className="space-y-3 mt-4 bg-secondary-2">
                <PaymentDialog onPaymentSuccess={onPaymentSuccess}>
                  <Button className="w-full cursor-pointer py-4 rounded-[10px] text-[15px] bg-primary-1 hover:bg-primary-1/90 font-bold text-secondary">
                    Add Payment
                  </Button>
                </PaymentDialog>
                <Button
                  variant="outline"
                  className="w-full cursor-pointer py-4 rounded-[10px] text-[15px] bg-primary-1/10 hover:bg-primary-2 text-primary-1 border border-primary-1"
                  onClick={clearCart}
                >
                  Clear Cart
                </Button>
              </div>
            </Card>
            <p className="text-xs text-gray-400 pt-1">
              Cart is stored in your browser. After payment, the cart is cleared.
            </p>
          </>
        )}
      </div>
    </>
  );
};

