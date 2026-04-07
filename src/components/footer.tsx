"use client";
import { useStaticCompanyConfig } from "@/contexts/StaticCompanyConfigContext";
import { PAGE_CONTENT_CLASS } from "@/lib/page-layout";
import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

export function Footer() {
    const config = useStaticCompanyConfig();
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

    if (pathname === "/companies" || isNotFound) return null;

    return (
        <footer className="bg-secondary-2 text-accent py-4">
            <div className={cn(PAGE_CONTENT_CLASS)}>
                <div className="flex flex-col  justify-center items-center gap-4 text-sm ">
                    <p>{config.content.footer.footerText}</p>
                   
                </div>
            </div>
        </footer>
    );
}
