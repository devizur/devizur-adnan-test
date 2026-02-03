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
import { useBookingCart } from "@/contexts/BookingCartContext";
import { useActivities } from "@/lib/api/hooks";
import { cn } from "@/lib/utils";
import { OPTIONS, SLOTS, SHIFT } from "@/components/ui/booking/constants";
import { Step4YourDetails } from "@/components/ui/booking";
import { X, ChevronLeft, ChevronRight, Clock, Check } from "lucide-react";

function getOrdinal(n: number) {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

function formatDialogDate(date: Date) {
  const day = date.getDate();
  const month = date.toLocaleString("en-US", { month: "long" });
  const year = date.getFullYear();
  const weekday = date.toLocaleString("en-US", { weekday: "long" });
  return `${weekday}, ${getOrdinal(day)} ${month} ${year}`;
}

interface BookingDialogProps {
  children: React.ReactNode;
  onConfirm?: () => void;
}

export function BookingDialog({ children, onConfirm }: BookingDialogProps) {
  const {
    step,
    setStep,
    selectedProducts,
    totalSelectedQty,
    slot,
    setSlot,
    activeTab,
    setActiveTab,
    bookingDetails,
    setBookingDetails,
    toggleProduct,
    setProductOption,
    updateProductQty,
    resetBookingCart,
  } = useBookingCart();
  const [isOpen, setIsOpen] = React.useState(false);
  const { data: activities = [], isLoading } = useActivities();
  const products = activities.slice(0, 10);

  React.useEffect(() => {
    if (isOpen && !bookingDetails.date) {
      setBookingDetails((prev) => ({
        ...prev,
        date: new Date().toISOString().slice(0, 10),
      }));
    }
  }, [isOpen, bookingDetails.date, setBookingDetails]);

  const displayDate = React.useMemo(() => {
    if (bookingDetails.date) {
      const d = new Date(bookingDetails.date + "T12:00:00");
      if (!isNaN(d.getTime())) return d;
    }
    return new Date();
  }, [bookingDetails.date]);

  const setDisplayDate = (delta: number) => {
    const d = new Date(displayDate);
    d.setDate(d.getDate() + delta);
    setBookingDetails((prev) => ({
      ...prev,
      date: d.toISOString().slice(0, 10),
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onConfirm?.();
    resetBookingCart();
    setIsOpen(false);
  };

  const handleClose = () => {
    setIsOpen(false);
    resetBookingCart();
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogTrigger asChild>{children}</AlertDialogTrigger>
      <AlertDialogContent
        className="min-w-[90%] max-w-6xl max-h-[95vh] flex flex-col bg-[#1a1a1a] p-0 gap-0 text-white border-gray-800"
      >
        <AlertDialogHeader className="px-6 pt-5 pb-4 border-b border-gray-800 relative shrink-0">
          <div className="flex items-center justify-between">
            <AlertDialogTitle className="text-xl font-bold text-white">
              Create Booking
            </AlertDialogTitle>
            <button
              type="button"
              onClick={handleClose}
              className="p-1.5 rounded-md text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </AlertDialogHeader>

        <div className="flex flex-1 min-h-0 overflow-hidden">
          {/* Left panel - Activity List */}
          <div className="w-full lg:w-[380px] shrink-0 border-r border-gray-800 flex flex-col bg-[#1a1a1a]">
            <div className="px-4 py-3 border-b border-gray-800">
              <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wide">
                Activity List
              </h3>
            </div>
            <div className="flex-1 overflow-y-auto p-3 space-y-3 scrollbar-dark">
              {isLoading && (
                <p className="text-sm text-gray-400 py-4">Loading activities...</p>
              )}
              {products.map((pd) => {
                const isActive = selectedProducts.some((item) => item.id === pd.id);
                const product = selectedProducts.find((item) => item.id === pd.id);
                return (
                  <div key={pd.id} className="relative">
                    <button
                      type="button"
                      onClick={() => toggleProduct(pd)}
                      className={cn(
                        "w-full text-left rounded-xl border transition-all overflow-hidden",
                        isActive
                          ? "border-primary-1 bg-[#252525] ring-1 ring-primary-1/30"
                          : "border-gray-800 bg-[#222] hover:border-gray-700"
                      )}
                    >
                      <div className="relative aspect-[2/1] sm:aspect-[3/1] overflow-hidden">
                        <img
                          src={pd.image || "https://picsum.photos/400/200"}
                          alt=""
                          className="w-full h-full object-cover"
                        />
                        {isActive && (
                          <div className="absolute top-2 right-2 w-7 h-7 rounded-full bg-primary-1 flex items-center justify-center">
                            <Check className="w-4 h-4 text-black" strokeWidth={3} />
                          </div>
                        )}
                      </div>
                      <div className="p-3">
                        <h4 className="font-semibold text-white truncate">{pd.title}</h4>
                        <p className="text-xs text-gray-400 mt-0.5 line-clamp-2">
                          {pd.timeSlots?.slice(0, 3).join(", ") || "6:00 am, 6:30 am, 7:00 am"}
                          {pd.timeSlots && pd.timeSlots.length > 3 ? ", ..." : ""}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {OPTIONS.map((opt, i) => (
                            <span key={opt.label}>
                              {opt.label} ${opt.price.toFixed(2)}
                              {i < OPTIONS.length - 1 ? ", " : ""}
                            </span>
                          ))}
                        </p>
                      </div>
                    </button>
                    {isActive && product && (
                      <div className="flex gap-2 mt-2 px-1">
                        {OPTIONS.map((opt) => (
                          <button
                            key={opt.label}
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setProductOption(pd.id, opt.value);
                            }}
                            className={cn(
                              "flex-1 py-2 rounded-lg text-sm font-medium border transition-colors",
                              product?.selectedOption === opt.value
                                ? "bg-primary-1 text-black border-primary-1"
                                : "bg-[#222] text-gray-400 border-gray-700 hover:border-gray-600"
                            )}
                          >
                            {opt.label}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right panel - Availability */}
          <div className="flex-1 flex flex-col min-w-0 bg-[#1a1a1a]">
            <div className="px-5 py-4 border-b border-gray-800 flex flex-col gap-4">
              <div className="flex items-center justify-end">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-primary-1/15 border border-primary-1/40">
                  <Clock className="w-4 h-4 text-primary-1" />
                  <span className="text-sm font-medium text-primary-1">
                    Time Remaining 29:47
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-center gap-2">
                <button
                  type="button"
                  onClick={() => setDisplayDate(-1)}
                  className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800"
                  aria-label="Previous date"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <span className="text-sm font-medium text-white min-w-[220px] text-center">
                  {formatDialogDate(displayDate)}
                </span>
                <button
                  type="button"
                  onClick={() => setDisplayDate(1)}
                  className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800"
                  aria-label="Next date"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
              <div className="flex gap-2">
                {SHIFT.map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id)}
                    className={cn(
                      "flex-1 py-2 rounded-lg text-sm font-medium transition-colors",
                      activeTab === tab.id
                        ? "bg-primary-1 text-black"
                        : "bg-[#222] text-gray-400 border border-gray-700 hover:border-gray-600"
                    )}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-6 scrollbar-dark">
              {step === 1 && (
                <>
                  <div className="space-y-4">
                    <h4 className="text-sm font-medium text-gray-300">Participants</h4>
                    {selectedProducts[0]?.types?.map((type) => (
                      <div
                        key={type.id}
                        className="flex items-center justify-between p-3 rounded-xl bg-[#222] border border-gray-800"
                      >
                        <div>
                          <p className="text-sm font-medium text-white">{type.label}</p>
                          <p className="text-xs text-gray-400">
                            ${type.price.toFixed(2)}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            disabled={type.qty === 0}
                            onClick={() =>
                              updateProductQty(selectedProducts[0].id, type.id, "decrement")
                            }
                            className="w-9 h-9 rounded-lg border border-gray-600 text-white hover:bg-gray-800 disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center"
                          >
                            −
                          </button>
                          <span className="text-lg font-semibold text-white min-w-8 text-center">
                            {type.qty}
                          </span>
                          <button
                            type="button"
                            onClick={() =>
                              updateProductQty(selectedProducts[0].id, type.id, "increment")
                            }
                            className="w-9 h-9 rounded-lg border border-gray-600 text-white hover:bg-gray-800 flex items-center justify-center"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div>
                    <p className="text-[11px] text-gray-500 uppercase tracking-wide mb-2">
                      SELECT START TIME · 34 sessions found
                    </p>
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                      {SLOTS.map((s) => (
                        <button
                          key={s.t}
                          type="button"
                          onClick={() => setSlot(s.t)}
                          className={cn(
                            "relative py-2.5 px-2 rounded-lg border text-xs transition-colors flex flex-col items-center",
                            slot === s.t
                              ? "bg-primary-1 text-black border-primary-1"
                              : "bg-[#222] text-gray-300 border-gray-700 hover:border-gray-600"
                          )}
                        >
                          <span className="font-semibold">{s.t}</span>
                          <span className="text-[10px] opacity-80 mt-0.5">
                            100 avail
                          </span>
                          {"off" in s && s.off && (
                            <span className="absolute top-0.5 right-0.5 bg-primary-1 text-black text-[9px] font-bold px-1 rounded">
                              $5 off
                            </span>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              )}
              {step === 2 && (
                <Step4YourDetails onSubmit={handleSubmit} />
              )}
            </div>

            <AlertDialogFooter className="px-6 py-4 border-t border-gray-800 flex-row justify-between gap-3 flex-wrap bg-[#1a1a1a] shrink-0">
              <div className="flex items-center gap-3">
                <AlertDialogCancel
                  onClick={handleClose}
                  className="m-0 border-gray-700 text-white bg-transparent hover:bg-gray-800"
                >
                  Cancel
                </AlertDialogCancel>
                {step > 1 && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setStep(1)}
                    className="border-gray-700 text-white bg-transparent hover:bg-gray-800"
                  >
                    Back
                  </Button>
                )}
              </div>
              {step === 2 ? (
                <Button
                  type="submit"
                  form="bookingForm"
                  disabled={totalSelectedQty < 1}
                  className="bg-primary-1 text-black hover:bg-primary-1-hover disabled:opacity-50 disabled:cursor-not-allowed font-semibold px-6"
                >
                  Booking Request
                  {totalSelectedQty > 0 ? ` with ${totalSelectedQty} Person${totalSelectedQty > 1 ? "s" : ""}` : ""}
                </Button>
              ) : (
                <Button
                  type="button"
                  disabled={selectedProducts.length === 0 || totalSelectedQty < 1}
                  className="bg-gray-600 text-gray-300 hover:bg-gray-500 disabled:opacity-50 disabled:cursor-not-allowed font-semibold px-6"
                  onClick={() => setStep(2)}
                >
                  Booking Request
                </Button>
              )}
            </AlertDialogFooter>
          </div>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
}
