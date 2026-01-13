import { brands, isValidBrand } from "@/lib/brand-config";
import { Button } from "@/components/ui/button";
import { redirect } from "next/navigation";

export default function BrandsPage() {
    // Server-side redirect if brand is already valid
    if (isValidBrand(process.env.NEXT_PUBLIC_BRAND)) {
        redirect("/");
    }
    // Get unique brands (avoiding aliases like urban-bite if they point to the same config)
    const uniqueBrands = Object.entries(brands).filter(([key]) => key !== "urban-bite");

    return (
        <div className="min-h-screen bg-zinc-50 flex flex-col items-center justify-center p-8">
            <div className="max-w-4xl w-full text-center space-y-8">
                <div className="space-y-2">
                    <h1 className="text-4xl font-extrabold tracking-tight text-zinc-900">Available Brands</h1>
                    <p className="text-xl text-zinc-500">Please select a brand to view its configuration.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {uniqueBrands.map(([key, config]) => (
                        <div
                            key={key}
                            className="group relative flex flex-col items-center p-8 bg-white border rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                        >
                            <div
                                className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6 text-2xl font-bold shadow-inner"
                                style={{
                                    backgroundColor: config.theme["primary-1"],
                                    color: config.theme["text-primary-color"]
                                }}
                            >
                                {config.name.charAt(0)}
                            </div>

                            <h2 className="text-2xl font-bold text-zinc-800 mb-2">{config.name}</h2>
                            <p className="text-sm text-zinc-500 mb-6 line-clamp-2">{config.content.home.heroSubtitle}</p>

                            <div className="flex flex-wrap gap-2 justify-center mb-6">
                                <span className="px-2 py-1 bg-zinc-100 text-zinc-600 text-[10px] font-bold uppercase rounded tracking-wider border">
                                    {key}
                                </span>
                            </div>

                            <div className="w-full pt-6 border-t font-mono text-[10px] text-zinc-400">
                                To activate:
                                <code className="block mt-1 p-1 bg-zinc-50 rounded border text-zinc-600 truncate">
                                    NEXT_PUBLIC_BRAND={key}
                                </code>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="p-6 bg-red-50 border border-red-100 rounded-xl text-red-800 text-sm max-w-lg mx-auto">
                    <strong>Missing Configuration:</strong> You were redirected here because your <code>.env.local</code>
                    is either missing <code>NEXT_PUBLIC_BRAND</code> or it contains an invalid brand name.
                </div>
            </div>
        </div>
    );
}
