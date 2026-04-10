import axios from "axios";
import { env } from "@/config";

const { BookingEngineUrl, ClientUrl } = env();

const baseURL = BookingEngineUrl?.replace(/\/+$/, "") ?? "";

const bookingEngineUrlHttp = axios.create({
  baseURL,
  // Avoid Node proxy parser (`url.parse`) deprecation warnings.
  proxy: false,
});

export type CompanyConfigResponse = {
  id: number;
  name: string;
  codeName: string;
};

/** Full company record from booking engine (by host). */
export async function fetchEngineCompanyConfig(): Promise<CompanyConfigResponse | null> {
  try {
    const hostAddress = ClientUrl ? new URL(ClientUrl).host : "";

    const response = await bookingEngineUrlHttp.get<CompanyConfigResponse>(
      "/api/Company/getCompanyConfigByHost",
      { params: { hostAddress } }
    );
    return response.data ?? null;
  } catch {
    return null;
  }
}

export async function fetchEngineCompanyData(): Promise<string | null> {
  const cfg = await fetchEngineCompanyConfig();
  return cfg?.codeName ?? null;
}

export default bookingEngineUrlHttp;