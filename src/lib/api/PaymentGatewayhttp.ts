import axios from "axios";
import { env } from "@/config";

const { PaymentGatewayUrl } = env();

const paymentGatewayHttp = axios.create({
  baseURL: PaymentGatewayUrl,
});

export default paymentGatewayHttp;
