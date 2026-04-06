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

function extractPaymentIntentId(data: unknown): string | undefined {
  if (!data || typeof data !== "object") return undefined;
  const d = data as Record<string, unknown>;
  if (typeof d.paymentIntentId === "string" && d.paymentIntentId.trim()) return d.paymentIntentId.trim();
  if (typeof d.payment_intent_id === "string" && d.payment_intent_id.trim()) return d.payment_intent_id.trim();
  const inner = d.data;
  if (inner && typeof inner === "object") {
    const i = inner as Record<string, unknown>;
    if (typeof i.paymentIntentId === "string" && i.paymentIntentId.trim()) return i.paymentIntentId.trim();
    if (typeof i.id === "string" && i.id.startsWith("pi_")) return i.id.trim();
  }
  return undefined;
}

/** Stripe client secrets are `pi_xxx_secret_yyy` — derive id when the gateway omits it. */
export function paymentIntentIdFromClientSecret(clientSecret: string): string {
  const idx = clientSecret.indexOf("_secret_");
  if (idx > 0) return clientSecret.slice(0, idx);
  throw new Error("Invalid PaymentIntent client secret");
}

function stringFromPayloadField(val: unknown): string | undefined {
  if (typeof val === "string" && val.trim()) return val.trim();
  if (val && typeof val === "object" && "message" in val) {
    const m = (val as { message: unknown }).message;
    if (typeof m === "string" && m.trim()) return m.trim();
  }
  return undefined;
}

function collectModelStateErrors(errors: unknown): string[] {
  if (!errors || typeof errors !== "object" || Array.isArray(errors)) return [];
  const out: string[] = [];
  for (const v of Object.values(errors as Record<string, unknown>)) {
    if (Array.isArray(v)) {
      for (const item of v) {
        if (typeof item === "string" && item.trim()) out.push(item.trim());
      }
    } else if (typeof v === "string" && v.trim()) {
      out.push(v.trim());
    }
  }
  return out;
}

const GENERIC_GATEWAY_PHRASES = [
  /^a processing error occurred\.?$/i,
  /^an error occurred while processing your request\.?$/i,
  /^one or more validation errors occurred\.?$/i,
];

function isGenericGatewayMessage(s: string): boolean {
  return GENERIC_GATEWAY_PHRASES.some((re) => re.test(s.trim()));
}

function paymentGatewayErrorMessage(error: unknown, fallbackPrefix: string): string {
  if (axios.isAxiosError(error)) {
    const err = error as AxiosError<Record<string, unknown>>;
    const payload = err.response?.data;
    const status = err.response?.status;
    const traceId =
      payload && typeof payload === "object" && typeof payload.traceId === "string"
        ? payload.traceId.trim()
        : undefined;

    const validationMsgs = payload && typeof payload === "object" ? collectModelStateErrors(payload.errors) : [];
    if (validationMsgs.length) {
      return validationMsgs.join(" ");
    }

    const detail = payload && typeof payload === "object" ? stringFromPayloadField(payload.detail) : undefined;
    const message = payload && typeof payload === "object" ? stringFromPayloadField(payload.message) : undefined;
    const errorStr = payload && typeof payload === "object" ? stringFromPayloadField(payload.error) : undefined;
    const title = payload && typeof payload === "object" ? stringFromPayloadField(payload.title) : undefined;

    const candidates = [detail, message, errorStr, title].filter((s): s is string => Boolean(s));
    const specific = candidates.find((s) => !isGenericGatewayMessage(s));
    let text = specific ?? candidates[0] ?? err.message;

    if (text && isGenericGatewayMessage(text)) {
      const bits: string[] = [];
      if (typeof status === "number") bits.push(`HTTP ${status}`);
      if (traceId) bits.push(`ref: ${traceId}`);
      if (bits.length) text = `${text} (${bits.join(", ")})`;
    }

    return text?.trim() || `${fallbackPrefix} (${status ?? "network"})`;
  }
  return error instanceof Error ? error.message : fallbackPrefix;
}

/**
 * Creates a Stripe PaymentIntent via payment gateway (POST /api/BookingPayments/create-payment-intent).
 * Amount is in the smallest currency unit (e.g. USD cents), same as Stripe.
 */
export async function createPaymentIntent(
  params: CreateCheckoutSessionParams
): Promise<{ clientSecret: string; paymentIntentId: string }> {
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
    const fromApi = extractPaymentIntentId(data);
    const paymentIntentId = fromApi ?? paymentIntentIdFromClientSecret(clientSecret);
    return { clientSecret, paymentIntentId };
  } catch (error) {
    throw new Error(paymentGatewayErrorMessage(error, "Payment setup failed"));
  }
}

export interface ConfirmBookingPaymentIntentBody {
  paymentIntentId: string;
  paymentMethodId: string;
}

/**
 * Gateway may surface Stripe's error when the PI was already confirmed via Elements.
 * In that case payment already succeeded — treat as non-fatal for the booking flow.
 */
export function isAlreadySucceededPaymentIntentError(message: string): boolean {
  const m = message.toLowerCase();
  return (
    m.includes("already succeeded") ||
    m.includes("has already been confirmed") ||
    (m.includes("cannot confirm") && m.includes("paymentintent") && m.includes("already"))
  );
}

export interface ConfirmPaymentResult {
  status: string;
  message?: string;
}

function parseConfirmPaymentResponse(data: unknown): ConfirmPaymentResult {
  if (!data || typeof data !== "object") {
    return { status: "succeeded" };
  }
  const d = data as Record<string, unknown>;
  const topStatus = typeof d.status === "string" ? d.status : undefined;
  const topMessage = typeof d.message === "string" ? d.message : undefined;
  if (topStatus) {
    return { status: topStatus, message: topMessage };
  }
  const inner = d.data;
  if (inner && typeof inner === "object") {
    const i = inner as Record<string, unknown>;
    if (typeof i.status === "string") {
      return {
        status: i.status,
        message: typeof i.message === "string" ? i.message : undefined,
      };
    }
  }
  return { status: "succeeded" };
}

/**
 * Confirms/charges the PaymentIntent on the payment gateway (POST /api/BookingPayments/confirm-payment-intent).
 * Does not call Stripe.js `confirmPayment` on the client — gateway attaches the payment method and confirms server-side.
 */
export async function confirmPayment(
  paymentIntentId: string,
  paymentMethodId: string
): Promise<ConfirmPaymentResult> {
  try {
    const { data } = await paymentGatewayHttp.post<unknown>(
      "/api/BookingPayments/confirm-payment-intent",
      { paymentIntentId, paymentMethodId }
    );
    return parseConfirmPaymentResponse(data);
  } catch (error) {
    throw new Error(paymentGatewayErrorMessage(error, "Payment confirmation failed"));
  }
}

/** @deprecated Use confirmPayment — kept for any external imports */
export async function confirmBookingPaymentIntent(body: ConfirmBookingPaymentIntentBody): Promise<void> {
  await confirmPayment(body.paymentIntentId, body.paymentMethodId);
}
