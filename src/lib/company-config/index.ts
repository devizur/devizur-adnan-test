import { HomeConfig } from "../../app/home-content-config";
import { ServicesConfig } from "../../app/services/services-content-config";
import { MenuConfig } from "../../app/menu/menu-content-config";
import { ContactConfig } from "../../app/contact/contact-content-config";
import { FooterConfig } from "../../app/footer-content-config";

export interface CompanyConfig {
  name: string;
  logo: string;
  theme: {
    "primary-1": string;
    "primary-1-hover": string;
    "primary-2": string;
    "secondary-1": string;
    "secondary-2": string;
    "secondary-3": string;
    primary: string;
    background: string;
    fontFamily: string;
    fontUrl?: string;
    radius: string;
  };
  content: {
    home: HomeConfig;
    services: ServicesConfig;
    navContent: NavContactConfig;
    menu: MenuConfig;
    contact: ContactConfig;
    footer: FooterConfig;
  };

  navItems: Array<{
    label: string;
    href: string;
  }>;
}

import devizur from "../../config/companies/devizur.json";
import companyOne from "../../config/companies/company-one.json";
import companyTwo from "../../config/companies/company-two.json";
import { NavContactConfig } from "@/components/navbar-content-config";
import type { CompanyConfigResponse } from "@/lib/api/bookingEngineUrlHttp";

export const companies: Record<string, CompanyConfig> = {
  devizur: devizur as CompanyConfig,
  "company-one": companyOne as CompanyConfig,
  "company-two": companyTwo as CompanyConfig,
  "urban-bite": companyTwo as CompanyConfig,
};

export function isValidCompany(
  key: string | undefined
): key is keyof typeof companies {
  return !!key && key in companies;
}

function resolveRegistryKey(
  codeName: string | null | undefined
): keyof typeof companies | undefined {
  const raw = codeName?.trim();
  if (!raw) return undefined;
  if (raw in companies) return raw as keyof typeof companies;
  const lower = raw.toLowerCase();
  if (lower in companies) return lower as keyof typeof companies;
  return undefined;
}

/** Static theme/content from booking-engine `codeName` (falls back to devizur if unknown). */
export function getCompanyConfigForEngine(
  engine: CompanyConfigResponse | null | undefined
): CompanyConfig {
  const key = resolveRegistryKey(engine?.codeName);
  if (key) return companies[key];
  return companies.devizur;
}

/** Resolved registry key when API `codeName` matches a static config; otherwise undefined (invalid host / unknown tenant). */
export function companyCodeFromEngine(
  engine: CompanyConfigResponse | null | undefined
): string | undefined {
  const key = resolveRegistryKey(engine?.codeName);
  return key ? String(key) : undefined;
}
