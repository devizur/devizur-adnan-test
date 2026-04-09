"use client";

import { useEffect, useState } from "react";
import { fetchBookingFlowToken } from "@/lib/api/bookingFlowUrlHttp";
import { useCompanyConfig } from "@/lib/api/hooks";
import { EngineCompanyProvider } from "@/contexts/EngineCompanyContext";

export function InitDataProviter({
  children,
}: {
  children: React.ReactNode;
}) {
  const [tokenReady, setTokenReady] = useState(false);
  const { data: engineCompany, isPending: companyPending } = useCompanyConfig();

  useEffect(() => {
    let cancelled = false;

    fetchBookingFlowToken().finally(() => {
      if (!cancelled) setTokenReady(true);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  if (companyPending ) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center space-y-4">
          <div
            className="w-10 h-10 border-2 border-primary border-t-slate-700 rounded-full animate-spin mx-auto"
            aria-hidden
          />
          <p className="text-slate-700  text-sm ">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <EngineCompanyProvider value={engineCompany ?? null}>
      {children}
    </EngineCompanyProvider>
  );
}
