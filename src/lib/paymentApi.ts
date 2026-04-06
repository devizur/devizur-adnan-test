/**
 * Payment gateway calls (server-side confirm). Does not use Stripe.js `confirmPayment` on the client.
 */
export {
  confirmPayment,
  type ConfirmPaymentResult,
} from "@/lib/stripeCheckout";
