"use client";

import * as React from "react";
import { CardElement, Elements, useStripe, useElements } from "@stripe/react-stripe-js";
import type { Appearance, Stripe, StripeElementsOptions } from "@stripe/stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { createPaymentIntent, fetchStripePublishableKey, isAlreadySucceededPaymentIntentError } from "@/lib/stripeCheckout";
import { confirmPayment } from "@/lib/paymentApi";
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
    ".Block": {
      backgroundColor: "transparent",
      borderColor: "rgba(255, 255, 255, 0.06)",
      borderRadius: "8px",
      padding: "12px",
    },
  },
};

const cardElementOptions = {
  style: {
    base: {
      color: "#f4f4f5",
      fontFamily: "ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
      fontSize: "15px",
      "::placeholder": {
        color: "#71717a",
      },
    },
    invalid: {
      color: "#fca5a5",
    },
  },
};

export interface BillingDetailsForStripe {
  name?: string;
  email?: string;
}

interface StripePaymentFormInnerProps {
  totalLabel: string;
  disabled: boolean;
  paymentIntentId: string;
  billingDetails: BillingDetailsForStripe;
  onPaid: (meta?: StripePaymentSuccessMeta) => void;
}

function StripePaymentFormInner({
  totalLabel,
  disabled,
  paymentIntentId,
  billingDetails,
  onPaid,
}: StripePaymentFormInnerProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [submitting, setSubmitting] = React.useState(false);
  const [message, setMessage] = React.useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (disabled || !stripe || !elements || !paymentIntentId) return;
    setMessage(null);
    setSubmitting(true);
    try {
      const card = elements.getElement(CardElement);
      if (!card) {
        setMessage("Card field is not ready");
        setSubmitting(false);
        return;
      }

      const { error, paymentMethod } = await stripe.createPaymentMethod({
        type: "card",
        card,
        billing_details: {
          name: billingDetails.name || undefined,
          email: billingDetails.email || undefined,
        },
      });

      if (error) {
        setMessage(error.message ?? "Payment method creation failed");
        setSubmitting(false);
        return;
      }

      if (!paymentMethod?.id) {
        setMessage("Could not create payment method");
        setSubmitting(false);
        return;
      }

      let result: Awaited<ReturnType<typeof confirmPayment>>;
      try {
        result = await confirmPayment(paymentIntentId, paymentMethod.id);
      } catch (confirmErr) {
        const msg = confirmErr instanceof Error ? confirmErr.message : String(confirmErr);
        if (isAlreadySucceededPaymentIntentError(msg)) {
          setSubmitting(false);
          onPaid({ stripePaymentIntentId: paymentIntentId });
          return;
        }
        setMessage(msg || "Payment confirmation failed");
        setSubmitting(false);
        return;
      }

      if (result.status === "succeeded") {
        setSubmitting(false);
        onPaid({ stripePaymentIntentId: paymentIntentId });
        return;
      }
      if (result.status === "requires_action") {
        setMessage("Authentication required — complete verification if prompted by your bank, or try another card.");
        setSubmitting(false);
        return;
      }
      setMessage(result.message || result.status || "Payment was not completed");
      setSubmitting(false);
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Payment failed");
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={(e) => void handleSubmit(e)} className="space-y-3">
      <div className="rounded-xl border border-white/[0.08] bg-[#141414]/55 p-3 shadow-sm shadow-black/15 ring-1 ring-white/[0.04] sm:p-4">
        <div className="rounded-lg border border-white/[0.06] bg-[#1e1e1e] p-3 sm:p-3.5">
          <CardElement options={cardElementOptions} />
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
 
  amountTotalCents: number;
  totalLabel: string;
  description?: string;
  metadata?: Record<string, string>;
  billingDetails?: BillingDetailsForStripe;
  disabled: boolean; 
  resetKey: number;
  onPaid: (meta?: StripePaymentSuccessMeta) => void;
}

export function StripePaymentElementBlock({
  amountTotalCents,
  totalLabel,
  description = "Booking payment",
  metadata,
  billingDetails = {},
  disabled,
  resetKey,
  onPaid,
}: StripePaymentElementProps) {
  const [stripePromise, setStripePromise] = React.useState<Promise<Stripe | null> | null>(null);
  const [clientSecret, setClientSecret] = React.useState<string | null>(null);
  const [paymentIntentId, setPaymentIntentId] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [pkLoading, setPkLoading] = React.useState(true);
  const [pkError, setPkError] = React.useState<string | null>(null);

  React.useEffect(() => {
    let cancelled = false;
    setPkLoading(true);
    setPkError(null);
    void fetchStripePublishableKey()
      .then((pk) => {
        if (!cancelled) {
          setStripePromise(loadStripe(pk));
          setPkError(null);
        }
      })
      .catch((e) => {
        if (!cancelled) {
          setStripePromise(null);
          setPkError(e instanceof Error ? e.message : "Could not load Stripe configuration");
        }
      })
      .finally(() => {
        if (!cancelled) setPkLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const metadataKey = React.useMemo(() => JSON.stringify(metadata ?? {}), [metadata]);

  React.useEffect(() => {
    if (disabled || amountTotalCents < 50) {
      setClientSecret(null);
      setPaymentIntentId(null);
      setLoading(false);
      setError(null);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);
    setClientSecret(null);
    setPaymentIntentId(null);

    createPaymentIntent({
      amountTotalCents,
      description,
      metadata,
    })
      .then(({ clientSecret: secret, paymentIntentId: pi }) => {
        if (!cancelled) {
          setClientSecret(secret);
          setPaymentIntentId(pi);
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

  if (disabled) {
    return null;
  }

  if (pkLoading) {
    return (
      <div className="rounded-lg border border-white/[0.08] bg-[#1e1e1e] px-3 py-5 text-center text-xs text-zinc-500 sm:text-sm">
        Loading payment configuration…
      </div>
    );
  }

  if (pkError) {
    return (
      <div
        role="alert"
        className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2.5 text-xs text-amber-100 sm:text-sm"
      >
        {pkError}
      </div>
    );
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

  if (!clientSecret || !stripePromise || !paymentIntentId) {
    return null;
  }

  const options: StripeElementsOptions = {
    clientSecret,
    appearance: bookingPaymentAppearance,
  };

  return (
    <Elements key={`${clientSecret}-${resetKey}`} stripe={stripePromise} options={options}>
      <StripePaymentFormInner
        totalLabel={totalLabel}
        disabled={disabled}
        paymentIntentId={paymentIntentId}
        billingDetails={billingDetails}
        onPaid={onPaid}
      />
    </Elements>
  );
}
