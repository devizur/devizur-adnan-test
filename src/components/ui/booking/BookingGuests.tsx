"use client";

import React from "react";
import { useAppDispatch, useAppSelector } from "@/store";
import {
  incrementAdults,
  decrementAdults,
  incrementChildren,
  decrementChildren,
} from "@/store/bookingSlice";

export function BookingGuests() {
  const dispatch = useAppDispatch();
  const persons = useAppSelector((state) => state.booking.persons);

  return (
    <div className="flex flex-wrap items-center gap-4">
      <span className="text-[11px] text-gray-500 uppercase tracking-wider">Guests</span>
      <div className="flex items-center gap-5">
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-400 w-12 text-left">Adults</span>
          <div className="flex items-center rounded-xl border border-gray-700/80 bg-[#1e1e1e] overflow-hidden">
            <button
              type="button"
              disabled={persons.adults === 0}
              onClick={() => dispatch(decrementAdults())}
              className="min-h-11 min-w-11 flex items-center justify-center text-gray-400 hover:text-white hover:bg-gray-800/80 disabled:opacity-40 disabled:pointer-events-none transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary-1/50"
              aria-label="Decrease adults"
            >
              −
            </button>
            <span
              className="text-sm font-medium text-white min-w-8 text-center tabular-nums"
              aria-live="polite"
            >
              {persons.adults}
            </span>
            <button
              type="button"
              onClick={() => dispatch(incrementAdults())}
              className="min-h-11 min-w-11 flex items-center justify-center text-gray-400 hover:text-white hover:bg-gray-800/80 transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary-1/50"
              aria-label="Increase adults"
            >
              +
            </button>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-400 w-12 text-left">Children</span>
          <div className="flex items-center rounded-xl border border-gray-700/80 bg-[#1e1e1e] overflow-hidden">
            <button
              type="button"
              disabled={persons.children === 0}
              onClick={() => dispatch(decrementChildren())}
              className="min-h-11 min-w-11 flex items-center justify-center text-gray-400 hover:text-white hover:bg-gray-800/80 disabled:opacity-40 disabled:pointer-events-none transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary-1/50"
              aria-label="Decrease children"
            >
              −
            </button>
            <span
              className="text-sm font-medium text-white min-w-8 text-center tabular-nums"
              aria-live="polite"
            >
              {persons.children}
            </span>
            <button
              type="button"
              onClick={() => dispatch(incrementChildren())}
              className="min-h-11 min-w-11 flex items-center justify-center text-gray-400 hover:text-white hover:bg-gray-800/80 transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary-1/50"
              aria-label="Increase children"
            >
              +
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
