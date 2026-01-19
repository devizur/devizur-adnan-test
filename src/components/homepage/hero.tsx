"use client"
import { getBrandConfig } from "@/lib/brand-config";
import { Search } from 'lucide-react';
export function Hero() {
    const config = getBrandConfig();
    const { home } = config.content;

    return (
        <>
            <section className="   relative pt-16 pb-40 px-6 overflow-hidden">
                {/* Decorative Glow */}
                <div className="absolute top-15 left-40 -translate-x-1/2 -translate-y-1/2 w-200 h-100 bg-blue-400/20 blur-[150px] rounded-full pointer-events-none z-0"></div>

                <div className=" flex flex-col items-center justify-center space-y-5 mt-5 z-10 relative">

                    {/* Badge */}
                    <div className="  mt-15 px-3 py-1  bg-primary-1 rounded-full">
                        <span className="text-black text-[11px] font-bold tracking-tight">
                            {home.heroTag}
                        </span>
                    </div>

                    {/* Main Heading */}
                    <h1 className="text-4xl font-semibold tracking-tighter leading-none text-primary  ">
                        {home.heroTitle}
                    </h1>

                    {/* Subheading */}
                    <p className="text-primary font-light text-sm  opacity-90    ">
                        {home.heroSubtitle}
                    </p>

                    {/* Search Bar - Icon on the right as per screenshot */}
                    <div className="relative w-full max-w-126.75 group mt-2">
                        <input
                            type="text"
                            placeholder="Search activities, games, tags..."
                            className="w-126.75 h-11 bg-white/5 border border-white/10 rounded-[12px] py-4 pl-6 pr-6 text-white placeholder-gray-500 focus:outline-none focus:border-primary-1/40 focus:bg-white/[0.07] transition-all duration-300"
                        />
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-primary-1 transition-colors cursor-pointer">
                            <Search className="w-5 h-5 opacity-60" />
                        </div>
                    </div>

                </div>



            </section>
        </>
    );
}
