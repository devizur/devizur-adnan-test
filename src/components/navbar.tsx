"use client";

import { getBrandConfig } from "@/lib/brand-config";
import { Button } from "@/components/ui/button";
import { usePathname } from "next/navigation";

export function Navbar() {
    const config = getBrandConfig();
    const pathname = usePathname();

    if (pathname === "/brands") return null;

    return (
        <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container flex h-16 items-center justify-between px-4 md:px-8 mx-auto">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 flex items-center justify-center rounded bg-primary-1 text-primary font-bold">
                        {config.name.charAt(0)}
                    </div>
                    <span className="text-xl font-bold tracking-tight text-primary">{config.name}</span>
                </div>

                <div className="hidden md:flex items-center gap-6">
                    {config.navItems.map((item) => (
                        <a
                            key={item.href}
                            href={item.href}
                            className="text-sm font-medium text-primary hover:text-primary-1 transition-colors"
                        >
                            {item.label}
                        </a>
                    ))}
                </div>

                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="sm" className="hidden sm:inline-flex">Login</Button>
                    <Button size="sm">Book Now</Button>
                </div>
            </div>
        </nav>
    );
}
