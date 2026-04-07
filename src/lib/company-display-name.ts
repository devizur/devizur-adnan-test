import type { CompanyConfigResponse } from "@/lib/api/bookingEngineUrlHttp";
import type { CompanyConfig } from "@/lib/company-config";

/** Prefer booking-engine `name`; fall back to static JSON `name` for the resolved codeName. */
export function resolvedCompanyDisplayName(
  staticConfig: CompanyConfig,
  engineCompany: CompanyConfigResponse | null | undefined
): string {
  const fromApi = engineCompany?.name?.trim();
  if (fromApi) return fromApi;
  return staticConfig.name;
}
