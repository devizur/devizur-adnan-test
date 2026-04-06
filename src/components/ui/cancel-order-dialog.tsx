"use client";

import * as React from "react";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { deleteOrderFromBackend } from "@/lib/api/localHttp";
import { removePaidOrderById, type PaidOrderRecord } from "@/lib/paidOrdersStorage";

export function CancelOrderConfirmDialog({
  order,
  open,
  onOpenChange,
  onRemoved,
}: {
  order: PaidOrderRecord | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onRemoved: (orderId: string) => void;
}) {
  const [busy, setBusy] = React.useState(false);
  const [err, setErr] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!open) {
      setErr(null);
      setBusy(false);
    }
  }, [open]);

  const handleConfirm = async () => {
    if (!order) return;
    setBusy(true);
    setErr(null);
    try {
      await deleteOrderFromBackend(order.id);
      removePaidOrderById(order.id);
      onRemoved(order.id);
      onOpenChange(false);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Could not remove order");
    } finally {
      setBusy(false);
    }
  };

  if (!order) return null;

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="border-zinc-800 bg-[#1a1a1a] text-primary sm:max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle>Cancel this order?</AlertDialogTitle>
          <AlertDialogDescription className="text-zinc-400">
            Order <span className="font-mono text-accent">{order.id}</span> will be removed from the server JSON
            file and from saved orders in this browser. This cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        {err ? (
          <p className="text-sm text-red-400/90 rounded-md border border-red-500/20 bg-red-500/10 px-3 py-2">{err}</p>
        ) : null}
        <AlertDialogFooter className="gap-2 sm:gap-0">
          <AlertDialogCancel
            disabled={busy}
            className="border-zinc-600 text-accent hover:bg-zinc-800 hover:text-white mt-0"
          >
            Keep order
          </AlertDialogCancel>
          <Button
            type="button"
            variant="destructive"
            disabled={busy}
            className="bg-red-600 hover:bg-red-700 text-white"
            onClick={() => void handleConfirm()}
          >
            {busy ? "Removing…" : "Remove order"}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
