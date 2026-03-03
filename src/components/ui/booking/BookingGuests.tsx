"use client";

import React from "react";
import { useAppDispatch, useAppSelector } from "@/store";
import {
  incrementAdults,
  decrementAdults,
  incrementChildren,
  decrementChildren,
} from "@/store/bookingSlice";

interface GuestCounterProps {
  label: string;
  value: number;
  onIncrement: () => void;
  onDecrement: () => void;
  "aria-label-decrement": string;
  "aria-label-increment": string;
  labelWidthClass?: string;
}

function GuestCounter({
  label,
  value,
  onIncrement,
  onDecrement,
  "aria-label-decrement": ariaLabelDecrement,
  "aria-label-increment": ariaLabelIncrement,
  labelWidthClass = "w-12",
}: GuestCounterProps) {
  return (
    <div className="flex items-center gap-2">
      <span className={`text-sm text-gray-400 ${labelWidthClass} text-left`}>{label}</span>
      <div className="flex items-center rounded-xl border border-gray-700/80 bg-[#1e1e1e] overflow-hidden">
        <button
          type="button"
          disabled={value === 0}
          onClick={onDecrement}
          className="min-h-11 min-w-11 flex items-center justify-center text-gray-400 hover:text-white hover:bg-gray-800/80 disabled:opacity-40 disabled:pointer-events-none transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary-1/50"
          aria-label={ariaLabelDecrement}
        >
          −
        </button>
        <span
          className="text-sm font-medium text-white min-w-8 text-center tabular-nums"
          aria-live="polite"
        >
          {value}
        </span>
        <button
          type="button"
          onClick={onIncrement}
          className="min-h-11 min-w-11 flex items-center justify-center text-gray-400 hover:text-white hover:bg-gray-800/80 transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary-1/50"
          aria-label={ariaLabelIncrement}
        >
          +
        </button>
      </div>
    </div>
  );
}

export function BookingGuests() {
  const dispatch = useAppDispatch();
  const persons = useAppSelector((state) => state.booking.persons);

  return (
    <div className="">
      <div className="flex justify-center flex-wrap items-center gap-4 w-full">
        <div className="flex items-center gap-5">
          <GuestCounter
            label="Adults"
            value={persons.adults}
            onIncrement={() => dispatch(incrementAdults())}
            onDecrement={() => dispatch(decrementAdults())}
            aria-label-decrement="Decrease adults"
            aria-label-increment="Increase adults"
            labelWidthClass="w-12"
          />
          <GuestCounter
            label="Children"
            value={persons.children}
            onIncrement={() => dispatch(incrementChildren())}
            onDecrement={() => dispatch(decrementChildren())}
            aria-label-decrement="Decrease children"
            aria-label-increment="Increase children"
            labelWidthClass="w-14"
          />
        </div>
      </div>
    </div>
  );
}
