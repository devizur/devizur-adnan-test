"use client";

import * as React from "react";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Star, MapPin, Store, Search } from "lucide-react";
import { useAppDispatch } from "@/store/hooks";
import { setShopId } from "@/store/shopSlice";

const SELECTED_SHOP_KEY = "welcome-selected-shop";


const SHOPS = [
  {
    id: 1,
    shopId: 1,
    title: "Santorini Villa",
    description: "Luxury villa overlooking the Aegean Sea, offering breathtaking sunset views and a private infinity pool for ultimate relaxation.",
    tags: [{ type: "rating", label: "4.5", icon: "star" }, { type: "stay", label: "3 Night Stay" }],
    image: "https://picsum.photos/seed/santorini/400/280",
  },
  {
    id: 2,
    shopId: 2,
    title: "Swiss Chalet",
    description: "Cozy wooden chalet nestled in the Swiss Alps, offering a warm fireplace, scenic mountain views, and direct access to ski slopes.",
    tags: [{ type: "badge", label: "Guest Favorite", icon: "pin" }, { type: "stay", label: "4 Night Stay" }],
    image: "https://picsum.photos/seed/swiss/400/280",
  },
  {
    id: 3,
    shopId: 3,
    title: "Lakeside Retreat",
    description: "Peaceful retreat by the lake with a private dock, kayaks, and stunning sunrise views.",
    tags: [{ type: "rating", label: "4.8", icon: "star" }, { type: "stay", label: "2 Night Stay" }],
    image: "https://picsum.photos/seed/lakeside/400/280",
  },
  {
    id: 4,
    shopId: 4,
    title: "Urban Loft",
    description: "Modern loft in the heart of the city with rooftop access and skyline views.",
    tags: [{ type: "badge", label: "Trending", icon: "pin" }, { type: "stay", label: "1 Night Stay" }],
    image: "https://picsum.photos/seed/urban/400/280",
  },
  {
    id: 5,
    shopId: 5,
    title: "Garden Cottage",
    description: "Charming cottage with a private garden, perfect for a quiet getaway.",
    tags: [{ type: "rating", label: "4.9", icon: "star" }, { type: "stay", label: "5 Night Stay" }],
    image: "https://picsum.photos/seed/garden/400/280",
  },
];

export function WelcomeDialog() {
  const dispatch = useAppDispatch();
  const [open, setOpen] = React.useState(true);
  const [search, setSearch] = React.useState("");

  // Hydrate shopId from localStorage on mount
  React.useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = localStorage.getItem(SELECTED_SHOP_KEY);
    if (stored) {
      const id = parseInt(stored, 10);
      if (!Number.isNaN(id)) dispatch(setShopId(id));
    }
  }, [dispatch]);

  React.useEffect(() => {
    setOpen(true);
  }, []);

  const handleShopSelect = (shop: (typeof SHOPS)[0]) => {
    setOpen(false);
    dispatch(setShopId(shop.shopId));
    if (typeof window !== "undefined") {
      localStorage.setItem(SELECTED_SHOP_KEY, String(shop.shopId));
    }
  };

  // ✅ filter logic
  const filteredShops = React.useMemo(() => {
    if (!search.trim()) return SHOPS;

    const query = search.toLowerCase();

    return SHOPS.filter((shop) => {
      const titleMatch = shop.title.toLowerCase().includes(query);

      const descriptionMatch = shop.description
        .toLowerCase()
        .includes(query);

      const tagMatch = shop.tags.some((tag) =>
        tag.label.toLowerCase().includes(query)
      );

      return titleMatch || descriptionMatch || tagMatch;
    });
  }, [search]);

  return (
    <AlertDialog
      open={open}
      onOpenChange={(next) => {
        if (!next) return;
        setOpen(next);
      }}
    >
      <AlertDialogContent className="w-[calc(100vw-1rem)] max-w-[calc(100vw-1rem)] sm:min-w-[90%] sm:w-4xl h-[90vh] lg:h-[95vh] bg-secondary-2 backdrop-blur-xl p-0 gap-0 text-white border border-white/10 rounded-2xl sm:rounded-3xl overflow-hidden max-h-[95vh] flex flex-col shadow-2xl">

        {/* Header */}
        <AlertDialogHeader className="px-6 py-5 sm:px-8 sm:py-6 shrink-0 border-b border-white/5">
          <div className="flex items-center gap-3 sm:gap-4 justify-center">
            <div className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-xl bg-primary-1/15 text-primary-1">
              <Store className="h-5 w-5 sm:h-6 sm:w-6" />
            </div>
            <div>
              <AlertDialogTitle className="text-xl sm:text-2xl font-semibold">
                Choose your shop
              </AlertDialogTitle>
              <p className="mt-1 text-sm sm:text-base text-gray-300">
                Select a location below to browse activities
              </p>
            </div>
          </div>
        </AlertDialogHeader>

        {/* Body */}
        <div className="px-4 py-5 sm:px-8 sm:py-6 overflow-y-auto">

          {/* Search input */}
          <div className="relative w-full max-w-md group mb-5  ">
            <input
              type="text"
              placeholder="Search locations..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full h-11 bg-white/5 border border-white/10 rounded-xl py-4 pl-6 pr-10 text-white placeholder-gray-500 focus:outline-none focus:border-primary-1/40"
            />

            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 opacity-60" />
          </div>

          {/* Shops */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">

            {filteredShops.length === 0 && (
              <div className="col-span-full text-center text-gray-400 py-10">
                No locations found
              </div>
            )}

            {filteredShops.map((shop) => (
              <button
                key={shop.id}
                onClick={() => handleShopSelect(shop)}
                className="group text-left relative h-44 lg:h-60  2xl:h-80 w-full rounded-xl overflow-hidden bg-cover bg-center hover:scale-[1.005] cursor-pointer transition-transform"
                style={{ backgroundImage: `url(${shop.image})` }}
              >
                <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/70 to-black/20" />

                <div className="relative z-10 p-4">
                  <div className="flex flex-wrap gap-2 mb-2">
                    {shop.tags.map((tag, i) => (
                      <span
                        key={i}
                        className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs bg-black/40"
                      >
                        {tag.icon === "star" && (
                          <Star className="w-3 h-3 fill-current" />
                        )}
                        {tag.icon === "pin" && (
                          <MapPin className="w-3 h-3" />
                        )}
                        {tag.label}
                      </span>
                    ))}
                  </div>

                  <h3 className="lg:text-3xl text-2xl font-bold">{shop.title}</h3>

                  <p className="text-xs lg:text-sm text-gray-400 line-clamp-2 mt-1">
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