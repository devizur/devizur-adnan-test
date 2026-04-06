"use client";

import React from "react";
import { useAppDispatch, useAppSelector } from "@/store";
import {
  incrementAdults,
  decrementAdults,
  incrementKids,
  decrementKids,
} from "@/store/bookingSlice";
import {
  segmentedStripClass,
  segmentedSideBtnClass,
  segmentedNumericValueClass,
} from "./booking-segmented-styles";

export function BookingGuests() {
  const dispatch = useAppDispatch();
  const persons = useAppSelector((state) => state.booking.persons);

  return (
    <div className="w-full">
      <div
        className={segmentedStripClass}
        role="group"
        aria-label="Guest counts: adults and kids"
      >
        <button
          type="button"
          disabled={persons.adults === 0}
          onClick={() => dispatch(decrementAdults())}
          className={`${segmentedSideBtnClass} text-sm leading-none`}
          aria-label="Decrease adults"
        >
          −
        </button>
        <span
          className={segmentedNumericValueClass}
          aria-live="polite"
          aria-label={`Adults: ${persons.adults}`}
        >
          {persons.adults}
        </span>
        <button
          type="button"
          onClick={() => dispatch(incrementAdults())}
          className={`${segmentedSideBtnClass} text-sm leading-none`}
          aria-label="Increase adults"
        >
          +
        </button>
        <button
          type="button"
          disabled={persons.kids === 0}
          onClick={() => dispatch(decrementKids())}
          className={`${segmentedSideBtnClass} text-sm leading-none`}
          aria-label="Decrease kids"
        >
          −
        </button>
        <span
          className={segmentedNumericValueClass}
          aria-live="polite"
          aria-label={`Kids: ${persons.kids}`}
        >
          {persons.kids}
        </span>
        <button
          type="button"
          onClick={() => dispatch(incrementKids())}
          className={`${segmentedSideBtnClass} text-sm leading-none`}
          aria-label="Increase kids"
        >
          +
        </button>
      </div>
      <div className="mt-1 grid grid-cols-2 gap-0 px-0.5 text-[9px] font-medium uppercase tracking-[0.12em] text-zinc-500">
        <span className="text-center">Adults</span>
        <span className="text-center">Kids</span>
      </div>
    </div>
  );
}
