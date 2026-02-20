"use client";

import { useEffect, useState } from "react";
import { fetchBookingFlowToken } from "@/lib/api/bookingFlowUrlHttp";

/**
 * On app load: fetches the booking-flow OAuth token, stores it in Redux,
 * then renders children. Other APIs using bookingFlowUrlHttp will then use that token.
 */
export function BookingFlowTokenProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetchBookingFlowToken().finally(() => {
      if (!cancelled) setReady(true);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  if (!ready) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <div
            className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto"
            aria-hidden
          />
          <p className="text-muted-foreground text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
