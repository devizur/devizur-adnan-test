"use client";

import React from "react";
import { Drawer, DrawerContent, DrawerTitle } from "@/components/ui/drawer";
import { CartDrawerContent } from "@/components/ui/CartDrawerContent";

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

const CartDrawer: React.FC<CartDrawerProps> = ({ isOpen, onClose }) => {
  const [isDesktop, setIsDesktop] = React.useState(false);

  React.useEffect(() => {
    if (typeof window === "undefined") return;

    const mediaQuery = window.matchMedia("(min-width: 768px)");
    setIsDesktop(mediaQuery.matches);

    const handleChange = (event: MediaQueryListEvent) => {
      setIsDesktop(event.matches);
    };

    mediaQuery.addEventListener("change", handleChange);

    return () => {
      mediaQuery.removeEventListener("change", handleChange);
    };
  }, []);

  return (
    <Drawer
      direction={isDesktop ? "right" : "bottom"}
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <DrawerContent className="flex max-h-[90vh] flex-col border-white/10 bg-[#121212] ring-1 ring-white/5 md:h-full md:max-h-none lg:min-w-150">
        <DrawerTitle className="sr-only">Cart</DrawerTitle>
        <CartDrawerContent />
      </DrawerContent>
    </Drawer>
  );
};

export default CartDrawer;
