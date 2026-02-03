"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useBookingCart } from "@/contexts/BookingCartContext";

interface Step4YourDetailsProps {
  onSubmit?: (e: React.FormEvent) => void;
}

export function Step4YourDetails({ onSubmit }: Step4YourDetailsProps) {
  const { bookingDetails, setBookingDetails } = useBookingCart();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setBookingDetails((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <Card className="border-border bg-card">
      <CardHeader className="py-3 px-4 border-b border-border">
        <CardTitle className="text-sm font-semibold text-foreground">
          Booking Holder Details
        </CardTitle>
      </CardHeader>
      <CardContent className="p-2 pt-0">
        <form id="bookingForm" onSubmit={onSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm text-foreground">
                Email <span className="text-destructive">*</span>
              </label>
              <Input
                required
                type="email"
                id="email"
                name="email"
                placeholder="Enter your email"
                value={bookingDetails.email ?? ""}
                onChange={handleChange}
                className="border-border bg-background text-foreground"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="phone" className="text-sm text-foreground">
                Phone <span className="text-destructive">*</span>
              </label>
              <Input
                required
                type="tel"
                id="phone"
                name="phone"
                placeholder="Enter phone number"
                value={bookingDetails.phone ?? ""}
                onChange={handleChange}
                className="border-border bg-background text-foreground"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="firstName" className="text-sm text-foreground">
                First Name <span className="text-destructive">*</span>
              </label>
              <Input
                required
                type="text"
                id="firstName"
                name="firstName"
                placeholder="Enter first name"
                value={bookingDetails.firstName ?? ""}
                onChange={handleChange}
                className="border-border bg-background text-foreground"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="lastName" className="text-sm text-foreground">
                Last Name
              </label>
              <Input
                type="text"
                id="lastName"
                name="lastName"
                placeholder="Enter last name"
                value={bookingDetails.lastName ?? ""}
                onChange={handleChange}
                className="border-border bg-background text-foreground"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="address" className="text-sm text-foreground">
                Address <span className="text-destructive">*</span>
              </label>
              <Input
                required
                type="text"
                id="address"
                name="address"
                placeholder="Enter address"
                value={bookingDetails.address ?? ""}
                onChange={handleChange}
                className="border-border bg-background text-foreground"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="postcode" className="text-sm text-foreground">
                Postcode <span className="text-destructive">*</span>
              </label>
              <Input
                required
                type="text"
                id="postcode"
                name="postcode"
                placeholder="Enter postcode"
                value={bookingDetails.postcode ?? ""}
                onChange={handleChange}
                className="border-border bg-background text-foreground"
              />
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
