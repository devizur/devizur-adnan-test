export function env() {
  const bookingFlowUrl = process.env.NEXT_PUBLIC_bookingFlowUrl ?? "";
  const BookingEngineUrl = process.env.NEXT_PUBLIC_BookingEngineUrl ?? "";
  const bookingBackendUrl =
    process.env.NEXT_PUBLIC_bookingBackendUrl ??
    "https://devizur-erp-booking-backend-uat-dxduh9hhh9dkbubt.australiaeast-01.azurewebsites.net";

  return {
    bookingFlowUrl,
    BookingEngineUrl,
    bookingBackendUrl,
  };
}

