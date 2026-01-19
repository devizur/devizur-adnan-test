"use client";
import { getBrandConfig } from "@/lib/brand-config";
import { usePathname } from "next/navigation";

export function Footer() {
    const config = getBrandConfig();
    const pathname = usePathname();

    if (pathname === "/brands") return null;

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
