"use client";

import { createContext, useContext } from "react";
import type { CompanyConfigResponse } from "@/lib/api/bookingEngineUrlHttp";
import { resolvedCompanyDisplayName } from "@/lib/company-display-name";
import { useStaticCompanyConfig } from "@/contexts/StaticCompanyConfigContext";

const EngineCompanyContext = createContext<CompanyConfigResponse | null>(null);

export function EngineCompanyProvider({
  value,
  children,
}: {
  value: CompanyConfigResponse | null;
  children: React.ReactNode;
}) {
  return (
    <EngineCompanyContext.Provider value={value}>
      {children}
    </EngineCompanyContext.Provider>
  );
}

/** Booking-engine company for the current host (id, name, codeName). */
export function useEngineCompany(): CompanyConfigResponse | null {
  return useContext(EngineCompanyContext);
}

/** Display name: API `name` when present, else static config `name`. */
export function useResolvedCompanyDisplayName(): string {
  const engine = useEngineCompany();
  const staticConfig = useStaticCompanyConfig();
  return resolvedCompanyDisplayName(staticConfig, engine);
}
