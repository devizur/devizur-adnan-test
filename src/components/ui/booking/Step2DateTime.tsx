"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useBookingCart } from "@/contexts/BookingCartContext";
import { cn } from "@/lib/utils";
import { SLOTS, SHIFT } from "./constants";

export function Step2DateTime() {
  const { slot, setSlot, activeTab, setActiveTab, bookingDetails, setBookingDetails } =
    useBookingCart();

  return (
    <Card className="border-border bg-card">
      <CardHeader className="py-3 px-4 flex flex-row items-center justify-between border-b border-border">
        <CardTitle className="text-sm font-semibold text-foreground">Date & Time</CardTitle>
        <Badge variant="secondary" className="font-medium text-foreground bg-muted">
          ⏱ 29:47 remaining
        </Badge>
      </CardHeader>
      <CardContent className="p-2 pt-0 space-y-4">
        <div>
          <label className="text-xs text-muted-foreground block mb-1">Date</label>
          <Input
            type="date"
            className="w-full border-border bg-background text-foreground"
            value={bookingDetails.date ?? ""}
            onChange={(e) =>
              setBookingDetails((prev) => ({ ...prev, date: e.target.value }))
            }
          />
        </div>
        <div className="flex gap-2">
          {SHIFT.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "px-3 py-1.5 rounded-md text-xs font-medium border transition-colors border-border",
                activeTab === tab.id
                  ? "bg-primary-1 text-black border-primary-1"
                  : "bg-secondary text-foreground hover:bg-muted"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <div className="text-[11px] text-muted-foreground uppercase tracking-wide">
          SELECT START TIME · 34 sessions found
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
          {SLOTS.map((s) => (
            <button
              key={s.t}
              type="button"
              onClick={() => setSlot(s.t)}
              className={cn(
                "flex flex-col items-center justify-center p-2 rounded-lg border text-xs transition-colors relative border-border",
                slot === s.t
                  ? "bg-primary-1 text-black border-primary-1"
                  : "bg-secondary text-foreground hover:bg-muted"
              )}
            >
              <span className="font-semibold">{s.t}</span>
              <span className="text-[10px] opacity-80">100 available</span>
              {s.off && (
                <span className="absolute top-0.5 right-0.5 bg-amber-400 text-black text-[9px] font-bold px-1 rounded">
                  $5 OFF
                </span>
              )}
            </button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
