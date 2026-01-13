export interface BrandConfig {
  name: string;
  logo: string;
  theme: {
    primary: string;
    secondary: string;
    accent: string;
    radius: string;
  };
  content: {
    home: {
      heroTitle: string;
      heroSubtitle: string;
      features: Array<{ title: string; description: string; colorType: "accent" | "primary" | "secondary" }>;
    };
    services: {
      title: string;
      items: Array<{ title: string; description: string }>;
    };
    menu: {
      title: string;
      subtitle: string;
      categories: Array<{
        name: string;
        items: Array<{ name: string; description: string; price: string }>;
      }>;
    };
    contact: {
      title: string;
      subtitle: string;
      location: string;
      hours: { week: string; weekend: string };
    };
    footerText: string;
  };
  navItems: Array<{
    label: string;
    href: string;
  }>;
}

import devizur from "../../config/brands/devizur.json";
import brandOne from "../../config/brands/brand-one.json";
import brandTwo from "../../config/brands/brand-two.json";

const brands: Record<string, BrandConfig> = {
  "devizur": devizur as BrandConfig,
  "brand-one": brandOne as BrandConfig,
  "brand-two": brandTwo as BrandConfig,
  "urban-bite": brandTwo as BrandConfig, // Alias
};

export function getBrandConfig(): BrandConfig {
  const brandKey = process.env.NEXT_PUBLIC_BRAND || "devizur";
  const config = brands[brandKey];

  if (!config) {
    console.warn(`Brand configuration for "${brandKey}" not found. Falling back to default.`);
    return brands["devizur"];
  }

  return config;
}
