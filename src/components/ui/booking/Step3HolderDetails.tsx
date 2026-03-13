"use client";

import React from "react";
import { useAppDispatch, useAppSelector } from "@/store";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { setHolderDetails } from "@/store/bookingSlice";

interface Step3HolderDetailsProps {
  onSubmit?: (e: React.FormEvent) => void;
}

const inputBase =
  "min-h-11 h-11 rounded-xl border border-gray-700 bg-[#1e1e1e] text-white placeholder:text-gray-500 focus-visible:ring-2 focus-visible:ring-primary-1/30 focus-visible:border-primary-1 transition-colors cursor-text text-base touch-manipulation";

function Field({
  id,
  name,
  label,
  required,
  type = "text",
  placeholder,
  value,
  onChange,
}: {
  id: string;
  name: string;
  label: string;
  required?: boolean;
  type?: string;
  placeholder: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="block text-xs font-medium text-gray-400">
        {label}
        {required && <span className="text-red-400/90 ml-0.5">*</span>}
      </label>
      <Input
        required={required}
        type={type}
        id={id}
        name={name}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className={inputBase}
      />
    </div>
  );
}

export function Step3HolderDetails({ onSubmit }: Step3HolderDetailsProps) {
  const dispatch = useAppDispatch();
  const { holderDetails } = useAppSelector((state) => state.booking);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    dispatch(setHolderDetails({ [name]: value }));
  };

  return (
    <form id="bookingForm" onSubmit={onSubmit} className="space-y-4 sm:space-y-5">
      <p className="text-[11px] text-gray-500 uppercase tracking-wider">
        Booking holder details
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
        <Field
          id="firstName"
          name="firstName"
          label="First name"
          required
          placeholder="e.g. John"
          value={holderDetails.firstName}
          onChange={handleChange}
        />
        <Field
          id="lastName"
          name="lastName"
          label="Last name"
          placeholder="e.g. Smith"
          value={holderDetails.lastName}
          onChange={handleChange}
        />
        <Field
          id="email"
          name="email"
          label="Email"
          required
          type="email"
          placeholder="john@example.com"
          value={holderDetails.email}
          onChange={handleChange}
        />
        <Field
          id="phone"
          name="phone"
          label="Phone"
          required
          type="tel"
          placeholder="e.g. +44 7700 900000"
          value={holderDetails.phone}
          onChange={handleChange}
        />
        <div className="space-y-1.5 sm:col-span-2">
          <label htmlFor="address" className="block text-xs font-medium text-gray-400">
            Address <span className="text-red-400/90 ml-0.5">*</span>
          </label>
          <Textarea
            required
            id="address"
            name="address"
            placeholder="Street, city"
            value={holderDetails.address}
            onChange={handleChange}
            rows={3}
            className="min-h-[88px] rounded-xl border border-gray-700 bg-[#1e1e1e] text-white placeholder:text-gray-500 focus-visible:ring-2 focus-visible:ring-primary-1/30 focus-visible:border-primary-1 transition-colors resize-y"
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
    </form>
  );
}
