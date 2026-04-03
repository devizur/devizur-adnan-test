/** Base URL of the Express Stripe server (no trailing slash). */
export function getStripeBackendBaseUrl(): string {
  const raw = process.env.NEXT_PUBLIC_STRIPE_BACKEND_URL?.trim();
  if (raw) return raw.replace(/\/$/, "");
  return "http://localhost:5002";
}

/** Stripe publishable key for Payment Element (safe to expose in the browser). */
export function getStripePublishableKey(): string | undefined {
  const k = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY?.trim();
  return k || undefined;
}

export interface CreateCheckoutSessionParams {
  amountTotalCents: number;
  description?: string;
  metadata?: Record<string, string>;
}

export async function createBookingCheckoutSession(
  params: CreateCheckoutSessionParams
): Promise<{ url: string }> {
  const res = await fetch(`${getStripeBackendBaseUrl()}/create-checkout-session`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      amountTotalCents: params.amountTotalCents,
      description: params.description,
      metadata: params.metadata,
    }),
  });

  const data = (await res.json().catch(() => ({}))) as { url?: string; error?: string };

  if (!res.ok) {
    throw new Error(data.error || `Checkout failed (${res.status})`);
  }
  if (!data.url) {
    throw new Error("No checkout URL returned from server");
  }
  return { url: data.url };
}

export async function createPaymentIntent(params: CreateCheckoutSessionParams): Promise<{ clientSecret: string }> {
  const res = await fetch(`${getStripeBackendBaseUrl()}/create-payment-intent`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      amountTotalCents: params.amountTotalCents,
      description: params.description,
      metadata: params.metadata,
    }),
  });

  const data = (await res.json().catch(() => ({}))) as { clientSecret?: string; error?: string };

  if (!res.ok) {
    throw new Error(data.error || `Payment setup failed (${res.status})`);
  }
  if (!data.clientSecret) {
    throw new Error("No client secret returned from server");
  }
  return { clientSecret: data.clientSecret };
}
