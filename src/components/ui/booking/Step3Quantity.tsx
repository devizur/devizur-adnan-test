"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Minus, Plus } from "lucide-react";
import { useBookingCart } from "@/contexts/BookingCartContext";
import { cn } from "@/lib/utils";

export function Step3Quantity() {
  const { selectedProducts, updateProductQty } = useBookingCart();
  const firstProduct = selectedProducts[0];

  return (
    <Card className="border-border bg-card">
      <CardHeader className="py-3 px-4 border-b border-border">
        <CardTitle className="text-sm font-semibold text-foreground">Quantity</CardTitle>
        <p className="text-xs text-muted-foreground mt-1">
          Choose number of adults and kids for your booking.
        </p>
      </CardHeader>
      <CardContent className="p-2 pt-0 space-y-4">
        {firstProduct?.types ? (
          <div className="space-y-4 max-w-xs mx-auto">
            {firstProduct.types.map((type) => (
              <div
                key={type.id}
                className="flex items-center justify-between p-3 rounded-lg border border-border bg-muted/40"
              >
                <div>
                  <label className="text-sm font-medium text-foreground">{type.label}</label>
                  <p className="text-xs text-muted-foreground">${type.price} each</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    disabled={type.qty === 0}
                    onClick={() =>
                      updateProductQty(firstProduct.id, type.id, "decrement")
                    }
                    className={cn(
                      "p-2 rounded border border-border hover:bg-accent text-foreground",
                      type.qty === 0 && "opacity-50 pointer-events-none"
                    )}
                  >
                    <Minus className="size-4" />
                  </button>
                  <span className="font-semibold min-w-6 text-center text-lg text-foreground">
                    {type.qty}
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      updateProductQty(firstProduct.id, type.id, "increment")
                    }
                    className="p-2 rounded border border-border hover:bg-accent text-foreground"
                  >
                    <Plus className="size-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground text-center py-4">
            Select at least one product in step 1 first.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
