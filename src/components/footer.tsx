"use client";
import { getBrandConfig } from "@/lib/brand-config";
import { Separator } from "@/components/ui/separator";
import { usePathname } from "next/navigation";

export function Footer() {
    const config = getBrandConfig();
    const pathname = usePathname();

    if (pathname === "/brands") return null;

    return (
        <footer className="w-full border-t bg-muted/30">
            <div className="container px-4 md:px-8 py-12 mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    <div className="col-span-1 md:col-span-2 space-y-4">
                        <div className="flex items-center gap-2">
                            <div className="w-6 h-6 flex items-center justify-center rounded bg-primary-1 text-primary text-xs font-bold">
                                {config.name.charAt(0)}
                            </div>
                            <span className="text-lg font-bold text-primary">{config.name}</span>
                        </div>
                        <p className="text-sm text-muted-foreground max-w-xs">
                            {config.content.home.heroSubtitle}
                        </p>
                    </div>

                

              
                </div>

                <Separator className="my-8" />

                <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-muted-foreground">
                    <p>{config.content.footer.footerText}</p>
                    <p>Powered by Next.js & Shadcn</p>
                </div>
            </div>
        </footer>
    );
}
