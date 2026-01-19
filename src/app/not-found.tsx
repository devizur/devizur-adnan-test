import Link from "next/link";
import { getBrandConfig } from "@/lib/brand-config";

export default function NotFound() {
  const config = getBrandConfig();
  const { home } = config.content;

  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <div className="max-w-xl text-center space-y-6">
        <p className="text-sm tracking-[0.25em] uppercase text-primary-1">
          404 — Not Found
        </p>
        <h1 className="text-3xl md:text-4xl font-semibold text-white">
          {config.name} — Page not found
        </h1>
        <p className="text-sm md:text-base text-gray-300">
          {home.heroSubtitle}
        </p>

        <div className="flex items-center justify-center gap-4 pt-4">
          <Link
            href="/"
            className="px-6 py-2 rounded-full bg-primary-1 text-black text-sm font-semibold hover:bg-primary-2 transition-colors"
          >
            Back to Home
          </Link>
          <Link
            href="/contact"
            className="px-6 py-2 rounded-full border border-primary-1 text-primary-1 text-sm font-semibold hover:bg-primary-1/10 transition-colors"
          >
            Contact {config.name}
          </Link>
        </div>
      </div>
    </main>
  );
}

