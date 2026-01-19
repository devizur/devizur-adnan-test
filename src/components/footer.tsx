"use client";
import { getBrandConfig } from "@/lib/brand-config";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

export function Footer() {
    const config = getBrandConfig();
    const pathname = usePathname();
    const [isNotFound, setIsNotFound] = useState(false);

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

    if (pathname === "/brands" || isNotFound) return null;

    return (
        <footer className="bg-secondary-2 text-accent py-4">
            <div className="container   mx-auto">
                <div className="flex flex-col  justify-center items-center gap-4 text-sm ">
                    <p>{config.content.footer.footerText}</p>
                   
                </div>
            </div>
        </footer>
    );
}
