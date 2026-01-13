import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

import { getBrandConfig } from "@/lib/brand-config";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";

export async function generateMetadata(): Promise<Metadata> {
  const config = getBrandConfig();
  return {
    title: config.name,
    description: config.content.home.heroSubtitle,
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const config = getBrandConfig();

  return (
    <html lang="en" style={{
      // @ts-ignore
      "--primary": config.theme.primary,
      "--secondary": config.theme.secondary,
      "--accent": config.theme.accent,
      "--radius": config.theme.radius,
    }}>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen flex flex-col`}
      >
        <Navbar />
        <main className="flex-1">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
