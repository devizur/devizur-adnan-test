"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { isValidBrand } from "@/lib/brand-config";

export function BrandGuard({ currentBrand }: { currentBrand: string | undefined }) {
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        if (!isValidBrand(currentBrand)) {
            if (pathname !== "/brands") {
                router.push("/brands");
            }
        } else {
            if (pathname === "/brands") {
                router.push("/");
            }
        }
    }, [currentBrand, pathname, router]);

    return null;
}
