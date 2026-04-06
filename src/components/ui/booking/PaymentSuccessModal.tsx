"use client";

import * as React from "react";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";

interface PaymentSuccessModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDone: () => void;
}

export function PaymentSuccessModal({ open, onOpenChange, onDone }: PaymentSuccessModalProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-sm bg-[#161616] border border-gray-800/80 rounded-2xl text-white p-0 gap-0 overflow-hidden">
        <div className="flex flex-col items-center px-6 pt-8 pb-6 text-center">
          <div className="w-14 h-14 rounded-full bg-emerald-500/20 flex items-center justify-center mb-4 ring-4 ring-emerald-500/30">
            <Check className="w-7 h-7 text-emerald-400 stroke-[2.5]" />
          </div>
          <AlertDialogTitle className="text-lg font-semibold text-white mb-2">
            Payment successful
          </AlertDialogTitle>
          <p className="text-sm text-gray-400 leading-relaxed">
            You’ll get a check-in code by Email. Show it at the counter to complete check-in.
          </p>
        </div>
        <AlertDialogFooter className="px-6 pb-6 pt-0 justify-center border-0">
          <Button
            type="button"
            onClick={onDone}
            autoFocus
            className="min-h-11 bg-primary-1 text-black hover:bg-primary-1-hover font-medium rounded-xl w-full sm:min-w-[120px] cursor-pointer focus-visible:ring-primary-1/50"
          >
            Done
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
