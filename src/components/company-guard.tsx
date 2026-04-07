"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { isValidCompany } from "@/lib/company-config";

export function CompanyGuard({
  currentCompany,
}: {
  currentCompany: string | undefined;
}) {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isValidCompany(currentCompany)) {
      if (pathname !== "/companies") {
        router.push("/companies");
      }
    } else {
      if (pathname === "/companies") {
        router.push("/");
      }
    }
  }, [currentCompany, pathname, router]);

  return null;
}
