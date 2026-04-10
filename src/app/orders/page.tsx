"use client";

import * as React from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn, formatPrice } from "@/lib/utils";
import { CancelOrderConfirmDialog } from "@/components/ui/cancel-order-dialog";
import { loadPaidOrders, type PaidOrderRecord } from "@/lib/paidOrdersStorage";
import { PAGE_CONTENT_CLASS } from "@/lib/page-layout";
import { fetchBookingDetailsById, fetchOrdersFromBackend } from "@/lib/api/orderHttp";
import { Calendar, Clock, User, ShoppingBag, ArrowLeft, Receipt } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { BookingTimelineBar } from "@/components/ui/booking/BookingTimelineBar";

function shiftLabel(timeOfDay: 1 | 2 | 3): string {
  if (timeOfDay === 1) return "Morning";
  if (timeOfDay === 2) return "Afternoon";
  return "Evening";
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

function formatIsoDateTime(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function formatDurationMinutes(startIso: string, endIso: string): string | null {
  const start = new Date(startIso).getTime();
  const end = new Date(endIso).getTime();
  if (Number.isNaN(start) || Number.isNaN(end) || end <= start) return null;
  const mins = Math.round((end - start) / 60000);
  return `${mins} min`;
}

function isoToDate(iso: string | undefined): string | undefined {
  if (!iso) return undefined;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return undefined;
  return d.toISOString().slice(0, 10);
}

function isoToDisplayTime(iso: string | undefined): string {
  if (!iso) return "9:00 am";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "9:00 am";
  return d
    .toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    })
    .toLowerCase();
}

function OrderCard({ order }: { order: PaidOrderRecord }) {
  const entry = order.entries[0];
  const sales = order.salesOrder;
  const orderBookingId =
    typeof sales?.bookingId === "number"
      ? sales.bookingId
      : typeof sales?.bookingId === "string"
        ? Number(sales.bookingId)
        : 0;
  const { data: bookingData } = useQuery({
    queryKey: ["orders", "bookingDetails", orderBookingId],
    queryFn: () => fetchBookingDetailsById(orderBookingId),
    enabled: orderBookingId > 0,
    staleTime: 5 * 60 * 1000,
  });

  const bookingDetails = bookingData?.bookingDetails;
  const activitySteps = bookingData?.activitySteps;

  const adults = entry?.persons.adults ?? 0;
  const kids = entry?.persons.kids ?? 0;
  const holder =
    (entry
      ? `${entry.holderDetails.firstName} ${entry.holderDetails.lastName}`.trim()
      : sales?.customerName?.trim()) || "—";
  const totalShown =
    order.totalAmount > 0
      ? order.totalAmount
      : (sales?.netAmount ?? sales?.grossAmount ?? 0);
  const timelineSteps = (bookingDetails?.activities ?? [])
    .filter((a) => a.startTime && a.endTime)
    .map((a) => ({
      startingTime: a.startTime,
      endingTime: a.endTime,
      itemName: a.attributeOption
        ? `${a.activityName} (${a.attributeOption})`
        : a.activityName,
      adultPax: a.adultPax ?? 0,
      childPax: a.childPax ?? 0,
      resourceType: a.resourceType ?? "",
      venueActivityId: a.venueActivityId,
      attributeOptionId: a.attributeOptionId,
      resources: a.resources ?? [],
    }));
  const timelineDate = isoToDate(bookingDetails?.startTime);
  const timelineTime = isoToDisplayTime(bookingDetails?.startTime);
  const timelineActivities = (bookingDetails?.activities ?? []).map((a) => ({
    activity: {
      id: a.activityId ?? a.id,
      title: a.activityName,
      productName: a.activityName,
      duration:
        typeof a.noOfSession === "number" && a.noOfSession > 0
          ? `${a.noOfSession * 60} mins`
          : "60 mins",
    } as any,
    gameNo: typeof a.noOfSession === "number" && a.noOfSession > 0 ? a.noOfSession : 1,
  }));

  return (
    <article className="rounded-2xl border border-zinc-800 bg-[#1a1a1a] p-5 sm:p-6 space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs text-zinc-500 uppercase tracking-wider mb-1">Order</p>
          <p className="text-sm font-mono text-accent">{order.id}</p>
          {order.salesOrder?.orderNumber ? (
            <p className="text-[11px] text-zinc-400 mt-1">
              No: <span className="font-mono">{order.salesOrder.orderNumber}</span>
            </p>
          ) : null}
          {order.salesOrder?.uniqueOrderRef ? (
            <p className="text-[10px] text-zinc-600 mt-1">
              Ref: <span className="font-mono">{order.salesOrder.uniqueOrderRef}</span>
            </p>
          ) : null}
          <p className="text-xs text-zinc-500 mt-1">Paid {orderPaidDisplay(order)}</p>
          {order.stripePaymentIntentId ? (
            <p className="text-[10px] text-zinc-600 mt-1 font-mono truncate max-w-full" title={order.stripePaymentIntentId}>
              Transaction id: {order.stripePaymentIntentId}
            </p>
          ) : null}
        </div>
        <Badge className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 shrink-0">
          Paid
        </Badge>
      </div>

      <div className="flex flex-wrap gap-4 text-sm text-zinc-400">
        <span className="flex items-center gap-1.5">
          <User className="size-4 text-primary-1 shrink-0" />
          {holder}
        </span>
        {entry?.date ? (
          <span className="flex items-center gap-1.5">
            <Calendar className="size-4 text-primary-1 shrink-0" />
            {entry.date}
          </span>
        ) : sales?.createdAt ? (
          <span className="flex items-center gap-1.5">
            <Calendar className="size-4 text-primary-1 shrink-0" />
            {new Date(sales.createdAt).toLocaleDateString()}
          </span>
        ) : null}
        {entry?.timeSlot ? (
          <span className="flex items-center gap-1.5">
            <Clock className="size-4 text-primary-1 shrink-0" />
            {entry.timeSlot} · {shiftLabel(entry.timeOfDay)}
          </span>
        ) : null}
        {entry ? (
          <span className="text-zinc-500">
            {adults} adult{adults !== 1 ? "s" : ""}
            {kids > 0 ? `, ${kids} kid${kids !== 1 ? "s" : ""}` : ""}
          </span>
        ) : null}
      </div>

      <div className="border-t border-zinc-800 pt-4 space-y-2 text-sm">
        {sales?.lines?.length ? (
          sales.lines.map((line, idx) => (
            <div key={`${line.orderLineSerial}-${idx}`} className="flex justify-between gap-2 text-accent">
              <span className="min-w-0 truncate">
                {line.productName || `Product #${line.productId}`}
                {line.categoryName ? <span className="text-zinc-500"> · {line.categoryName}</span> : null}
              </span>
              <span className="text-zinc-500 shrink-0">
                ×{line.quantity} · {formatPrice(line.lineTotal ?? 0)}
              </span>
            </div>
          ))
        ) : (
          <>
            {entry?.activities.map(({ activity, gameNo }) => (
              <div key={`a-${activity.id}`} className="flex justify-between gap-2 text-accent">
                <span className="min-w-0 truncate">{activity.title || activity.productName}</span>
                <span className="text-zinc-500 shrink-0">{gameNo} game{gameNo !== 1 ? "s" : ""}</span>
              </div>
            ))}
            {entry?.packages.map(({ pkg, combination }) => (
              <div key={`p-${pkg.id}`} className="flex justify-between gap-2 text-accent">
                <span className="min-w-0 truncate">
                  {pkg.title || pkg.productName}
                  {combination?.attributeCombinationName ? (
                    <span className="text-zinc-500">
                      {" "}
                      · {combination.attributeCombinationName}
                    </span>
                  ) : null}
                </span>
                <span className="text-zinc-500 shrink-0">Package</span>
              </div>
            ))}
            {entry?.foods.map(({ food, quantity }) => (
              <div key={`f-${food.id}`} className="flex justify-between gap-2 text-accent">
                <span className="min-w-0 truncate">{food.title || food.productName}</span>
                <span className="text-zinc-500 shrink-0">×{quantity}</span>
              </div>
            ))}
          </>
        )}
      </div>

      {timelineSteps.length > 0 ? (
        <div className="border-t border-zinc-800 pt-4">
          <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-zinc-500">
            Booking schedule
          </p>
          {timelineDate ? (
            <div className="mb-3">
              <BookingTimelineBar
                bookingReferenceId={undefined}
                slotsResponseReceived
                timeSlot={timelineTime}
                selectedDate={timelineDate}
                selectedActivities={timelineActivities}
                steps={activitySteps}
              />
            </div>
          ) : null}
          <div className="space-y-2 rounded-xl border border-white/8 bg-[#141414]/70 p-3">
            {timelineSteps.map((step, idx) => (
              <div
                key={`${step.itemName}-${idx}-${step.startingTime}`}
                className="rounded-lg border border-zinc-800/90 bg-zinc-900/50 px-3 py-2"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-sm font-medium text-zinc-200">{step.itemName}</p>
                </div>
                <p className="mt-1 text-xs text-zinc-400">
                  {formatIsoDateTime(step.startingTime)} - {formatIsoDateTime(step.endingTime)}
                </p>
                <div className="mt-2 flex flex-wrap gap-2 text-[11px] text-zinc-400">
                  <span className="rounded border border-zinc-700/80 bg-zinc-900/70 px-2 py-0.5">
                    Pax: {step.adultPax} adult{step.adultPax !== 1 ? "s" : ""}
                    {step.childPax > 0 ? `, ${step.childPax} child${step.childPax !== 1 ? "ren" : ""}` : ""}
                  </span>
                  {step.resourceType ? (
                    <span className="rounded border border-zinc-700/80 bg-zinc-900/70 px-2 py-0.5">
                      Resource type: {step.resourceType}
                    </span>
                  ) : null}
                  {typeof step.venueActivityId === "number" ? (
                    <span className="rounded border border-zinc-700/80 bg-zinc-900/70 px-2 py-0.5">
                      Venue activity ID: {step.venueActivityId}
                    </span>
                  ) : null}
                  {typeof step.attributeOptionId === "number" ? (
                    <span className="rounded border border-zinc-700/80 bg-zinc-900/70 px-2 py-0.5">
                      Attribute option ID: {step.attributeOptionId}
                    </span>
                  ) : null}
                </div>
                {step.resources.length > 0 ? (
                  <div className="mt-2 rounded-md border border-zinc-800 bg-[#121212]/70 p-2">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-zinc-500">
                      Resources
                    </p>
                    <div className="mt-1.5 space-y-1.5">
                      {step.resources.map((r, rIdx) => (
                        <div key={`${r.id}-${rIdx}`} className="text-xs text-zinc-300">
                          <p>
                            {r.venueResource || `Resource #${r.venueResourceId ?? r.id}`}
                            {typeof r.quantityUsed === "number" ? ` · Qty ${r.quantityUsed}` : ""}
                          </p>
                          {r.startTime && r.endTime ? (
                            <p className="text-[11px] text-zinc-500">
                              {formatIsoDateTime(r.startTime)} - {formatIsoDateTime(r.endTime)}
                              {formatDurationMinutes(r.startTime, r.endTime)
                                ? ` (${formatDurationMinutes(r.startTime, r.endTime)})`
                                : ""}
                            </p>
                          ) : null}
                          {(r.bufferBefore || r.bufferAfter) ? (
                            <p className="text-[11px] text-zinc-600">
                              Buffer: before {r.bufferBefore || "00:00:00"} / after {r.bufferAfter || "00:00:00"}
                            </p>
                          ) : null}
                        </div>
                      ))}
                    </div>
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        </div>
      ) : null}

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-zinc-800 pt-4">
        <div className="flex items-baseline gap-3">
          <span className="text-sm font-medium text-zinc-400">Total</span>
          <span className="text-lg font-semibold text-white">{formatPrice(totalShown)}</span>
        </div>
        {typeof sales?.netAmount === "number" ? (
          <div className="text-right text-xs text-zinc-500">
            <p>
              Gross: <span className="font-mono text-zinc-400">{sales.grossAmount ?? 0}</span>
            </p>
            <p>
              Tax: <span className="font-mono text-zinc-400">{sales.totalLineTax ?? 0}</span>
            </p>
            <p>
              Net: <span className="font-mono text-zinc-300">{sales.netAmount}</span>
            </p>
            {sales.customerName ? (
              <p>
                Customer: <span className="text-zinc-300">{sales.customerName}</span>
              </p>
            ) : null}
          </div>
        ) : null}
      </div>
    </article>
  );
}

type OrdersSource = "backend" | "local" | null;

export default function OrdersPage() {
  const [orders, setOrders] = React.useState<PaidOrderRecord[]>([]);
  const [source, setSource] = React.useState<OrdersSource>(null);
  const [loadError, setLoadError] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [cancelTarget, setCancelTarget] = React.useState<PaidOrderRecord | null>(null);

  const loadOrders = React.useCallback(async () => {
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
    void loadOrders();
  }, [loadOrders]);

  return (
    <div className="min-w-0 pt-24 sm:pt-32 pb-16 sm:pb-20 text-primary">
      <CancelOrderConfirmDialog
        order={cancelTarget}
        open={cancelTarget !== null}
        onOpenChange={(open) => {
          if (!open) setCancelTarget(null);
        }}
        onRemoved={(orderId) => {
          setOrders((prev) => prev.filter((o) => o.id !== orderId));
        }}
      />
      <div className={cn(PAGE_CONTENT_CLASS, "space-y-8")}>
        <div className="flex flex-col gap-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <Button
              type="button"
              variant="outline"
              asChild
              className="border-zinc-700/90 text-accent hover:bg-zinc-800/80 hover:text-white hover:border-zinc-600 rounded-xl h-10"
            >
              <Link href="/">
                <ArrowLeft className="size-4 mr-2" />
                Home
              </Link>
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => void loadOrders()}
              className="border-zinc-700/90 text-accent hover:text-white hover:bg-zinc-800/80 hover:border-zinc-600 shrink-0 rounded-xl h-10"
            >
              Refresh 
            </Button>
          </div>

          <header className="relative overflow-hidden rounded-2xl border border-zinc-800/90 bg-linear-to-br from-[#1c1c1c] via-[#161616] to-[#141414] px-5 py-6 sm:px-7 sm:py-8 shadow-[0_0_0_1px_rgba(255,255,255,0.03)_inset]">
            <div
              className="pointer-events-none absolute inset-y-0 left-0 w-1 bg-linear-to-b from-primary-1 via-primary-1/70 to-primary-1/25"
              aria-hidden
            />
            <div className="relative pl-4 sm:pl-5 space-y-4">
              <div className="flex flex-wrap items-center gap-3">
                <div
                  className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-1/12 ring-1 ring-primary-1/25 shadow-[0_0_24px_-4px_rgba(250,204,21,0.25)]"
                  aria-hidden
                >
                  <Receipt className="size-4.5 text-primary-1" strokeWidth={2} />
                </div>
                <div className="flex flex-col gap-0.5 min-w-0">
                  <p className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-[0.22em] text-primary-1/95">
                    Your purchases
                  </p>
                  <p className="text-xs text-zinc-500 font-medium tracking-wide">
                    Completed checkouts & receipts
                  </p>
                </div>
              </div>
              <div className="space-y-2.5">
                <h1 className="text-3xl sm:text-[2.125rem] font-bold text-primary tracking-tight leading-[1.15]">
                  Order details
                </h1>
            
             
              </div>
            </div>
          </header>
        </div>

        {loading ? (
          <p className="text-zinc-500 text-sm">Loading orders…</p>
        ) : orders.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-zinc-700 bg-[#1a1a1a]/50 p-10 text-center space-y-4">
            <ShoppingBag className="size-12 text-zinc-600 mx-auto" />
            <p className="text-zinc-400">No paid orders yet.</p>
            <p className="text-zinc-500 text-sm">Complete a booking and pay to see it here.</p>
            <Button asChild className="bg-primary-1 text-black hover:bg-primary-1/90 rounded-xl">
              <Link href="/activities">Browse activities</Link>
            </Button>
          </div>
        ) : (
          <ul className="space-y-6">
            {orders.map((order) => (
              <li key={order.id}>
                <OrderCard order={order} />
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
