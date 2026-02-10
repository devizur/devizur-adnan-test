"use client";

import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { Input } from "@/components/ui/input";
import type { RootState } from "@/store";
import { setHolderDetails } from "@/store/bookingSlice";

interface Step3HolderDetailsProps {
  onSubmit?: (e: React.FormEvent) => void;
}

export function Step3HolderDetails({ onSubmit }: Step3HolderDetailsProps) {
  const dispatch = useDispatch();
  const { holderDetails } = useSelector((state: RootState) => state.booking);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    dispatch(setHolderDetails({ [name]: value }));
  };

  return (
    <form id="bookingForm" onSubmit={onSubmit} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
            value={holderDetails.firstName}
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
            value={holderDetails.lastName}
            onChange={handleChange}
            className="border-border bg-background text-foreground"
          />
        </div>
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
            value={holderDetails.email}
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
            value={holderDetails.phone}
            onChange={handleChange}
            className="border-border bg-background text-foreground"
          />
        </div>
        <div className="space-y-2 sm:col-span-2">
          <label htmlFor="address" className="text-sm text-foreground">
            Address <span className="text-destructive">*</span>
          </label>
          <Input
            required
            type="text"
            id="address"
            name="address"
            placeholder="Enter address"
            value={holderDetails.address}
            onChange={handleChange}
            className="border-border bg-background text-foreground"
          />
        </div>
        <div className="space-y-2">
          <label htmlFor="postCode" className="text-sm text-foreground">
            Post Code <span className="text-destructive">*</span>
          </label>
          <Input
            required
            type="text"
            id="postCode"
            name="postCode"
            placeholder="Enter postcode"
            value={holderDetails.postCode}
            onChange={handleChange}
            className="border-border bg-background text-foreground"
          />
        </div>
      </div>
    </form>
  );
}
