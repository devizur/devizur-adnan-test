import { Button } from "@/components/ui/button";
import { getBrandConfig } from "@/lib/brand-config";


export function Hero() {
    const config = getBrandConfig();
    const { home } = config.content;

    return (
        <section className="container mx-auto flex flex-col items-center gap-10 max-w-5xl py-20 text-center">
            <div className="space-y-6">
                <h1 className="text-xl  font-black tracking-tighter leading-none text-primary">
                    {home.heroTitle}
                </h1>

                <p className="text-xl md:text-2xl opacity-90 max-w-2xl mx-auto leading-relaxed text-secondary">
                    {home.heroSubtitle}
                </p>
            </div>





         

            <div className="w-full h-px mt-20 opacity-20 bg-gradient-to-r from-transparent via-primary to-transparent" />
        </section>
    );
}
