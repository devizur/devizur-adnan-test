"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useBookingCart } from "@/contexts/BookingCartContext";
import { useActivities } from "@/lib/api/hooks";
import { cn } from "@/lib/utils";
import { OPTIONS } from "./constants";
 

interface BookingProductListProps {
  currentStep: number;
}

export function BookingProductList({ currentStep }: BookingProductListProps) {
  const { selectedProducts, toggleProduct, setProductOption } = useBookingCart();
  const { data: activities = [], isLoading } = useActivities();
  const products = activities.slice(0, 10);
  const canEdit = currentStep === 1;

  return (
    <div  className="border  broder-accent ">
      <CardHeader className="py-3 px-4 border-b border-border">
        <CardTitle className="text-sm font-semibold text-foreground">Product List</CardTitle>
      </CardHeader>
      <CardContent className="p-2 pt-0 space-y-2">
        {isLoading && (
          <p className="text-[11px] text-muted-foreground mb-2">Loading...</p>
        )}
        {products.map((pd) => {
          const isActive = selectedProducts.some((item) => item.id === pd.id);
          const product = selectedProducts.find((item) => item.id === pd.id);
          return (
            <div key={pd.id}>
              <div
                role="button"
                tabIndex={canEdit ? 0 : -1}
                onClick={() => canEdit && toggleProduct(pd)}
                onKeyDown={(e) =>
                  canEdit && e.key === "Enter" && toggleProduct(pd)
                }
                className={cn(
                  "flex items-center gap-2 p-2 rounded-lg border transition-colors",
                  canEdit && "cursor-pointer hover:bg-muted/60",
                  isActive
                    ? "border-primary-1 bg-primary-1/10 text-foreground"
                    : "border-border bg-secondary text-foreground"
                )}
              >
                <img
                  src={pd.image || "https://picsum.photos/200"}
                  alt=""
                  className="w-12 h-12 rounded object-cover shrink-0"
                />
                <div className="min-w-0 flex-1 text-left">
                  <p className="text-sm font-medium truncate text-foreground">{pd.title}</p>
                  <p className="text-[11px] text-muted-foreground">
                    {pd.duration || "6:00 am – 8:00 pm"}
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    {OPTIONS.map((opt, i) => (
                      <span key={opt.label}>
                        {opt.label} ${opt.price}
                        {i < OPTIONS.length - 1 ? ", " : ""}
                      </span>
                    ))}
                  </p>
                </div>
              </div>
              {isActive && product && currentStep === 1 && (
                <div className="flex flex-wrap gap-1 mt-2 mb-2">
                  {OPTIONS.map((opt) => (
                    <button
                      key={opt.label}
                      type="button"
                      onClick={() => setProductOption(pd.id, opt.value)}
                      className={cn(
                        "px-2 py-1 rounded text-xs font-medium border transition-colors border-border",
                        product?.selectedOption === opt?.value
                          ? "bg-primary-1 text-black border-primary-1"
                          : "bg-secondary text-foreground hover:bg-muted"
                      )}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </CardContent>
    </div>
  );
}
