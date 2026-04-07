import { cache } from "react";
import { fetchEngineCompanyConfig } from "@/lib/api/bookingEngineUrlHttp";
import {
  companyCodeFromEngine,
  getCompanyConfigForEngine,
} from "@/lib/company-config";

/** One booking-engine fetch + derived static config per request (shared across layout + metadata + pages). */
export const loadCompanyFromEngine = cache(async () => {
  const engine = await fetchEngineCompanyConfig();
  return {
    engine,
    config: getCompanyConfigForEngine(engine),
    codeName: companyCodeFromEngine(engine),
  };
});
