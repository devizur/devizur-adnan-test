"use client";

import * as React from "react";
import {
  PaymentElement,
  Elements,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import type { Stripe, StripeElementsOptions } from "@stripe/stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { createPaymentIntent, getStripePublishableKey } from "@/lib/stripeCheckout";
import { cn } from "@/lib/utils";
import { segmentedPrimaryCtaClass } from "@/components/ui/booking/booking-segmented-styles";

export type StripePaymentSuccessMeta = { stripePaymentIntentId?: string };

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
      <div className="rounded-lg border border-white/[0.06] bg-[#1e1e1e]/80 p-2 sm:p-3">
        <PaymentElement />
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
    appearance: {
      theme: "night",
      variables: {
        colorPrimary: "#facc15",
        colorBackground: "#1e1e1e",
        colorText: "#e4e4e7",
        colorDanger: "#f87171",
        borderRadius: "8px",
        fontFamily: "ui-sans-serif, system-ui, sans-serif",
      },
    },
  };

  return (
    <Elements key={`${clientSecret}-${resetKey}`} stripe={stripePromise} options={options}>
      <StripePaymentFormInner totalLabel={totalLabel} disabled={disabled} onPaid={onPaid} />
    </Elements>
  );
}
