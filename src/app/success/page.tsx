"use client";

import * as React from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useCart } from "@/contexts/CartContext";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getStripeBackendBaseUrl } from "@/lib/stripeCheckout";

function SuccessContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const paymentIntentId = searchParams.get("payment_intent");
  const { clearCart } = useCart();
  const [verified, setVerified] = React.useState<{
    payment_status?: string;
    amount_total?: number | null;
    currency?: string;
  } | null>(null);

  React.useEffect(() => {
    if (!sessionId && !paymentIntentId) return;
    clearCart();
  }, [sessionId, paymentIntentId, clearCart]);

  React.useEffect(() => {
    if (!sessionId) return;
    let cancelled = false;
    const base = getStripeBackendBaseUrl();
    fetch(`${base}/checkout-session?session_id=${encodeURIComponent(sessionId)}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (!cancelled && data && typeof data === "object") setVerified(data);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [sessionId]);

  if (!sessionId && !paymentIntentId) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center px-4 text-center">
        <p className="text-gray-400 text-sm mb-4">No payment confirmation found.</p>
        <Button asChild className="bg-primary-1 text-black hover:bg-primary-1/90 rounded-xl">
          <Link href="/">Back to home</Link>
        </Button>
      </div>
    );
  }

  if (paymentIntentId && !sessionId) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center px-4 py-12 text-center">
        <div className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center mb-5 ring-4 ring-emerald-500/30">
          <Check className="w-8 h-8 text-emerald-400 stroke-[2.5]" />
        </div>
        <h1 className="text-xl font-semibold text-white mb-2">Payment successful</h1>
        <p className="text-sm text-gray-400 max-w-md leading-relaxed mb-6">
          Thank you. If authentication was required, your payment has been completed.
        </p>
        <Button asChild className="bg-primary-1 text-black hover:bg-primary-1/90 rounded-xl min-h-11">
          <Link href="/">Continue</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-[50vh] flex flex-col items-center justify-center px-4 py-12 text-center">
      <div className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center mb-5 ring-4 ring-emerald-500/30">
        <Check className="w-8 h-8 text-emerald-400 stroke-[2.5]" />
      </div>
      <h1 className="text-xl font-semibold text-white mb-2">Payment successful</h1>
      <p className="text-sm text-gray-400 max-w-md leading-relaxed mb-2">
        Thank you. You’ll get a check-in code by SMS. Show it at the counter to complete check-in.
      </p>
      {verified?.payment_status ? (
        <p className="text-xs text-gray-500 mb-6">
          Status: {verified.payment_status}
          {verified.amount_total != null && verified.currency
            ? ` · ${(verified.amount_total / 100).toFixed(2)} ${String(verified.currency).toUpperCase()}`
            : ""}
        </p>
      ) : (
        <p className="text-xs text-gray-600 mb-6">Session {(sessionId ?? "").slice(0, 20)}…</p>
      )}
      <Button asChild className="bg-primary-1 text-black hover:bg-primary-1/90 rounded-xl min-h-11">
        <Link href="/">Continue</Link>
      </Button>
    </div>
  );
}

export default function SuccessPage() {
  return (
    <React.Suspense
      fallback={
        <div className="min-h-[40vh] flex items-center justify-center text-gray-500 text-sm">Loading…</div>
      }
    >
      <SuccessContent />
    </React.Suspense>
  );
}
