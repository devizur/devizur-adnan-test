"use client";

import * as React from "react";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/utils";
import { CancelOrderConfirmDialog } from "@/components/ui/cancel-order-dialog";
import { fetchOrdersFromBackend } from "@/lib/ordersApi";
import { loadPaidOrders, type PaidOrderRecord } from "@/lib/paidOrdersStorage";
import type { CartEntry } from "@/contexts/CartContext";
import { Calendar, Clock, LogOut, User, RefreshCw, Ticket, ArrowLeft, Eye, Sparkles } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { useRouter } from "next/navigation";
import { useAppDispatch } from "@/store/hooks";
import { clearAuth } from "@/store/authSlice";
import { ProtectedRoute } from "@/components/providers/protected-route";

function shiftLabel(timeOfDay: 1 | 2 | 3): string {
  if (timeOfDay === 1) return "Morning";
  if (timeOfDay === 2) return "Afternoon";
  return "Evening";
}

function bookingTitle(entry: CartEntry): string {
  const a = entry.activities[0]?.activity;
  if (a) return a.title || a.productName || "Activity";
  const p = entry.packages[0];
  if (p) return p.title || p.productName || "Package";
  if (entry.foods.length) return "Food add-ons";
  return "Booking";
}

function bookingImage(entry: CartEntry): string {
  const a = entry.activities[0]?.activity;
  const fromA = a && "image" in a && typeof (a as { image?: string }).image === "string" ? (a as { image: string }).image : "";
  if (fromA) return fromA;
  const p = entry.packages[0];
  const fromP = p && "image" in p && typeof (p as { image?: string }).image === "string" ? (p as { image: string }).image : "";
  if (fromP) return fromP;
  return "/images/bowling.png";
}

function peopleLabel(entry: CartEntry): string {
  const { adults, kids } = entry.persons;
  const parts = [`${adults} adult${adults !== 1 ? "s" : ""}`];
  if (kids > 0) parts.push(`${kids} kid${kids !== 1 ? "s" : ""}`);
  return parts.join(", ");
}

/** Next/Image only allows configured hosts for optimization; API URLs are arbitrary. */
function isRemoteImageSrc(src: string): boolean {
  return /^https?:\/\//i.test(src);
}

function formatPaidAt(ts: number): string {
  return new Date(ts).toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function orderPaidDisplay(order: PaidOrderRecord): string {
  if (typeof order.paidAt === "number" && !Number.isNaN(order.paidAt)) {
    return formatPaidAt(order.paidAt);
  }
  if (order.serverReceivedAt) {
    const d = Date.parse(order.serverReceivedAt);
    if (!Number.isNaN(d)) return formatPaidAt(d);
  }
  return "—";
}

function OrderDetailsDialog({
  order,
  open,
  onOpenChange,
  onRequestCancel,
}: {
  order: PaidOrderRecord | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onRequestCancel?: (order: PaidOrderRecord) => void;
}) {
  if (!order) return null;

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-h-[min(90vh,840px)] w-full max-w-2xl gap-0 overflow-hidden rounded-2xl border-0 bg-transparent p-0 shadow-none sm:max-w-2xl outline-none focus-visible:ring-0 focus-visible:ring-offset-0">
        <div
          className={cn(
            "flex max-h-[min(90vh,840px)] w-full flex-col overflow-hidden rounded-2xl",
            "border border-zinc-600/70 bg-[#141414]",
            "shadow-[0_0_0_1px_rgba(250,204,21,0.12),0_28px_90px_-20px_rgba(0,0,0,0.85)]",
          )}
        >
          <AlertDialogHeader className="border-b border-zinc-700/60 bg-[#1a1a1a] px-5 py-4 text-left sm:text-left">
            <AlertDialogTitle className="text-primary pr-8">Order details</AlertDialogTitle>
            <AlertDialogDescription className="text-zinc-500 text-sm">
              Order <span className="font-mono text-zinc-400">{order.id}</span> · Paid {orderPaidDisplay(order)}
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className="max-h-[min(70vh,640px)] overflow-y-auto px-5 py-4 space-y-6 bg-[#121212] text-primary">
            <div className="grid gap-2 text-sm">
              <div className="flex flex-wrap justify-between gap-2 border-b border-zinc-700/50 pb-3">
                <span className="text-zinc-500">Total paid</span>
                <span className="font-semibold text-lg">{formatPrice(order.totalAmount)}</span>
              </div>
              {order.stripePaymentIntentId ? (
                <div>
                  <p className="text-xs text-zinc-500 mb-0.5">Stripe payment</p>
                  <p className="font-mono text-xs text-zinc-400 break-all">{order.stripePaymentIntentId}</p>
                </div>
              ) : null}
              {order.serverReceivedAt ? (
                <div>
                  <p className="text-xs text-zinc-500 mb-0.5">Saved on server</p>
                  <p className="text-sm text-zinc-400">{order.serverReceivedAt}</p>
                </div>
              ) : null}
            </div>

            {order.entries.map((entry, idx) => {
            const h = entry.holderDetails;
            const holderName = `${h.firstName} ${h.lastName}`.trim() || "—";

            return (
              <section
                key={entry.id}
                className="rounded-xl border border-zinc-700/55 bg-[#1a1a1a] p-4 space-y-4 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.04)]"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h4 className="text-sm font-semibold text-zinc-200">
                    {order.entries.length > 1 ? `Booking ${idx + 1}` : "Booking"}
                  </h4>
                  <Badge className="bg-emerald-500/15 text-emerald-300 border border-emerald-500/25">Paid</Badge>
                </div>

                <div className="grid gap-3 text-sm text-zinc-400">
                  <div className="flex flex-wrap gap-x-4 gap-y-1">
                    <span className="flex items-center gap-1.5">
                      <Calendar className="size-4 text-primary-1 shrink-0" />
                      {entry.date}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Clock className="size-4 text-primary-1 shrink-0" />
                      {entry.timeSlot} · {shiftLabel(entry.timeOfDay)}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <User className="size-4 text-primary-1 shrink-0" />
                      {peopleLabel(entry)}
                    </span>
                  </div>

                  <div className="rounded-lg border border-zinc-700/45 bg-[#141414] px-3 py-2.5 space-y-1.5">
                    <p className="text-xs uppercase tracking-wide text-zinc-500">Holder</p>
                    <p className="text-zinc-200 font-medium">{holderName}</p>
                    <p className="text-zinc-400">{h.email || "—"}</p>
                    <p className="text-zinc-400">{h.phone || "—"}</p>
                    <p className="text-zinc-400">
                      {[h.address, h.postCode].filter(Boolean).join(", ") || "—"}
                    </p>
                  </div>
                </div>

                <div className="space-y-2 border-t border-zinc-700/45 pt-3">
                  <p className="text-xs uppercase tracking-wide text-zinc-500">Line items</p>
                  <ul className="space-y-2 text-sm">
                    {entry.activities.map(({ activity, gameNo }) => (
                      <li key={`a-${activity.id}-${gameNo}`} className="flex justify-between gap-2 text-zinc-300">
                        <span className="min-w-0">
                          {activity.title || activity.productName}
                          <span className="text-zinc-500"> · Activity</span>
                        </span>
                        <span className="text-zinc-500 shrink-0">
                          {gameNo} game{gameNo !== 1 ? "s" : ""}
                        </span>
                      </li>
                    ))}
                    {entry.packages.map((pkg) => (
                      <li key={`p-${pkg.id}`} className="flex justify-between gap-2 text-zinc-300">
                        <span className="min-w-0">{pkg.title || pkg.productName}</span>
                        <span className="text-zinc-500 shrink-0">Package</span>
                      </li>
                    ))}
                    {entry.foods.map(({ food, quantity }) => (
                      <li key={`f-${food.id}`} className="flex justify-between gap-2 text-zinc-300">
                        <span className="min-w-0">{food.title || food.productName}</span>
                        <span className="text-zinc-500 shrink-0">×{quantity}</span>
                      </li>
                    ))}
                    {entry.activities.length === 0 &&
                    entry.packages.length === 0 &&
                    entry.foods.length === 0 ? (
                      <li className="text-zinc-500">No items recorded</li>
                    ) : null}
                  </ul>
                </div>
              </section>
            );
            })}
          </div>

          <AlertDialogFooter className="border-t border-zinc-700/60 bg-[#1a1a1a] px-5 py-4 flex-col-reverse sm:flex-row sm:justify-end gap-2">
            {onRequestCancel ? (
              <Button
                type="button"
                variant="outline"
                className="border-red-900/40 text-red-400 hover:bg-red-950/30 hover:text-red-300 w-full sm:w-auto"
                onClick={() => {
                  onRequestCancel(order);
                  onOpenChange(false);
                }}
              >
                Cancel order
              </Button>
            ) : null}
            <AlertDialogCancel className="border-zinc-600/90 text-zinc-300 hover:bg-zinc-800 hover:text-white hover:border-zinc-500 mt-0 w-full sm:w-auto">
              Close
            </AlertDialogCancel>
          </AlertDialogFooter>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export default function MyBookingsPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [orders, setOrders] = React.useState<PaidOrderRecord[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [loadError, setLoadError] = React.useState<string | null>(null);
  const [source, setSource] = React.useState<"backend" | "local" | null>(null);
  const [viewOrder, setViewOrder] = React.useState<PaidOrderRecord | null>(null);
  const [cancelTarget, setCancelTarget] = React.useState<PaidOrderRecord | null>(null);

  const load = React.useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const list = await fetchOrdersFromBackend();
      setOrders(list);
      setSource("backend");
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Server unavailable";
      setLoadError(msg);
      setOrders(loadPaidOrders());
      setSource("local");
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    void load();
  }, [load]);

  const rows = React.useMemo(
    () => orders.flatMap((order) => order.entries.map((entry) => ({ order, entry }))),
    [orders],
  );

  const handleLogout = () => {
    dispatch(clearAuth());
    router.push("/sign-in");
  };

  return (
    <ProtectedRoute>
      <CancelOrderConfirmDialog
        order={cancelTarget}
        open={cancelTarget !== null}
        onOpenChange={(open) => {
          if (!open) setCancelTarget(null);
        }}
        onRemoved={(orderId) => {
          setOrders((prev) => prev.filter((o) => o.id !== orderId));
          setViewOrder((v) => (v?.id === orderId ? null : v));
        }}
      />
      <OrderDetailsDialog
        order={viewOrder}
        open={viewOrder !== null}
        onOpenChange={(open) => {
          if (!open) setViewOrder(null);
        }}
        onRequestCancel={(o) => setCancelTarget(o)}
      />
      <div className="min-w-0 pt-24 sm:pt-32 pb-16 sm:pb-20 text-primary">
        <div className="container mx-auto px-4 sm:px-6 space-y-8">
          <div className="flex flex-col gap-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <Button
                type="button"
                variant="outline"
                asChild
                className="border-zinc-700/90 text-zinc-300 hover:bg-zinc-800/80 hover:text-white hover:border-zinc-600 rounded-xl h-10"
              >
                <Link href="/">
                  <ArrowLeft className="size-4 mr-2" />
                  Home
                </Link>
              </Button>
              <div className="flex flex-wrap items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  asChild
                  className="border-zinc-700/90 text-zinc-300 hover:bg-zinc-800/80 hover:border-zinc-600 rounded-xl h-10"
                >
                  <Link href="/orders">Orders</Link>
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => void load()}
                  disabled={loading}
                  className="border-zinc-700/90 text-zinc-300 hover:bg-zinc-800/80 hover:border-zinc-600 rounded-xl h-10"
                >
                  <RefreshCw className={cn("size-4 mr-2", loading && "animate-spin")} />
                  Refresh
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleLogout}
                  className="border-zinc-700/90 text-zinc-300 hover:bg-zinc-800/80 hover:border-zinc-600 rounded-xl h-10 shrink-0"
                >
                  <LogOut className="size-4 mr-2" />
                  Log out
                </Button>
              </div>
            </div>

            <header className="relative overflow-hidden rounded-2xl border border-zinc-800/90 bg-linear-to-br from-[#1c1c1c] via-[#161616] to-[#141414] px-5 py-6 sm:px-7 sm:py-8 shadow-[0_0_0_1px_rgba(255,255,255,0.03)_inset]">
              <div
                className="pointer-events-none absolute inset-y-0 left-0 w-1 bg-linear-to-b from-primary-1 via-primary-1/70 to-primary-1/25"
                aria-hidden
              />
              <div className="relative pl-4 sm:pl-5 space-y-4">
                <div className="flex flex-wrap items-center gap-3">
                  <div
                    className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary-1/12 ring-1 ring-primary-1/25 shadow-[0_0_24px_-4px_rgba(250,204,21,0.25)]"
                    aria-hidden
                  >
                    <Ticket className="size-5 text-primary-1" strokeWidth={2} />
                  </div>
                  <div className="flex flex-col gap-0.5 min-w-0">
                    <p className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-[0.22em] text-primary-1/95">
                      Reservations
                    </p>
                    <p className="text-xs text-zinc-500 font-medium tracking-wide">Paid bookings & receipts</p>
                  </div>
                </div>
                <div className="space-y-2.5">
                  <h1 className="text-3xl sm:text-[2.125rem] font-bold text-primary tracking-tight leading-[1.15]">
                    My Bookings
                  </h1>
                  <p className="text-zinc-400 text-sm sm:text-[15px] leading-relaxed max-w-xl">
                    {source === "backend"
                      ? "Synced from your checkout server — each card is a booking line from a paid order."
                      : source === "local"
                        ? "Could not reach the orders API. Showing orders saved in this browser only. Start the Stripe server and refresh."
                        : "Loading your bookings…"}
                  </p>
                  {source === "backend" ? (
                    <p className="text-[11px] text-emerald-500/90 font-medium inline-flex items-center gap-1.5">
                      <Sparkles className="size-3.5 shrink-0 opacity-90" aria-hidden />
                      Live · backend JSON
                    </p>
                  ) : null}
                  {source === "local" && loadError ? (
                    <p className="text-[11px] text-amber-400/90 font-medium rounded-lg bg-amber-500/10 border border-amber-500/20 px-3 py-2 max-w-xl">
                      {loadError}
                    </p>
                  ) : null}
                </div>
              </div>
            </header>
          </div>

          {loading ? (
            <div className="space-y-4" aria-busy="true" aria-label="Loading bookings">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="rounded-2xl border border-zinc-800/80 bg-[#1a1a1a]/80 p-4 sm:p-5 flex flex-col sm:flex-row gap-4"
                >
                  <Skeleton className="h-44 sm:h-36 w-full sm:w-44 shrink-0 rounded-xl bg-zinc-800/60" />
                  <div className="flex-1 space-y-3 py-1">
                    <Skeleton className="h-6 w-2/3 max-w-xs rounded-md bg-zinc-800/60" />
                    <div className="flex flex-wrap gap-2">
                      <Skeleton className="h-7 w-24 rounded-full bg-zinc-800/50" />
                      <Skeleton className="h-7 w-28 rounded-full bg-zinc-800/50" />
                      <Skeleton className="h-7 w-20 rounded-full bg-zinc-800/50" />
                    </div>
                    <Skeleton className="h-4 w-full max-w-md rounded-md bg-zinc-800/40" />
                    <Skeleton className="h-9 w-32 rounded-xl bg-zinc-800/50" />
                  </div>
                </div>
              ))}
            </div>
          ) : rows.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-zinc-700/90 bg-[#1a1a1a]/60 px-6 py-14 sm:py-16 text-center space-y-4 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.04)]">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-zinc-800/80 ring-1 ring-zinc-700/80">
                <Calendar className="size-7 text-zinc-500" strokeWidth={1.5} />
              </div>
              <div className="space-y-2 max-w-md mx-auto">
                <p className="text-lg font-semibold text-zinc-200">No bookings yet</p>
                <p className="text-zinc-500 text-sm leading-relaxed">
                  Complete a checkout while the Stripe server is running to save orders, then refresh this page.
                </p>
              </div>
              <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                <Button asChild className="bg-primary-1 text-black hover:bg-primary-1-hover font-semibold rounded-xl h-10 px-6">
                  <Link href="/activities">Browse activities</Link>
                </Button>
                <Button asChild variant="outline" className="border-zinc-600 text-zinc-300 hover:bg-zinc-800 rounded-xl h-10">
                  <Link href="/orders">View order list</Link>
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-5">
              <div className="flex flex-wrap items-end justify-between gap-3">
                <p className="text-sm text-zinc-500">
                  <span className="text-zinc-300 font-medium tabular-nums">{orders.length}</span> paid order
                  {orders.length !== 1 ? "s" : ""}
                  <span className="text-zinc-600 mx-2">·</span>
                  <span className="text-zinc-300 font-medium tabular-nums">{rows.length}</span> booking line
                  {rows.length !== 1 ? "s" : ""}
                </p>
              </div>
              {rows.map(({ order, entry }, rowIdx) => {
                const isFirstRowForOrder = rows.findIndex((r) => r.order.id === order.id) === rowIdx;
                const title = bookingTitle(entry);
                const img = bookingImage(entry);
                const holder = `${entry.holderDetails.firstName} ${entry.holderDetails.lastName}`.trim();

                return (
                  <article
                    key={`${order.id}-${entry.id}`}
                    className={cn(
                      "group rounded-2xl border border-zinc-800/90 bg-[#1a1a1a] p-4 sm:p-5 lg:p-6",
                      "flex flex-col lg:flex-row gap-5 lg:gap-6",
                      "shadow-sm transition-all duration-200",
                      "hover:border-zinc-700/90 hover:shadow-[0_8px_30px_-12px_rgba(0,0,0,0.65)]",
                    )}
                  >
                    <div className="shrink-0 relative w-full lg:w-52 aspect-[16/10] lg:aspect-auto lg:h-36 rounded-xl overflow-hidden bg-zinc-900 ring-1 ring-white/[0.06]">
                      <Image
                        src={img}
                        alt={title}
                        fill
                        className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                        sizes="(max-width: 1024px) 100vw, 208px"
                        unoptimized={isRemoteImageSrc(img)}
                      />
                      <div
                        className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2 bg-linear-to-t from-black/55 to-transparent lg:hidden"
                        aria-hidden
                      />
                      <div className="absolute top-2.5 right-2.5 lg:hidden">
                        <Badge className="bg-emerald-500/25 text-emerald-200 border border-emerald-500/35 backdrop-blur-sm text-[10px] px-2 py-0.5">
                          Paid
                        </Badge>
                      </div>
                    </div>

                    <div className="flex-1 flex flex-col min-w-0 gap-4">
                      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                        <div className="min-w-0 space-y-3 flex-1">
                          <div className="flex flex-wrap items-center gap-2.5 gap-y-2">
                            <h2 className="text-lg sm:text-xl font-bold text-primary tracking-tight leading-snug">
                              {title}
                            </h2>
                            <Badge className="hidden lg:inline-flex bg-emerald-500/15 text-emerald-300 border border-emerald-500/25 text-[10px] uppercase tracking-wide">
                              Paid
                            </Badge>
                          </div>

                          <div className="flex flex-wrap gap-2">
                            <span className="inline-flex items-center gap-1.5 rounded-full border border-zinc-700/80 bg-zinc-900/50 px-3 py-1 text-xs text-zinc-300">
                              <Calendar className="size-3.5 text-primary-1 shrink-0" aria-hidden />
                              {entry.date}
                            </span>
                            <span className="inline-flex items-center gap-1.5 rounded-full border border-zinc-700/80 bg-zinc-900/50 px-3 py-1 text-xs text-zinc-300">
                              <Clock className="size-3.5 text-primary-1 shrink-0" aria-hidden />
                              {entry.timeSlot} · {shiftLabel(entry.timeOfDay)}
                            </span>
                            <span className="inline-flex items-center gap-1.5 rounded-full border border-zinc-700/80 bg-zinc-900/50 px-3 py-1 text-xs text-zinc-300">
                              <User className="size-3.5 text-primary-1 shrink-0" aria-hidden />
                              {peopleLabel(entry)}
                            </span>
                          </div>

                          <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                            {isFirstRowForOrder ? (
                              <p className="text-lg sm:text-xl font-semibold text-white tabular-nums tracking-tight">
                                {formatPrice(order.totalAmount)}
                                <span className="ml-2 text-xs font-normal text-zinc-500 normal-case">order total</span>
                              </p>
                            ) : (
                              <p className="text-xs text-zinc-500">
                                Same order — total{" "}
                                <span className="text-zinc-400 font-mono tabular-nums">{formatPrice(order.totalAmount)}</span>
                              </p>
                            )}
                          </div>

                          <div className="rounded-lg border border-zinc-800/90 bg-[#141414]/80 px-3 py-2 text-[11px] sm:text-xs text-zinc-500 space-y-1">
                            <p>
                              <span className="text-zinc-600">Order</span>{" "}
                              <span className="font-mono text-zinc-400">{order.id}</span>
                              {holder ? (
                                <>
                                  <span className="text-zinc-700 mx-1.5">·</span>
                                  <span className="text-zinc-400">{holder}</span>
                                </>
                              ) : null}
                            </p>
                            {order.stripePaymentIntentId ? (
                              <p className="font-mono text-zinc-600 truncate" title={order.stripePaymentIntentId}>
                                {order.stripePaymentIntentId}
                              </p>
                            ) : null}
                          </div>
                        </div>

                        <div className="flex flex-row lg:flex-col gap-2 shrink-0 w-full lg:w-[9.5rem]">
                          <Button
                            type="button"
                            className="flex-1 lg:flex-none bg-primary-1 hover:bg-primary-1-hover text-black font-semibold h-10 rounded-xl shadow-sm"
                            onClick={() => setViewOrder(order)}
                          >
                            <Eye className="size-4 mr-2 opacity-90" aria-hidden />
                            View
                          </Button>
                          {isFirstRowForOrder ? (
                            <Button
                              type="button"
                              variant="outline"
                              className="flex-1 lg:flex-none border-red-900/45 text-red-400 hover:bg-red-950/30 hover:text-red-300 h-10 rounded-xl"
                              onClick={() => setCancelTarget(order)}
                            >
                              Cancel
                            </Button>
                          ) : null}
                        </div>
                      </div>

                      {(entry.activities.length > 1 || entry.packages.length > 0 || entry.foods.length > 0) && (
                        <div className="rounded-xl border border-zinc-800/70 bg-zinc-950/30 px-3 py-2.5">
                          <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500 mb-2">
                            Also on this booking
                          </p>
                          <ul className="text-xs text-zinc-400 space-y-1.5">
                            {entry.activities.slice(1).map(({ activity, gameNo }) => (
                              <li key={activity.id} className="flex gap-2">
                                <span className="text-primary-1/80 shrink-0">+</span>
                                <span>
                                  {activity.title || activity.productName}{" "}
                                  <span className="text-zinc-600">
                                    ({gameNo} game{gameNo !== 1 ? "s" : ""})
                                  </span>
                                </span>
                              </li>
                            ))}
                            {entry.packages.map((pkg) => (
                              <li key={pkg.id} className="flex gap-2">
                                <span className="text-primary-1/80 shrink-0">+</span>
                                <span>{pkg.title || pkg.productName}</span>
                              </li>
                            ))}
                            {entry.foods.map(({ food, quantity }) => (
                              <li key={food.id} className="flex gap-2">
                                <span className="text-primary-1/80 shrink-0">+</span>
                                <span>
                                  {food.title || food.productName}{" "}
                                  <span className="text-zinc-600">×{quantity}</span>
                                </span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}
