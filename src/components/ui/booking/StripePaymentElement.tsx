"use client";

import * as React from "react";
import {
  PaymentElement,
  Elements,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import type { Appearance, Stripe, StripeElementsOptions } from "@stripe/stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { createPaymentIntent, getStripePublishableKey } from "@/lib/stripeCheckout";
import { cn } from "@/lib/utils";
import { segmentedPrimaryCtaClass } from "@/components/ui/booking/booking-segmented-styles";

export type StripePaymentSuccessMeta = { stripePaymentIntentId?: string };

/** Stripe Elements look aligned with booking holder / segmented inputs */
const bookingPaymentAppearance: Appearance = {
  theme: "night",
  labels: "above",
  variables: {
    colorPrimary: "#facc15",
    colorBackground: "#1e1e1e",
    colorText: "#f4f4f5",
    colorTextSecondary: "#a1a1aa",
    colorTextPlaceholder: "#71717a",
    colorDanger: "#fca5a5",
    borderRadius: "6px",
    fontFamily: "ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
    fontSizeBase: "15px",
    fontSizeSm: "13px",
    spacingUnit: "6px",
    gridRowSpacing: "14px",
    focusBoxShadow: "0 0 0 2px rgba(250, 204, 21, 0.28)",
    focusOutline: "0",
  },
  rules: {
    ".Input": {
      backgroundColor: "#1a1a1a",
      border: "1px solid rgba(255, 255, 255, 0.08)",
      borderRadius: "6px",
      paddingTop: "11px",
      paddingBottom: "11px",
      paddingLeft: "12px",
      paddingRight: "12px",
      boxShadow: "inset 0 1px 0 rgba(255, 255, 255, 0.03)",
    },
    ".Input:focus": {
      border: "1px solid rgba(250, 204, 21, 0.45)",
      boxShadow: "0 0 0 2px rgba(250, 204, 21, 0.15)",
    },
    ".Input--invalid": {
      border: "1px solid rgba(248, 113, 113, 0.45)",
      boxShadow: "none",
    },
    ".Label": {
      fontWeight: "600",
      fontSize: "10px",
      letterSpacing: "0.1em",
      textTransform: "uppercase",
      color: "#71717a",
      marginBottom: "6px",
    },
    ".Tab": {
      borderRadius: "6px",
      border: "1px solid rgba(255, 255, 255, 0.08)",
      backgroundColor: "rgba(0, 0, 0, 0.2)",
    },
    ".Tab:hover": {
      borderColor: "rgba(255, 255, 255, 0.12)",
    },
    ".Tab--selected": {
      borderColor: "rgba(250, 204, 21, 0.45)",
      backgroundColor: "rgba(250, 204, 21, 0.1)",
      boxShadow: "0 0 0 1px rgba(250, 204, 21, 0.12)",
    },
    ".Block": {
      backgroundColor: "transparent",
      borderColor: "rgba(255, 255, 255, 0.06)",
      borderRadius: "8px",
      padding: "12px",
    },
  },
};

interface StripePaymentFormInnerProps {
  totalLabel: string;
  disabled: boolean;
  onPaid: (meta?: StripePaymentSuccessMeta) => void;
}

function StripePaymentFormInner({ totalLabel, disabled, onPaid }: StripePaymentFormInnerProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [submitting, setSubmitting] = React.useState(false);
  const [message, setMessage] = React.useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (disabled || !stripe || !elements) return;
    setMessage(null);
    setSubmitting(true);
    try {
      const origin = typeof window !== "undefined" ? window.location.origin : "";
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${origin}/success`,
        },
        redirect: "if_required",
      });
      if (error) {
        setMessage(error.message ?? "Payment failed");
        setSubmitting(false);
        return;
      }
      if (paymentIntent?.status === "succeeded") {
        onPaid();
      } else {
        setMessage(`Payment status: ${paymentIntent?.status ?? "unknown"}. Try again or use another method.`);
        setSubmitting(false);
      }
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Payment failed");
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={(e) => void handleSubmit(e)} className="space-y-3">
      <div className="rounded-xl border border-white/[0.08] bg-[#141414]/55 p-3 shadow-sm shadow-black/15 ring-1 ring-white/[0.04] sm:p-4">
        <div className="rounded-lg border border-white/[0.06] bg-[#1e1e1e] p-2.5 sm:p-3">
          <PaymentElement options={{ layout: "tabs" }} />
        </div>
        <p className="mt-2.5 text-[10px] leading-relaxed text-zinc-600">
          Secured by Stripe — card data never touches our servers.
        </p>
      </div>
      {message ? (
        <p role="alert" className="text-xs leading-snug text-red-300 sm:text-sm">
          {message}
        </p>
      ) : null}
      <div className="flex justify-stretch sm:justify-end">
        <button
          type="submit"
          disabled={disabled || !stripe || submitting}
          className={cn(
            segmentedPrimaryCtaClass,
            "min-h-10 px-4 text-xs font-semibold rounded-md sm:min-h-10 sm:px-5 sm:text-sm",
            "w-full cursor-pointer sm:w-auto disabled:cursor-not-allowed disabled:opacity-45"
          )}
        >
          {submitting ? "Processing…" : `Pay ${totalLabel}`}
        </button>
      </div>
    </form>
  );
}

export interface StripePaymentElementProps {
  /** USD cents, must match server rules (min 50). */
  amountTotalCents: number;
  totalLabel: string;
  description?: string;
  metadata?: Record<string, string>;
  /** When true, hides form and disables pay (e.g. empty cart). */
  disabled: boolean;
  /** Bump to force a new PaymentIntent (e.g. dialog closed). */
  resetKey: number;
  onPaid: (meta?: StripePaymentSuccessMeta) => void;
}

export function StripePaymentElementBlock({
  amountTotalCents,
  totalLabel,
  description = "Booking payment",
  metadata,
  disabled,
  resetKey,
  onPaid,
}: StripePaymentElementProps) {
  const [stripePromise, setStripePromise] = React.useState<Promise<Stripe | null> | null>(null);
  const [clientSecret, setClientSecret] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    const pk = getStripePublishableKey();
    if (!pk) {
      setStripePromise(null);
      setError("Missing NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY in .env.local");
      setLoading(false);
      return;
    }
    setStripePromise(loadStripe(pk));
    setError(null);
  }, []);

  const metadataKey = React.useMemo(() => JSON.stringify(metadata ?? {}), [metadata]);

  React.useEffect(() => {
    if (disabled || amountTotalCents < 50) {
      setClientSecret(null);
      setLoading(false);
      setError(null);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);
    setClientSecret(null);

    createPaymentIntent({
      amountTotalCents,
      description,
      metadata,
    })
      .then(({ clientSecret: secret }) => {
        if (!cancelled) {
          setClientSecret(secret);
          setLoading(false);
        }
      })
      .catch((e) => {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : "Could not start payment");
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [amountTotalCents, description, metadataKey, resetKey, disabled, metadata]);

  const pk = getStripePublishableKey();
  if (!pk) {
    return (
      <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2.5 text-xs text-amber-100 sm:text-sm">
        Add your Stripe publishable key as{" "}
        <code className="text-amber-50/90">NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY</code> in{" "}
        <code className="text-amber-50/90">.env.local</code> (same as in{" "}
        <code className="text-amber-50/90">server-for-stripe/.env</code>).
      </div>
    );
  }

  if (disabled) {
    return null;
  }

  if (loading) {
    return (
      <div className="rounded-lg border border-white/[0.08] bg-[#1e1e1e] px-3 py-5 text-center text-xs text-zinc-500 sm:text-sm">
        Preparing secure card form…
      </div>
    );
  }

  if (error) {
    return (
      <div
        role="alert"
        className="rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2.5 text-xs text-red-200 sm:text-sm"
      >
        {error}
      </div>
    );
  }

  if (!clientSecret || !stripePromise) {
    return null;
  }

  const options: StripeElementsOptions = {
    clientSecret,
    appearance: bookingPaymentAppearance,
  };

  return (
    <Elements key={`${clientSecret}-${resetKey}`} stripe={stripePromise} options={options}>
      <StripePaymentFormInner totalLabel={totalLabel} disabled={disabled} onPaid={onPaid} />
    </Elements>
  );
}
