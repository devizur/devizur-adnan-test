"use client";

import * as React from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/utils";
import { loadPaidOrders, type PaidOrderRecord } from "@/lib/paidOrdersStorage";
import { Calendar, Clock, User, ShoppingBag, ArrowLeft, Receipt } from "lucide-react";

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

function OrderCard({ order }: { order: PaidOrderRecord }) {
  const entry = order.entries[0];
  if (!entry) return null;

  const adults = entry.persons.adults;
  const kids = entry.persons.kids;
  const holder = `${entry.holderDetails.firstName} ${entry.holderDetails.lastName}`.trim() || "—";

  return (
    <article className="rounded-2xl border border-zinc-800 bg-[#1a1a1a] p-5 sm:p-6 space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs text-zinc-500 uppercase tracking-wider mb-1">Order</p>
          <p className="text-sm font-mono text-zinc-300">{order.id}</p>
          <p className="text-xs text-zinc-500 mt-1">Paid {formatPaidAt(order.paidAt)}</p>
          {order.stripePaymentIntentId ? (
            <p className="text-[10px] text-zinc-600 mt-1 font-mono truncate max-w-full" title={order.stripePaymentIntentId}>
              {order.stripePaymentIntentId}
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
        <span className="flex items-center gap-1.5">
          <Calendar className="size-4 text-primary-1 shrink-0" />
          {entry.date}
        </span>
        <span className="flex items-center gap-1.5">
          <Clock className="size-4 text-primary-1 shrink-0" />
          {entry.timeSlot} · {shiftLabel(entry.timeOfDay)}
        </span>
        <span className="text-zinc-500">
          {adults} adult{adults !== 1 ? "s" : ""}
          {kids > 0 ? `, ${kids} kid${kids !== 1 ? "s" : ""}` : ""}
        </span>
      </div>

      <div className="border-t border-zinc-800 pt-4 space-y-2 text-sm">
        {entry.activities.map(({ activity, gameNo }) => (
          <div key={`a-${activity.id}`} className="flex justify-between gap-2 text-zinc-300">
            <span className="min-w-0 truncate">{activity.title || activity.productName}</span>
            <span className="text-zinc-500 shrink-0">{gameNo} game{gameNo !== 1 ? "s" : ""}</span>
          </div>
        ))}
        {entry.packages.map((pkg) => (
          <div key={`p-${pkg.id}`} className="flex justify-between gap-2 text-zinc-300">
            <span className="min-w-0 truncate">{pkg.title || pkg.productName}</span>
            <span className="text-zinc-500 shrink-0">Package</span>
          </div>
        ))}
        {entry.foods.map(({ food, quantity }) => (
          <div key={`f-${food.id}`} className="flex justify-between gap-2 text-zinc-300">
            <span className="min-w-0 truncate">{food.title || food.productName}</span>
            <span className="text-zinc-500 shrink-0">×{quantity}</span>
          </div>
        ))}
      </div>

      <div className="flex justify-between items-center border-t border-zinc-800 pt-4">
        <span className="text-sm font-medium text-zinc-400">Total</span>
        <span className="text-lg font-semibold text-white">{formatPrice(order.totalAmount)}</span>
      </div>
    </article>
  );
}

export default function OrdersPage() {
  const [orders, setOrders] = React.useState<PaidOrderRecord[]>([]);
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
    setOrders(loadPaidOrders());
  }, []);

  const refresh = React.useCallback(() => {
    setOrders(loadPaidOrders());
  }, []);

  return (
    <div className="min-h-screen bg-[#121212] pt-8 pb-20 text-white mt-24 sm:mt-32">
      <div className="container mx-auto px-4 lg:px-8 max-w-3xl space-y-8">
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
            <Button
              type="button"
              variant="outline"
              onClick={refresh}
              className="border-zinc-700/90 text-zinc-300 hover:bg-zinc-800/80 hover:border-zinc-600 shrink-0 rounded-xl h-10"
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
                <h1 className="text-3xl sm:text-[2.125rem] font-bold text-white tracking-tight leading-[1.15]">
                  Order list
                </h1>
                <p className="text-zinc-400 text-sm sm:text-[15px] leading-relaxed max-w-xl">
                  Every order you pay for in checkout shows up here. Data stays on this device until you link an
                  account.
                </p>
              </div>
            </div>
          </header>
        </div>

        {!mounted ? (
          <p className="text-zinc-500 text-sm">Loading…</p>
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
