"use client";

import { Card, CardContent } from "@/components/ui/card";

export function Step1Products() {
  return (
    <Card className="border-border bg-card">
      <CardContent className="py-8 flex flex-col items-center justify-center text-center">
        <p className="text-muted-foreground text-sm max-w-sm">
          Select activities from the list and choose 1, 2, or 3 Games per product. Click Next when ready.
        </p>
      </CardContent>
    </Card>
  );
}
