import React from "react";
import { FaStar } from "react-icons/fa";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Package } from "@/lib/api/types";
import { useCart } from "@/contexts/CartContext";
import { BookingDialog } from "@/components/ui/booking-dialog";

interface ProductCardProps {
  item: Package;
  showTimeSlots?: boolean;
}

const ProductCard: React.FC<ProductCardProps> = ({ item, showTimeSlots = false }) => {
    const { packageItems } = useCart();
    const isInCart = packageItems.some((i) => i.pkg.id === item.id);

    return (
    <Card className="p-2  bg-secondary-2 border border-transparent hover:border transition-transform duration-900 group">
      <div className="relative h-48 rounded-[10px] overflow-hidden">
        <img
          src={item.image}
          alt={item.title}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        {item.discount && (
          <div className="absolute top-0 right-0 bg-primary-1 text-black px-3 py-1.5 sm:px-5 sm:py-2.5 rounded-bl-[12px] sm:rounded-bl-[16px] text-[10px] sm:text-xs font-black">
            {item.discount}
          </div>
        )}
        {item.rating && (
          <div className="absolute bottom-1.5 left-1.5 bg-primary-1 text-black px-2 py-1 sm:px-2.5 sm:py-1.5 rounded-l-[12px] sm:rounded-l-[15px] rounded-tr-[12px] sm:rounded-tr-[16px] text-[10px] sm:text-xs">
            <FaStar className="inline w-2.5 h-2.5 sm:w-3 sm:h-3 mr-0.5 sm:mr-1" />
            {item.rating}
          </div>
        )}
      </div>

      <CardContent className="px-1.5 pb-2">
        <div className="flex justify-between items-start">
          <h3 className="text-xs sm:text-[14px] font-bold text-primary tracking-tight leading-tight min-w-0">
            {item.title}
          </h3>
          <div className="text-right shrink-0">
            <div className="text-primary-1 text-base sm:text-[18px] font-bold">
              {item.price}
            </div>
          </div>
        </div>

        <div className="flex justify-between items-center mb-2 sm:mb-4">
          <span className="text-gray-500 text-[10px] sm:text-xs font-medium">
            Duration: {item.duration}
          </span>
          <span className="text-gray-500 text-[9px] sm:text-[10px] font-medium">
            {item.unit}
          </span>
        </div>

        {showTimeSlots && item.timeSlots && item.timeSlots.length > 0 && (
          <div className="flex items-center gap-1.5 sm:gap-2 mb-2 sm:mb-4">
            {item.timeSlots.slice(0, 3).map((slot, idx) => (
              <Button
                key={idx}
                variant="secondary"
                size="sm"
                className="flex-1 bg-secondary-2 rounded-full text-[10px] sm:text-[12px] text-primary/80 border border-accent transition-all min-h-7 sm:min-h-9"
              >
                {slot}
              </Button>
            ))}
            {item.timeSlots.length > 3 && (
              <div className="w-8 h-7 sm:w-10 sm:h-9 bg-primary/[0.04] border border-white/10 rounded-full text-[9px] sm:text-[11px] font-bold text-gray-400 flex items-center justify-center">
                +{item.timeSlots.length - 3}
              </div>
            )}
          </div>
        )}

        <BookingDialog initialPackage={item}>
          <Button
            className="w-full cursor-pointer py-3 sm:py-4 rounded-[8px] sm:rounded-[10px] text-xs sm:text-[15px] bg-primary-1 hover:bg-primary-1/90 font-bold text-secondary"
          >
            {isInCart ? "Book Now: Selected" : "Book Now"}
          </Button>
        </BookingDialog>
      </CardContent>
    </Card>
  );
};

export default ProductCard;

