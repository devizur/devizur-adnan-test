import { brands, isValidBrand } from "@/lib/brand-config";
import { redirect } from "next/navigation";

export default function BrandsPage() {
    if (isValidBrand(process.env.NEXT_PUBLIC_BRAND)) {
        redirect("/");
    }

    const uniqueBrands = Object.entries(brands).filter(([key]) => key !== "urban-bite");

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-950 to-black flex items-center justify-center p-6">
            <div className="w-full max-w-7xl space-y-12">
                <div className="text-center space-y-3">
                    <h1 className="text-5xl font-bold text-white">Choose Your Brand</h1>
                    <p className="text-gray-400">Select a brand to continue</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {uniqueBrands.map(([key, config]) => (
                        <div
                            key={key}
                            className="group relative p-6 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 hover:border-white/20 hover:bg-white/10 transition-all duration-300 cursor-pointer"
                        >
                            <div className="flex items-center gap-3 mb-4">
                                <div
                                    className="w-12 h-12 rounded-xl flex items-center justify-center text-xl font-bold"
                                    style={{ backgroundColor: config.theme["primary-1"] }}
                                >
                                    {config.name.charAt(0)}
                                </div>
                                <h2 className="text-lg font-semibold text-white">{config.name}</h2>
                            </div>

                            <p className="text-sm text-gray-400 mb-4">{config.content.home.heroSubtitle}</p>

                            <div className="pt-4 border-t border-white/10">
                                <code className="text-xs text-gray-500 font-mono">
                                    NEXT_PUBLIC_BRAND={key}
                                </code>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="text-center p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
                    <p className="text-sm text-red-400">
                        ⚠️ Brand configuration missing in <code className="px-2 py-1 bg-black/30 rounded">.env.local</code>
                    </p>
                </div>
            </div>
        </div>
    );
}
