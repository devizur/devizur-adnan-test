"use client";

import * as React from "react";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { CartDrawerContent } from "@/components/ui/CartDrawerContent";
import { cn } from "@/lib/utils";

interface CartPopupProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CartPopup({ open, onOpenChange }: CartPopupProps) {
  const handleClose = React.useCallback(() => {
    onOpenChange(false);
  }, [onOpenChange]);

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent
        size="default"
        className={cn(
          "flex flex-col p-0 gap-0 min-h-0 max-h-[min(90vh,720px)] w-[min(100%-1.5rem,42rem)] sm:max-w-2xl",
          "bg-[#161616] border border-secondary text-primary shadow-2xl shadow-black/40",
          "rounded-2xl overflow-hidden"
        )}
      >
        <AlertDialogHeader className="sr-only">
          <AlertDialogTitle>Shopping cart</AlertDialogTitle>
        </AlertDialogHeader>
        <div className="flex flex-col min-h-0 flex-1 max-h-[min(90vh,720px)]">
          <CartDrawerContent onClose={handleClose} />
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
}
