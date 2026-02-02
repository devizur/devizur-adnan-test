"use client";

import Link from "next/link";
import { getBrandConfig } from "@/lib/brand-config";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  const config = getBrandConfig();

  // Hide navbar and footer by adding a class to body
  useEffect(() => {
    document.body.setAttribute("data-page", "not-found");
    return () => {
      document.body.removeAttribute("data-page");
    };
  }, []);

  return (
    <main className="fixed inset-0 z-50 min-h-screen w-full overflow-y-auto bg-[#121212] text-white flex items-center justify-center p-4">
      {/* Decorative gradient circles - similar to sign-in page */}
      <div className="pointer-events-none absolute left-[15%] top-[10%] size-40 rounded-full bg-gradient-to-br from-[#d4d428] to-[#9e9e16] shadow-[0_0_40px_rgba(255,255,0,0.3)] opacity-90 blur-sm" />
      <div className="pointer-events-none absolute right-[15%] bottom-[15%] size-32 rounded-full bg-gradient-to-br from-[#333] to-[#000] shadow-[0_0_30px_rgba(0,0,0,0.5)] opacity-80" />
      <div className="pointer-events-none absolute left-[30%] bottom-[20%] size-24 rounded-full bg-gradient-to-br from-[#d4d428] to-[#9e9e16] shadow-[0_0_30px_rgba(255,255,0,0.2)] opacity-60 blur-md" />

      {/* Content */}
      <div className="z-10 max-w-2xl text-center space-y-8">
        {/* 404 Number */}
        <div className="relative">
          <h1 className="text-[120px] md:text-[180px] font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-br from-[#FFEC00] via-[#d4d428] to-[#9e9e16] leading-none">
            404
          </h1>
          <div className="absolute inset-0 blur-3xl opacity-30">
            <h1 className="text-[120px] md:text-[180px] font-bold tracking-tight text-[#FFEC00] leading-none">
              404
            </h1>
          </div>
        </div>

        {/* Title */}
        <div className="space-y-4">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-white">
            Page Not Found.
          </h2>
          <p className="text-lg text-zinc-400 max-w-md mx-auto">
            Oops! The page you&apos;re looking for seems to have wandered off. Let&apos;s get you back on track.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <Link href="/">
            <Button className="w-full sm:w-auto h-12 px-8 rounded-lg bg-[#FFEC00] text-black font-bold hover:bg-[#E6D500] hover:shadow-[0_0_20px_rgba(255,236,0,0.3)] transition-all duration-300">
              Back to Home
            </Button>
          </Link>
          <Link href="/contact">
            <Button
              variant="outline"
              className="w-full sm:w-auto h-12 px-8 rounded-lg border-zinc-700 bg-transparent text-zinc-200 hover:bg-[#1a1a1a] hover:text-white hover:border-[#FFEC00] transition-all duration-300"
            >
              Contact Support
            </Button>
          </Link>
        </div>

        {/* Additional Links */}
        <div className="pt-8 text-sm text-zinc-500">
          <p>
            Or explore{" "}
            <Link href="/packages" className="text-zinc-300 hover:text-[#FFEC00] transition-colors underline underline-offset-4">
              Packages
            </Link>
            ,{" "}
            <Link href="/activities" className="text-zinc-300 hover:text-[#FFEC00] transition-colors underline underline-offset-4">
              Activities
            </Link>
            , or{" "}
            <Link href="/foods" className="text-zinc-300 hover:text-[#FFEC00] transition-colors underline underline-offset-4">
              Foods
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
