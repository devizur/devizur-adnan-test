"use client";

import * as React from "react";
import { Activity } from "@/lib/api/types";
import { X, Clock, Users, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/contexts/CartContext";
import { createPortal } from "react-dom";
import { toast } from "sonner";

interface ActivityDetailsDialogProps {
  activity: Activity | null;
  isOpen: boolean;
  onClose: () => void;
}

const GAME_OPTIONS = [
  { label: "1 Game", value: 1 },
  { label: "2 Games", value: 2 },
  { label: "5 Games", value: 5 },
];

export function ActivityDetailsDialog({
  activity,
  isOpen,
  onClose,
}: ActivityDetailsDialogProps) {
  const [selectedGames, setSelectedGames] = React.useState(2);
  const [mounted, setMounted] = React.useState(false);
  const { addActivity, activityItems } = useCart();

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || !isOpen || !activity) return null;

  const handleAddToCart = () => {
    const alreadyInCart = activityItems.some((i) => i.activity.id === activity.id);
    if (alreadyInCart) {
      toast.info("Already in cart", { description: activity.title });
    } else {
      addActivity(activity, selectedGames);
      toast.success("Activity added to cart", { description: activity.title });
    }
    onClose();
  };

  const basePrice = parseFloat(activity.price.replace(/[^0-9.]/g, ""));
  const totalPrice = (basePrice * selectedGames).toFixed(2);

  const dialogContent = (
    <div 
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-sm"
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-2xl mx-4 bg-[#1a1a1a] rounded-2xl overflow-hidden border border-zinc-800"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full bg-zinc-900/80 hover:bg-zinc-800 flex items-center justify-center transition-colors"
        >
          <X className="w-5 h-5 text-zinc-400" />
        </button>

        {/* Image Section */}
        <div className="relative h-64 w-full overflow-hidden">
          <img
            src={activity.image}
            alt={activity.title}
            className="w-full h-full object-cover"
          />
          {activity.discount && (
            <div className="absolute top-4 left-4 bg-primary-1 text-black px-4 py-2 rounded-lg text-sm font-bold">
              {activity.discount}
            </div>
          )}
          {activity.rating && (
            <div className="absolute bottom-4 left-4 bg-black/60 backdrop-blur-sm text-white px-3 py-1.5 rounded-full text-sm flex items-center gap-1">
              <Star className="w-4 h-4 fill-primary-1 text-primary-1" />
              {activity.rating}
            </div>
          )}
        </div>

        {/* Content Section */}
        <div className="p-6 space-y-6">
          {/* Title and Price */}
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-white mb-2">
                {activity.title}
              </h2>
              <div className="flex items-center gap-4 text-sm text-zinc-400">
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {activity.duration}
                </div>
                {activity.category && (
                  <span className="px-2 py-1 bg-zinc-800 rounded text-xs">
                    {activity.category}
                  </span>
                )}
              </div>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-primary-1">
                ${totalPrice}
              </div>
              <div className="text-xs text-zinc-500">{activity.unit}</div>
            </div>
          </div>

          {/* Game Options */}
          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-3">
              Select Games
            </label>
            <div className="grid grid-cols-3 gap-3">
              {GAME_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setSelectedGames(option.value)}
                  className={`py-3 px-4 rounded-lg border-2 font-bold text-sm transition-all ${
                    selectedGames === option.value
                      ? "bg-primary-1 border-primary-1 text-black"
                      : "bg-zinc-900 border-zinc-700 text-zinc-300 hover:border-primary-1/50"
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* Time Slots (if available) */}
          {activity.timeSlots && activity.timeSlots.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-3">
                Available Time Slots
              </label>
              <div className="flex flex-wrap gap-2">
                {activity.timeSlots.slice(0, 6).map((slot, idx) => (
                  <button
                    key={idx}
                    className="px-4 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-sm text-zinc-300 hover:border-primary-1/50 hover:text-white transition-all"
                  >
                    {slot}
                  </button>
                ))}
                {activity.timeSlots.length > 6 && (
                  <button className="px-4 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-sm text-zinc-500">
                    +{activity.timeSlots.length - 6} more
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              onClick={onClose}
              variant="outline"
              className="flex-1 h-12 rounded-lg border-zinc-700 text-zinc-300 hover:bg-zinc-800"
            >
              Cancel
            </Button>
            <Button
              onClick={handleAddToCart}
              variant="primary"
              className="flex-1 h-12 rounded-lg"
            >
              Add to Cart

  return createPortal(dialogContent, document.body);
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
