import type { Metadata } from "next";
import { Geist, Geist_Mono, Manrope, Inter } from "next/font/google";
import "./globals.css";

import { getBrandConfig } from "@/lib/brand-config";
import ColorComponent from "@/components/color/color";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { BrandGuard } from "@/components/brand-guard";
import { QueryProvider } from "@/components/providers/query-provider";
import { CartProvider } from "@/contexts/CartContext";
import { Toaster } from "@/components/ui/toaster";

export async function generateMetadata(): Promise<Metadata> {
  const config = getBrandConfig();
  return {
    title: config.name,
    description: config.content.home.heroSubtitle,
    icons: {
      icon: config.logo || "/favicon.ico",
    },
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const brandKey = process.env.NEXT_PUBLIC_BRAND;
  const config = getBrandConfig();

  // Determine font-family variable. 
  // We use the exact name from config to support external fonts.
  const activeFontFamily = config.theme.fontFamily ? `'${config.theme.fontFamily}', sans-serif` : "var(--font-geist-sans)";

  return (
    <html lang="en" suppressHydrationWarning style={{
      // @ts-ignore
      "--primary": config.theme["primary"],
      "--primary-1": config.theme["primary-1"],
      "--primary-1-hover": config.theme["primary-1-hover"],
      "--primary-2": config.theme["primary-2"],
      "--secondary": config.theme["secondary-1"],
      "--secondary-2": config.theme["secondary-2"],
      "--accent": config.theme["secondary-3"],
      "--background": config.theme.background,
      "--radius": config.theme.radius,
      "--brand-font": activeFontFamily,
    }}>
      <head>
        {config.theme.fontUrl && (
          <link rel="stylesheet" href={config.theme.fontUrl} />
        )}
      </head>
      <body
        suppressHydrationWarning
        className={`${geistSans.variable} ${geistMono.variable} ${manrope.variable} ${inter.variable} antialiased min-h-screen flex flex-col font-sans`}
      >
        <QueryProvider>
          <CartProvider>
            <BrandGuard currentBrand={brandKey} />
            <Navbar />
            <main className="flex-1">
              {children}
            </main>
            <Footer />
            <ColorComponent />
            <Toaster />
          </CartProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
