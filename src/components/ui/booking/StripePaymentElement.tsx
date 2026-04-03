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
import { Button } from "@/components/ui/button";
import { createPaymentIntent, getStripePublishableKey } from "@/lib/stripeCheckout";

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
    <form onSubmit={(e) => void handleSubmit(e)} className="space-y-4">
      <div className="rounded-xl border border-gray-800 bg-[#161616] p-3 sm:p-4">
        <PaymentElement />
      </div>
      {message ? (
        <p role="alert" className="text-sm text-red-300">
          {message}
        </p>
      ) : null}
      <Button
        type="submit"
        disabled={disabled || !stripe || submitting}
        className="w-full sm:w-auto min-h-11 bg-primary-1 text-black hover:bg-primary-1/90 font-medium rounded-xl"
      >
        {submitting ? "Processing…" : `Pay ${totalLabel}`}
      </Button>
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
      <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-100">
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
      <div className="rounded-xl border border-gray-800 bg-[#1e1e1e] px-4 py-6 text-center text-sm text-gray-400">
        Preparing secure card form…
      </div>
    );
  }

  if (error) {
    return (
      <div
        role="alert"
        className="rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-200"
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
        colorBackground: "#161616",
        colorText: "#e5e5e5",
        colorDanger: "#f87171",
        borderRadius: "12px",
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
