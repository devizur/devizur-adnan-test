import paymentGatewayHttp from "@/lib/api/PaymentGatewayhttp";
import axios, { type AxiosError } from "axios";

/** @deprecated Prefer fetchStripePublishableKey() from payment gateway. Optional env fallback for local tooling. */
export function getStripePublishableKey(): string | undefined {
  const k = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY?.trim();
  return k || undefined;
}

export interface BookingPaymentsPublishableKeyResponse {
  publishableKey?: string;
}

/**
 * Loads Stripe publishable key from payment gateway (GET api/BookingPayments/publishable-key).
 * Falls back to NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY if the request fails (e.g. local dev).
 */
export async function fetchStripePublishableKey(): Promise<string> {
  try {
    const { data } = await paymentGatewayHttp.get<BookingPaymentsPublishableKeyResponse>(
      "/api/BookingPayments/publishable-key"
    );
    const k = data?.publishableKey?.trim();
    if (k) return k;
  } catch (error) {
    const err = error as AxiosError<{ message?: string }>;
    const msg =
      err.response?.data?.message || err.message || "Payment gateway request failed";
    const fallback = getStripePublishableKey();
    if (fallback) return fallback;
    throw new Error(
      `Could not load Stripe publishable key: ${msg}. Set NEXT_PUBLIC_PaymentGatewayUrl or NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY for local fallback.`
    );
  }
  const fallback = getStripePublishableKey();
  if (fallback) return fallback;
  throw new Error(
    "No publishable key returned from api/BookingPayments/publishable-key and NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY is unset."
  );
}

export interface CreateCheckoutSessionParams {
  amountTotalCents: number;
  description?: string;
  metadata?: Record<string, string>;
}

/** POST /api/BookingPayments/create-payment-intent request */
export interface BookingPaymentsCreatePaymentIntentBody {
  amount: number;
  currency: string;
  metadata?: Record<string, string>;
}

function extractPaymentIntentClientSecret(data: unknown): string | undefined {
  if (!data || typeof data !== "object") return undefined;
  const d = data as Record<string, unknown>;
  if (typeof d.clientSecret === "string" && d.clientSecret.trim()) return d.clientSecret.trim();
  if (typeof d.client_secret === "string" && d.client_secret.trim()) return d.client_secret.trim();
  const inner = d.data;
  if (inner && typeof inner === "object") {
    const i = inner as Record<string, unknown>;
    if (typeof i.clientSecret === "string" && i.clientSecret.trim()) return i.clientSecret.trim();
    if (typeof i.client_secret === "string" && i.client_secret.trim()) return i.client_secret.trim();
  }
  return undefined;
}

function paymentGatewayErrorMessage(error: unknown, fallbackPrefix: string): string {
  if (axios.isAxiosError(error)) {
    const err = error as AxiosError<{ message?: string; error?: string; title?: string }>;
    const payload = err.response?.data;
    return (
      (typeof payload?.message === "string" && payload.message) ||
      (typeof payload?.error === "string" && payload.error) ||
      (typeof payload?.title === "string" && payload.title) ||
      err.message ||
      `${fallbackPrefix} (${err.response?.status ?? "network"})`
    );
  }
  return error instanceof Error ? error.message : fallbackPrefix;
}

/**
 * Creates a Stripe PaymentIntent via payment gateway (POST /api/BookingPayments/create-payment-intent).
 * Amount is in the smallest currency unit (e.g. USD cents), same as Stripe.
 */
export async function createPaymentIntent(params: CreateCheckoutSessionParams): Promise<{ clientSecret: string }> {
  const { amountTotalCents: amount, description, metadata: meta } = params;

  if (typeof amount !== "number" || !Number.isInteger(amount)) {
    throw new Error("amountTotalCents must be an integer (e.g. USD cents)");
  }
  if (amount < 50) {
    throw new Error("Amount must be at least 50 ($0.50 USD minimum)");
  }

  const currency =
    process.env.NEXT_PUBLIC_PAYMENT_CURRENCY?.trim().toLowerCase() || "usd";

  const metadata: Record<string, string> = { ...(meta ?? {}) };
  if (description?.trim()) {
    metadata.description = description.trim().slice(0, 200);
  }

  const body: BookingPaymentsCreatePaymentIntentBody = {
    amount,
    currency,
    metadata,
  };

  try {
    const { data } = await paymentGatewayHttp.post<unknown>(
      "/api/BookingPayments/create-payment-intent",
      body
    );
    const clientSecret = extractPaymentIntentClientSecret(data);
    if (!clientSecret) {
      throw new Error("No client secret returned from payment gateway");
    }
    return { clientSecret };
  } catch (error) {
    throw new Error(paymentGatewayErrorMessage(error, "Payment setup failed"));
  }
}

export interface ConfirmBookingPaymentIntentBody {
  paymentIntentId: string;
  paymentMethodId: string;
}

/**
 * Notifies payment gateway after Stripe client confirmation (POST /api/BookingPayments/confirm-payment-intent).
 */
export async function confirmBookingPaymentIntent(
  body: ConfirmBookingPaymentIntentBody
): Promise<void> {
  try {
    await paymentGatewayHttp.post("/api/BookingPayments/confirm-payment-intent", body);
  } catch (error) {
    throw new Error(paymentGatewayErrorMessage(error, "Payment confirmation failed"));
  }
}
