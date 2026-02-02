"use client";

import * as React from "react";
import { useActivities } from "@/lib/api/hooks";
import { useCart } from "@/contexts/CartContext";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface BookingDialogProps {
  children: React.ReactNode;
  onConfirm?: () => void;
  initialActivityId?: number;
}

type GameOption = "1 Game" | "2 Games" | "3 Games";

const GAME_OPTIONS: GameOption[] = ["1 Game", "2 Games", "3 Games"];

const TIME_FILTERS = ["Morning", "Afternoon", "Evening"] as const;
type TimeFilter = (typeof TIME_FILTERS)[number];

const TIME_SLOTS = [
  "6:00 am",
  "6:30 am",
  "7:00 am",
  "7:30 am",
  "8:00 am",
  "8:30 am",
  "9:00 am",
  "9:30 am",
  "10:00 am",
  "10:30 am",
  "11:00 am",
  "11:30 am",
];

export function BookingDialog({
  children,
  onConfirm,
  initialActivityId,
}: BookingDialogProps) {
  const { data: activities = [], isLoading } = useActivities();
  const { activityItems, addActivity } = useCart();

  const [selectedActivityId, setSelectedActivityId] = React.useState<
    number | null
  >(initialActivityId ?? null);
  const [selectedGameOption, setSelectedGameOption] =
    React.useState<GameOption>("2 Games");
  const [activeFilter, setActiveFilter] =
    React.useState<TimeFilter>("Morning");
  const [adultCount, setAdultCount] = React.useState(2);
  const [childCount, setChildCount] = React.useState(2);
  const [selectedTime, setSelectedTime] = React.useState<string | null>(
    "6:00 am",
  );
  const [showGameOptions, setShowGameOptions] = React.useState(false);

  const handleActivityClick = (activityId: number) => {
    if (selectedActivityId === activityId) {
      // Toggle game options if clicking the same activity
      setShowGameOptions(!showGameOptions);
    } else {
      // Select new activity and show game options
      setSelectedActivityId(activityId);
      setShowGameOptions(true);
    }
  };

  const handleGameSelection = (option: GameOption) => {
    setSelectedGameOption(option);
    
    // Add to cart when game option is selected
    if (selectedActivityId) {
      const activity = activities.find(a => a.id === selectedActivityId);
      if (activity) {
        const gameNo = parseInt(option.split(' ')[0]); // Extract number from "1 Game", "2 Games", etc.
        addActivity(activity, gameNo);
      }
    }
  };

  const handleConfirm = () => {
    onConfirm?.();
  };

  React.useEffect(() => {
    
    if (!selectedActivityId && activities.length > 0) {
      const fallbackId = initialActivityId ?? activities[0].id;
      const existsInList = activities.some(
        (activity) => activity.id === fallbackId,
      );
      setSelectedActivityId(existsInList ? fallbackId : activities[0].id);
    }
  }, [activities, selectedActivityId, initialActivityId]);

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>{children}</AlertDialogTrigger>
      <AlertDialogContent className="min-w-[90%] h-[90%] max-w-5xl bg-secondary-2 border-secondary-2 p-6 flex flex-col gap-4">
        <header className="flex items-center justify-between">
          <AlertDialogTitle className="text-lg font-semibold text-primary">
            Create Booking
          </AlertDialogTitle>
          <AlertDialogCancel className="rounded-full bg-red-500/10 border border-red-500/40 text-red-400 px-4 py-1.5 text-xs font-medium hover:bg-red-500/20">
            Close
          </AlertDialogCancel>
        </header>

        <main className="flex-1 grid grid-cols-1 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] gap-4 overflow-hidden">
          {/* Activity list */}
          <section className="bg-secondary border border-accent/20 rounded-xl p-4 flex flex-col overflow-hidden">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold text-primary">
                Activity List
              </h2>
            </div>

            {isLoading && (
              <p className="text-[11px] text-gray-400 mb-2">
                Loading activities...
              </p>
            )}

            <div className="flex-1 overflow-y-auto space-y-2 pr-1">
              {activities.map((activity) => {
                const isSelected = activity.id === selectedActivityId;
                const isInCart = activityItems.some(
                  (item) => item.activity.id === activity.id,
                );

                const stateClasses = isInCart
                  ? "border-red-500 bg-red-500/10"
                  : isSelected
                    ? "border-primary-1 bg-primary-1/10"
                    : "border-accent/20 bg-secondary hover:bg-secondary/70";

                return (
                  <div
                    key={activity.id}
                    className={[
                      "w-full rounded-xl border px-3 py-2 transition-colors",
                      stateClasses,
                    ].join(" ")}
                  >
                    <div
                      className="flex items-center gap-3 cursor-pointer"
                      onClick={() => handleActivityClick(activity.id)}
                    >
                      <img
                        src={activity.image}
                        alt={activity.title}
                        className="w-14 h-14 rounded-lg object-cover"
                      />
                      <div className="flex-1 text-left">
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-sm font-semibold text-primary truncate">
                            {activity.title}
                          </p>
                        </div>
                        <p className="text-[11px] text-gray-400 mt-0.5 line-clamp-1">
                          {activity.duration || activity.category}
                        </p>
                        <p className="text-[11px] text-gray-500 mt-0.5 line-clamp-1">
                          {activity.price} {activity.unit}
                        </p>
                      </div>
                      {isSelected && (
                        <svg 
                          xmlns="http://www.w3.org/2000/svg" 
                          width="16" 
                          height="16" 
                          viewBox="0 0 24 24" 
                          fill="none" 
                          stroke="currentColor" 
                          strokeWidth="2" 
                          strokeLinecap="round" 
                          strokeLinejoin="round"
                          className={`text-primary-1 transition-transform ${showGameOptions ? 'rotate-180' : ''}`}
                        >
                          <path d="m6 9 6 6 6-6"/>
                        </svg>
                      )}
                    </div>
                    
                    {isSelected && showGameOptions && (
                      <div className="mt-3 grid grid-cols-3 gap-2">
                        {GAME_OPTIONS.map((option) => {
                          const isGameSelected = selectedGameOption === option;
                          return (
                            <button
                              key={option}
                              type="button"
                              onClick={() => handleGameSelection(option)}
                              className={[
                                "px-2 py-1.5 rounded-lg text-xs font-bold border cursor-pointer transition-colors",
                                isGameSelected
                                  ? "bg-primary-1 text-black border-primary-1"
                                  : "bg-secondary-2 text-gray-300 border-accent/30 hover:bg-primary-1/10",
                              ].join(" ")}
                            >
                              {option}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </section>

          {/* Availability / booking details */}
          <section className="bg-secondary border border-accent/20 rounded-xl p-4 flex flex-col overflow-hidden">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-sm font-semibold text-primary">
                  Availability
                </h2>
                <p className="text-[11px] text-gray-400">
                  Friday, 16th December 2025
                </p>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1 text-xs bg-primary-1/10 border border-primary-1/40 rounded-full px-3 py-1">
                  <span className="text-primary-1 font-medium">
                    Time Remaining
                  </span>
                  <span className="text-yellow-300 font-semibold">29:47</span>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 mb-4">
              {TIME_FILTERS.map((filter) => {
                const isActive = activeFilter === filter;
                return (
                  <button
                    key={filter}
                    type="button"
                    onClick={() => setActiveFilter(filter)}
                    className={[
                      "px-3 py-1.5 rounded-md text-xs font-medium border cursor-pointer transition-colors",
                      isActive
                        ? "bg-primary-1 text-black border-primary-1"
                        : "bg-secondary-2 text-gray-300 border-accent/30 hover:bg-primary-1/10",
                    ].join(" ")}
                  >
                    {filter}
                  </button>
                );
              })}
            </div>

            {/* Pricing */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="flex items-center justify-between rounded-lg border border-accent/30 bg-secondary-2 px-3 py-2">
                <div>
                  <p className="text-xs text-gray-400">Adult</p>
                  <p className="text-sm font-semibold text-primary">$12.00</p>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() =>
                      setAdultCount((prev) => Math.max(0, prev - 1))
                    }
                    className="w-6 h-6 rounded border border-accent/40 text-xs text-primary flex items-center justify-center hover:bg-primary-1/10 cursor-pointer"
                  >
                    {"<"}
                  </button>
                  <span className="w-6 text-center text-xs font-medium text-primary">
                    {adultCount}
                  </span>
                  <button
                    type="button"
                    onClick={() => setAdultCount((prev) => prev + 1)}
                    className="w-6 h-6 rounded border border-accent/40 text-xs text-primary flex items-center justify-center hover:bg-primary-1/10 cursor-pointer"
                  >
                    {">"}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between rounded-lg border border-accent/30 bg-secondary-2 px-3 py-2">
                <div>
                  <p className="text-xs text-gray-400">Child</p>
                  <p className="text-sm font-semibold text-primary">$9.00</p>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() =>
                      setChildCount((prev) => Math.max(0, prev - 1))
                    }
                    className="w-6 h-6 rounded border border-accent/40 text-xs text-primary flex items-center justify-center hover:bg-primary-1/10 cursor-pointer"
                  >
                    {"<"}
                  </button>
                  <span className="w-6 text-center text-xs font-medium text-primary">
                    {childCount}
                  </span>
                  <button
                    type="button"
                    onClick={() => setChildCount((prev) => prev + 1)}
                    className="w-6 h-6 rounded border border-accent/40 text-xs text-primary flex items-center justify-center hover:bg-primary-1/10 cursor-pointer"
                  >
                    {">"}
                  </button>
                </div>
              </div>
            </div>

            {/* Time slots */}
            <div className="flex flex-col gap-2 overflow-hidden">
              <div className="flex items-center justify-between">
                <p className="text-[11px] text-gray-400">
                  SELECT START TIME{" "}
                  <span className="text-gray-500">34 sessions found</span>
                </p>
              </div>
              <div className="flex-1 overflow-y-auto border border-accent/20 rounded-xl p-3 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
                {TIME_SLOTS.map((slot, index) => {
                  const isSelected = selectedTime === slot;
                  const showDiscount = slot === "6:00 am" || slot === "11:00 am";
                  return (
                    <button
                      key={slot}
                      type="button"
                      onClick={() => setSelectedTime(slot)}
                      className={[
                        "relative flex flex-col items-center justify-center rounded-lg border px-2 py-2 text-xs cursor-pointer transition-colors",
                        isSelected
                          ? "bg-primary-1 text-black border-primary-1"
                          : "bg-secondary-2 text-gray-200 border-accent/30 hover:bg-primary-1/10",
                      ].join(" ")}
                    >
                      <span className="font-semibold">{slot}</span>
                      <span className="text-[10px] text-gray-400">
                        100 avail
                      </span>
                      {showDiscount && (
                        <span className="absolute -top-1 left-1 bg-yellow-300 text-black text-[9px] font-bold px-1.5 py-0.5 rounded-sm">
                          $5 off
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              <div className="flex justify-end mt-3">
                <AlertDialogFooter className="w-full sm:w-auto">
                  <AlertDialogAction
                    className="px-6 py-2 rounded-md bg-primary-1 text-black text-sm font-semibold hover:bg-primary-1/90"
                    onClick={handleConfirm}
                  >
                    Booking Request
                  </AlertDialogAction>
                </AlertDialogFooter>
              </div>
            </div>
          </section>
        </main>




      </AlertDialogContent>
    </AlertDialog>
  );
}

