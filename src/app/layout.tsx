
import type { Metadata } from "next";
import { Geist, Geist_Mono, Manrope, Inter } from "next/font/google";
import "./globals.css";

import { loadCompanyFromEngine } from "@/lib/load-company";
import { resolvedCompanyDisplayName } from "@/lib/company-display-name";
import { StaticCompanyConfigProvider } from "@/contexts/StaticCompanyConfigContext";
import ColorComponent from "@/components/color/color";

import { SpeedInsights } from "@vercel/speed-insights/next";


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
import { CompanyGuard } from "@/components/company-guard";
import { QueryProvider } from "@/components/providers/query-provider";
import { ReduxProvider } from "@/components/providers/redux-provider";
import { InitDataProviter } from "@/components/providers/init-data-proviter";
import { CartProvider } from "@/contexts/CartContext";
import { BookingCartProvider } from "@/contexts/BookingCartContext";
import { ShopDialogProvider } from "@/contexts/ShopDialogContext";
import { Toaster } from "@/components/ui/toaster";
import { WelcomeDialog } from "@/components/ui/welcome-dialog";
import { BackToTopButton } from "@/components/ui/BackToTopButton";

export async function generateMetadata(): Promise<Metadata> {
  const { config, engine } = await loadCompanyFromEngine();
  const displayName = resolvedCompanyDisplayName(config, engine);
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXT_PUBLIC_VERCEL_URL;
  const metadataBase = appUrl ? new URL(appUrl.startsWith("http") ? appUrl : `https://${appUrl}`) : undefined;

  return {
    title: {
      default: `${displayName} ||   ${config.content.home.heroTitle }`,
      template: `%s | ${displayName}`,
    },
    description: config.content.home.heroSubtitle,
    metadataBase,
    openGraph: {
      title: displayName || config.content.home.heroTitle ,
      description: config.content.home.heroSubtitle,
      url: "/",
      siteName: displayName,
      type: "website",
      images: [
        {
          url: config.logo || "/favicon.ico",
          width: 1200,
          height: 630,
          alt: `${displayName} logo`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: config.content.home.heroTitle || displayName,
      description: config.content.home.heroSubtitle,
      images: [config.logo || "/favicon.ico"],
    },
    robots: {
      index: true,
      follow: true,
    },
    icons: {
      icon: config.logo || "/favicon.ico",
    },
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { config, codeName } = await loadCompanyFromEngine();


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
      "--company-font": activeFontFamily,
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
          <StaticCompanyConfigProvider config={config}>
          <ReduxProvider>
            <InitDataProviter>
              <CartProvider>
                <ShopDialogProvider>
                <BookingCartProvider>
                  <CompanyGuard currentCompany={codeName} />
                  <Navbar />
                  <SpeedInsights/>
                  <main className="flex-1">
                    {children}
                  </main>
                  <BackToTopButton />
                  <Footer />
                  <ColorComponent />
                  <WelcomeDialog />
                  <Toaster />
                </BookingCartProvider>
                </ShopDialogProvider>
              </CartProvider>
            </InitDataProviter>
          </ReduxProvider>
          </StaticCompanyConfigProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
