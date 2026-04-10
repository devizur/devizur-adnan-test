"use client";

import React from "react";
import { useAppDispatch, useAppSelector } from "@/store";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { setHolderDetails } from "@/store/bookingSlice";
import { cn } from "@/lib/utils";

interface StepHolderDetailsProps {
  onSubmit?: (e: React.FormEvent) => void;
}

const inputBase = cn(
  "min-h-9 h-9 rounded-md border border-white/[0.08] bg-[#1e1e1e] px-3 text-sm text-zinc-100 shadow-sm shadow-black/10",
  "placeholder:text-zinc-600",
  "transition-colors cursor-text touch-manipulation",
  "focus-visible:border-primary-1/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-1/35 focus-visible:ring-inset"
);

const labelClass =
  "block text-[10px] font-semibold uppercase tracking-[0.12em] text-zinc-500";

function Field({
  id,
  name,
  label,
  required,
  type = "text",
  inputMode,
  maxLength,
  pattern,
  placeholder,
  value,
  onChange,
}: {
  id: string;
  name: string;
  label: string;
  required?: boolean;
  type?: string;
  inputMode?: React.HTMLAttributes<HTMLInputElement>["inputMode"];
  maxLength?: number;
  pattern?: string;
  placeholder: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) {
  return (
    <div className="space-y-1">
      <label htmlFor={id} className={labelClass}>
        {label}
        {required && <span className="ml-0.5 text-red-400/90">*</span>}
      </label>
      <Input
        required={required}
        type={type}
        id={id}
        name={name}
        inputMode={inputMode}
        maxLength={maxLength}
        pattern={pattern}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className={inputBase}
      />
    </div>
  );
}

export function StepHolderDetails({ onSubmit }: StepHolderDetailsProps) {
  const dispatch = useAppDispatch();
  const { holderDetails } = useAppSelector((state) => state.booking);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name } = e.target;
    let { value } = e.target;
    if (name === "phone") {
      value = value.replace(/\D+/g, "");
    }
    dispatch(setHolderDetails({ [name]: value }));
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="shrink-0 border-b border-white/[0.06] bg-gradient-to-b from-[#181818] to-[#161616] px-3 py-2.5 sm:px-5 sm:py-3">
        <p className="text-[9px] font-semibold uppercase tracking-[0.14em] text-zinc-500">
          Booking holder details
        </p>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-3 py-3 scrollbar-dark sm:px-5 sm:py-4">
        <form id="bookingForm" onSubmit={onSubmit} className="mx-auto max-w-3xl space-y-4 sm:space-y-5">
          <div className="rounded-xl border border-white/[0.08] bg-[#141414]/60 p-3 sm:p-4">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
              <Field
                id="firstName"
                name="firstName"
                label="First name"
                required
                placeholder="e.g. Rio"
                value={holderDetails.firstName}
                onChange={handleChange}
              />
              <Field
                id="lastName"
                name="lastName"
                label="Last name"
                placeholder="e.g. Redwood"
                value={holderDetails.lastName}
                onChange={handleChange}
              />
              <Field
                id="email"
                name="email"
                label="Email"
                required
                type="email"
                placeholder="rio@example.com"
                value={holderDetails.email}
                onChange={handleChange}
              />
              <Field
                id="phone"
                name="phone"
                label="Phone"
                required
                type="tel"
                inputMode="numeric"
                maxLength={15}
                pattern="[0-9]*"
                placeholder="e.g. 0412345678"
                value={holderDetails.phone}
                onChange={handleChange}
              />
              <div className="space-y-1 sm:col-span-2">
                <label htmlFor="address" className={labelClass}>
                  Address <span className="ml-0.5 text-red-400/90">*</span>
                </label>
                <Textarea
                  required
                  id="address"
                  name="address"
                  placeholder="Street, city"
                  value={holderDetails.address}
                  onChange={handleChange}
                  rows={3}
                  className={cn(
                    "min-h-[5rem] resize-y rounded-md border border-white/[0.08] bg-[#1e1e1e] px-3 py-2 text-sm text-zinc-100 shadow-sm shadow-black/10",
                    "placeholder:text-zinc-600",
                    "transition-colors",
                    "focus-visible:border-primary-1/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-1/35 focus-visible:ring-inset"
                  )}
                />
              </div>
              <Field
                id="postCode"
                name="postCode"
                label="Postcode"
                required
                placeholder="e.g. SW1A 1AA"
                value={holderDetails.postCode}
                onChange={handleChange}
              />
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
