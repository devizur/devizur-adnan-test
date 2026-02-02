"use client";

import { Toaster as SonnerToaster } from "sonner";

export function Toaster() {
  return (
    <SonnerToaster
      position="top-right"
      closeButton
      expand
      duration={2000}
      className="booking-toaster"
      toastOptions={{
        classNames: {
          toast: "booking-toast",
          title: "booking-toast-title",
          description: "booking-toast-description",
          success: "booking-toast-success",
          error: "booking-toast-error",
          info: "booking-toast-info",
          closeButton: "booking-toast-close",
        },
      }}
    />
  );
}
