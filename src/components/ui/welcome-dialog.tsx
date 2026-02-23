"use client";

import * as React from "react";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Star, MapPin, Store } from "lucide-react";

const SELECTED_SHOP_KEY = "welcome-selected-shop";

const SHOPS = [
  {
    id: 1,
    title: "Santorini Villa",
    description: "Luxury villa overlooking the Aegean Sea, offering breathtaking sunset views and a private infinity pool for ultimate relaxation.",
    tags: [{ type: "rating", label: "4.5", icon: "star" }, { type: "stay", label: "3 Night Stay" }],
    image: "https://picsum.photos/seed/santorini/400/280",
  },
  {
    id: 2,
    title: "Swiss Chalet",
    description: "Cozy wooden chalet nestled in the Swiss Alps, offering a warm fireplace, scenic mountain views, and direct access to ski slopes.",
    tags: [{ type: "badge", label: "Guest Favorite", icon: "pin" }, { type: "stay", label: "4 Night Stay" }],
    image: "https://picsum.photos/seed/swiss/400/280",
  },
  {
    id: 3,
    title: "Lakeside Retreat",
    description: "Peaceful retreat by the lake with a private dock, kayaks, and stunning sunrise views.",
    tags: [{ type: "rating", label: "4.8", icon: "star" }, { type: "stay", label: "2 Night Stay" }],
    image: "https://picsum.photos/seed/lakeside/400/280",
  },
  {
    id: 4,
    title: "Urban Loft",
    description: "Modern loft in the heart of the city with rooftop access and skyline views.",
    tags: [{ type: "badge", label: "Trending", icon: "pin" }, { type: "stay", label: "1 Night Stay" }],
    image: "https://picsum.photos/seed/urban/400/280",
  },
  {
    id: 5,
    title: "Garden Cottage",
    description: "Charming cottage with a private garden, perfect for a quiet getaway.",
    tags: [{ type: "rating", label: "4.9", icon: "star" }, { type: "stay", label: "5 Night Stay" }],
    image: "https://picsum.photos/seed/garden/400/280",
  },
];

export function WelcomeDialog() {
  const [open, setOpen] = React.useState(true);

  React.useEffect(() => {
    setOpen(true);
  }, []);

  const handleShopSelect = (shop: (typeof SHOPS)[0]) => {
    setOpen(false);
    if (typeof window !== "undefined") {
      localStorage.setItem(SELECTED_SHOP_KEY, String(shop.id));
    }
  };

  return (
    <AlertDialog
      open={open}
      onOpenChange={(next) => {
        if (!next) return;
        setOpen(next);
      }}
    >
      <AlertDialogContent
        className="w-[calc(100vw-1rem)] max-w-[calc(100vw-1rem)] sm:min-w-[90%] sm:max-w-4xl bg-secondary-2 backdrop-blur-xl p-0 gap-0 text-white border border-white/10 rounded-2xl sm:rounded-3xl overflow-hidden max-h-[95vh] flex flex-col shadow-2xl"
      >
        <AlertDialogHeader className="px-6 py-5 sm:px-8 sm:py-6 shrink-0 border-b border-white/5">
          <div className="flex items-start gap-3 sm:gap-4">
            <div className="flex h-10 w-10 sm:h-12 sm:w-12 shrink-0 items-center justify-center rounded-xl bg-primary-1/15 text-primary-1">
              <Store className="h-5 w-5 sm:h-6 sm:w-6" />
            </div>
            <div>
              <AlertDialogTitle className="text-xl sm:text-2xl font-semibold text-white tracking-tight">
                Choose your shop
              </AlertDialogTitle>
              <p className="mt-1 text-sm sm:text-base text-gray-300">
                Select a location below to browse activities and start your booking
              </p>
            </div>
          </div>
        </AlertDialogHeader>
        <div className="px-4 py-5 sm:px-8 sm:py-6 overflow-y-auto overflow-x-hidden min-h-0 max-h-[calc(95vh-6rem)]">
          <p className="mb-4 text-xs sm:text-sm text-gray-400 uppercase tracking-wider">
            Available locations
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
            {SHOPS.map((shop) => (
              <button
                key={shop.id}
                type="button"
                onClick={() => handleShopSelect(shop)}
                className="group text-left relative   sm:h-32 lg:h-60  w-full rounded-xl sm:rounded-2xl overflow-hidden bg-cover bg-center transition-all duration-300 ease-out hover:scale-[1.02] hover:shadow-lg hover:shadow-black/30"
                style={{ backgroundImage: `url(${shop.image})` }}
              >
                <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/70 to-black/20" aria-hidden />
                <div className="relative z-10 flex flex-col flex-1 min-h-0 justify-end p-3 sm:p-5">
                  <div className="flex flex-wrap gap-1.5 sm:gap-2 mb-2">
                    {shop.tags.map((tag, i) => (
                      <span
                        key={i}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] sm:text-xs font-medium bg-black/40 text-white backdrop-blur-sm"
                      >
                        {tag.icon === "star" && <Star className="w-3 h-3 fill-current shrink-0" />}
                        {tag.icon === "pin" && <MapPin className="w-3 h-3 shrink-0" />}
                        {tag.label}
                      </span>
                    ))}
                  </div>
                  <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white leading-tight tracking-tight drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
                    {shop.title}
                  </h3>
                  <p className="text-sm sm:text-base text-gray-100 mt-1.5 line-clamp-2 leading-relaxed drop-shadow-[0_1px_2px_rgba(0,0,0,0.6)]">
                    {shop.description}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
}
