import { HomeConfig } from "../../app/home-content-config";
import { ServicesConfig } from "../../app/services/services-content-config";
import { MenuConfig } from "../../app/menu/menu-content-config";
import { ContactConfig } from "../../app/contact/contact-content-config";
import { FooterConfig } from "../../app/footer-content-config";

export interface BrandConfig {
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

import devizur from "../../config/brands/devizur.json";
import brandOne from "../../config/brands/brand-one.json";
import brandTwo from "../../config/brands/brand-two.json";
import { NavContactConfig } from "@/components/navbar-content-config";

// Export brands for the brand list page
export const brands: Record<string, BrandConfig> = {
  "devizur": devizur as BrandConfig,
  "brand-one": brandOne as BrandConfig,
  "brand-two": brandTwo as BrandConfig,
  "urban-bite": brandTwo as BrandConfig, // Alias
};

export function isValidBrand(key: string | undefined): key is keyof typeof brands {
  return !!key && key in brands;
}

export function getBrandConfig(): BrandConfig {
  const brandKey = process.env.NEXT_PUBLIC_BRAND || "";

  if (!isValidBrand(brandKey)) {
    // If we're here, we might want to return a basic default OR let the middleware/layout handle redirect
    // Returning devizur as default to prevent crash, but we will redirect in layout
    return brands["devizur"];
  }

  return brands[brandKey];
}
