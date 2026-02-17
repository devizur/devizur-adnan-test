export function env() {
  const bookingFlowUrl = process.env.NEXT_PUBLIC_bookingFlowUrl?? "";
  const BookingEngineUrl = process.env.NEXT_PUBLIC_BookingEngineUrl ?? "";
 

  return {
    bookingFlowUrl,
    BookingEngineUrl,
  };
}

