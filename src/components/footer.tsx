"use client";
import { getBrandConfig } from "@/lib/brand-config";
import { usePathname } from "next/navigation";

export function Footer() {
    const config = getBrandConfig();
    const pathname = usePathname();

    if (pathname === "/brands") return null;

    return (
        <footer className="w-full border-t bg-muted/30">
            <div className="container px-4 md:px-8 py-6 mx-auto">
                <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
                    <p>{config.content.footer.footerText}</p>
                    <p>Powered by Next.js & Shadcn</p>
                </div>
            </div>
        </footer>
    );
}
