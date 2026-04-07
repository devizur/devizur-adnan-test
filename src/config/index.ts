const DEFAULT_PAYMENT_GATEWAY_URL =
  "https://devizur-pos-backend-pg-uat-fqdvhffbh2bacze8.australiaeast-01.azurewebsites.net";

export function env() {
  const bookingFlowUrl = process.env.NEXT_PUBLIC_bookingFlowUrl ?? "";
  const BookingEngineUrl = process.env.NEXT_PUBLIC_BookingEngineUrl ?? "";
  const ClientUrl = process.env.NEXT_PUBLIC_CLIENT_URL ;
  const PaymentGatewayUrl =
    process.env.NEXT_PUBLIC_PaymentGatewayUrl?.trim() || DEFAULT_PAYMENT_GATEWAY_URL;
  const bookingBackendUrl =
    process.env.NEXT_PUBLIC_bookingBackendUrl ??
    "https://devizur-erp-booking-backend-uat-dxduh9hhh9dkbubt.australiaeast-01.azurewebsites.net";

  return {
    bookingFlowUrl,
    BookingEngineUrl,
    PaymentGatewayUrl: PaymentGatewayUrl.replace(/\/$/, ""),
    bookingBackendUrl,
    ClientUrl,
  };
}

