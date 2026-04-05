import axios from "axios";
import { env } from "@/config";

const { PaymentGatewayUrl } = env();

/** Axios client for payment gateway (Stripe publishable key, future payment APIs). Base: NEXT_PUBLIC_PaymentGatewayUrl. */
const paymentGatewayHttp = axios.create({
  baseURL: PaymentGatewayUrl,
});

export default paymentGatewayHttp;
