"use client";

import { createContext, useContext } from "react";
import type { CompanyConfig } from "@/lib/company-config";

const StaticCompanyConfigContext = createContext<CompanyConfig | null>(null);

export function StaticCompanyConfigProvider({
  config,
  children,
}: {
  config: CompanyConfig;
  children: React.ReactNode;
}) {
  return (
    <StaticCompanyConfigContext.Provider value={config}>
      {children}
    </StaticCompanyConfigContext.Provider>
  );
}

export function useStaticCompanyConfig(): CompanyConfig {
  const ctx = useContext(StaticCompanyConfigContext);
  if (!ctx) {
    throw new Error("useStaticCompanyConfig must be used within StaticCompanyConfigProvider");
  }
  return ctx;
}
