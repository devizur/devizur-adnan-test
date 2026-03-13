"use client";

import React from "react";
import { useAppDispatch, useAppSelector } from "@/store";
import {
  incrementAdults,
  decrementAdults,
  incrementKids,
  decrementKids,
} from "@/store/bookingSlice";

interface GuestCounterProps {
  label: string;
  value: number;
  onIncrement: () => void;
  onDecrement: () => void;
  ariaLabelDecrement: string;
  ariaLabelIncrement: string;
  labelWidthClass?: string;
}

function GuestCounter({
  label,
  value,
  onIncrement,
  onDecrement,
  ariaLabelDecrement,
  ariaLabelIncrement,
  labelWidthClass = "w-14",
}: GuestCounterProps) {
  return (
    <div className="flex items-center gap-2.5">
      <span className={`text-sm font-medium text-gray-400 ${labelWidthClass} text-left`}>{label}</span>
      <div className="flex items-center rounded-xl border border-gray-700/80 bg-[#1e1e1e] overflow-hidden">
        <button
          type="button"
          disabled={value === 0}
          onClick={onDecrement}
          className="min-h-11 min-w-11 flex items-center justify-center text-gray-400 hover:text-white hover:bg-gray-800/80 disabled:opacity-40 disabled:pointer-events-none transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary-1/50 text-lg"
          aria-label={ariaLabelDecrement}
        >
          −
        </button>
        <span
          className="text-sm font-semibold text-white min-w-8 text-center tabular-nums"
          aria-live="polite"
        >
          {value}
        </span>
        <button
          type="button"
          onClick={onIncrement}
          className="min-h-11 min-w-11 flex items-center justify-center text-gray-400 hover:text-white hover:bg-gray-800/80 transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary-1/50 text-lg"
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
        <div className="flex items-center gap-6">
          <GuestCounter
            label="Adults"
            value={persons.adults}
            onIncrement={() => dispatch(incrementAdults())}
            onDecrement={() => dispatch(decrementAdults())}
            ariaLabelDecrement="Decrease adults"
            ariaLabelIncrement="Increase adults"
            labelWidthClass="w-14"
          />
          <GuestCounter
            label="Kids"
            value={persons.kids}
            onIncrement={() => dispatch(incrementKids())}
            onDecrement={() => dispatch(decrementKids())}
            ariaLabelDecrement="Decrease kids"
            ariaLabelIncrement="Increase kids"
            labelWidthClass="w-14"
          />
        </div>
      </div>
    </div>
  );
}
