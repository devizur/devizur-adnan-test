"use client";

import * as React from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface BookingDialogProps {
  children: React.ReactNode;
  onConfirm?: () => void;
}

export function BookingDialog({ children, onConfirm }: BookingDialogProps) {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>{children}</AlertDialogTrigger>
      <AlertDialogContent className="min-w-[90%] h-[90%] bg-secondary-2 border-secondary-2">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-primary flex justify-between items-center w-full "><div className=" ">
          </div>Confirm payment <div className=""><AlertDialogCancel>Cancel</AlertDialogCancel></div>  </AlertDialogTitle>
          <AlertDialogDescription>
            This will submit your current food orders and activity bookings. You can
            review the details above before continuing.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>

          <AlertDialogAction
            onClick={() => {
              onConfirm?.();
            }}
          >
            Pay Now
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

