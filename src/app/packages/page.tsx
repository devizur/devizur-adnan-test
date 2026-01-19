"use client"
import PopularPackage from "@/components/homepage/PopularPackage";
import { getBrandConfig } from "@/lib/brand-config";
import { Search } from "lucide-react";

const config = getBrandConfig();
const { home } = config.content;

const page = () => {
    return (
        <div>
            <section className="relative pt-32 px-6 overflow-hidden">
                {/* Decorative Glow */}
                <div className="absolute top-25 left-40 -translate-x-1/2 -translate-y-1/2 w-250 h-150 bg-blue-400/25 blur-[150px] rounded-full pointer-events-none z-0"></div>

                <div className="container mx-auto my-15 flex flex-col items-left justify-le space-y-5 z-10 relative">
                    {/* Badge */}
                    <div className="w-full flex justify-left">
                        <div className="flex px-3 py-1 mb-12 bg-primary-1 rounded-full">
                            <span className="text-black text-[11px] font-bold tracking-tight">
                                All-in-one Packages &amp; Combos
                            </span>
                        </div>
                    </div>

                    {/* Main Heading */}
                    <h1 className="text-5xl font-semibold tracking-tighter leading-none text-primary">
                        Book Packages &amp; Combos
                    </h1>

                    {/* Subheading */}
                    <p className="text-primary font-light text-sm opacity-90">
                        Discover curated experiences that bundle food, activities, and more into one seamless booking.
                    </p>

                    {/* Search Bar */}
                    <div className="relative w-full max-w-126.75 group my-8">
                        <input
                            type="text"
                            placeholder="Search packages, combos, tags..."
                            className="w-126.75 h-11 bg-white/5 border border-white/10 rounded-[12px] py-4 pl-6 pr-6 text-white placeholder-gray-500 focus:outline-none focus:border-primary-1/40 focus:bg-white/[0.07] transition-all duration-300"
                        />
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-primary-1 transition-colors cursor-pointer">
                            <Search className="w-5 h-5 opacity-60" />
                        </div>
                    </div>
                </div>

                <PopularPackage />
            </section>
        </div>
    );
};

export default page;

