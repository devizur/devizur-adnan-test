"use client";

import { getBrandConfig } from "@/lib/brand-config";
import { usePathname, useRouter } from "next/navigation";
import { ShoppingBag } from "lucide-react";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useCart } from "@/contexts/CartContext";
import CartDrawer from "@/components/ui/CartDrawer";
import { useAppSelector } from "@/store/hooks";

export function Navbar() {
    const config = getBrandConfig();
    const pathname = usePathname();
    const router = useRouter();
    const [activeLink, setActiveLink] = useState("Home");
    const [isNotFound, setIsNotFound] = useState(false);
    const [isCartOpen, setIsCartOpen] = useState(false);
    const { navContent } = config.content;
    const { getTotalItems } = useCart();
    const totalItems = getTotalItems();

    // Check if we're on a 404 page
    useEffect(() => {
        const checkNotFound = () => {
            const isNotFoundPage = document.body.getAttribute("data-page") === "not-found";
            setIsNotFound(isNotFoundPage);
        };
        checkNotFound();
        // Check periodically in case the attribute is set after mount
        const interval = setInterval(checkNotFound, 100);
        return () => clearInterval(interval);
    }, []);

    // Sync active link with current path
    useEffect(() => {
        const current = config.navItems.find((item) => item.href === pathname);
        if (current) {
            setActiveLink(current.label);
        }
    }, [pathname, config.navItems]);

    const token = useAppSelector((state) => state.auth?.token ?? null);
    const handleMyBookingsClick = () => {
        if (token) {
            router.push("/my-bookings");
        } else {
            router.push("/sign-in");
        }
    };

    if (pathname === "/brands" || isNotFound) return null;

    return (
        <div className="w-full   flex justify-center">
            <nav className="container mx-auto h-24  md:px-4 flex items-center justify-between z-50 absolute top-0 ">
                {/* Logo */}
                <div className="">
                    {/* Native img + suppressHydrationWarning: browser extensions (e.g. Porda) can inject attributes into the logo img after SSR, causing hydration mismatch */}
                    <img
                        src={navContent.logoPath || config.logo}
                        alt="Logo"
                        width={98}
                        height={32}
                        suppressHydrationWarning
                    />
                </div>

                {/* Navigation Links */}
                <ul className="hidden lg:flex items-center space-x-10">
                    {config.navItems.map((item: { label: string; href: string }) => (
                        <li key={item.href}>
                            <Link href={item.href}>
                                <button
                                    onClick={() => setActiveLink(item.label)}
                                    className={`relative text-[14px] font-medium transition-colors duration-300 cursor-pointer ${
                                        activeLink === item.label
                                            ? "text-primary-1"
                                            : "text-gray-300 hover:text-white"
                                    }`}
                                >
                                    {item.label}
                                    {activeLink === item.label && (
                                        <div className="absolute -bottom-1.5 left-0 right-0 h-[1.5px] bg-primary-1 flex justify-between items-center px-0">
                                            <div className="w-1 h-1 bg-primary-1 rotate-45 -ml-0.5"></div>
                                            <div className="w-1 h-1 bg-primary-1 rotate-45 -mr-0.5"></div>
                                        </div>
                                    )}
                                </button>
                            </Link>
                        </li>
                    ))}
                </ul>

                {/* Action Buttons */}
                <div className="flex items-center space-x-6">
                    <button 
                        onClick={handleMyBookingsClick}
                        className="hidden md:block px-6 py-2 border bg-primary-1/10 border-primary-1 text-primary-1 text-sm font-semibold rounded-full hover:bg-primary-1 hover:text-black transition-all duration-300 cursor-pointer"
                    >
                        {navContent.bookings}
                    </button>
                    <button
                        onClick={() => setIsCartOpen(true)}
                        className="relative cursor-pointer group"
                    >
                        <div className="w-10 h-10 border-2 border-primary-1 rounded-xl flex items-center justify-center">
                            <ShoppingBag className="w-5 h-5 text-primary-1" strokeWidth={2.5} />
                        </div>
                        {totalItems > 0 && (
                            <span className="absolute -top-1.5 -right-1.5 bg-primary-1 text-black text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center border-2 border-[#05080d]">
                                {totalItems}
                            </span>
                        )}
                    </button>
                </div>
            </nav>
            <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
        </div>
    );
}
