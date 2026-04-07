

import { PAGE_CONTENT_CLASS } from "@/lib/page-layout";
import { cn } from "@/lib/utils";
import { productApi } from "@/lib/api/productServices";
import { notFound } from "next/navigation";

type ProductDetailsPageProps = {
    params: Promise<{ id: string }>;
};

export default async function ProductDetailsPage({ params }: ProductDetailsPageProps) {
    const { id } = await params;
    const productId = Number(id);
    if (!Number.isFinite(productId) || productId <= 0) {
        notFound();
    }

    let product: Awaited<ReturnType<typeof productApi.getById>> | null = null;
    try {
        product = await productApi.getById(productId);
    } catch {
        notFound();
    }

    if (!product) notFound();

    return (
        <div className="min-w-0 pt-24 sm:pt-32 pb-16 sm:pb-20 text-primary">

            <div className={cn(PAGE_CONTENT_CLASS, "space-y-8")}>
                <div className="relative overflow-hidden rounded-2xl border border-zinc-800/90 bg-linear-to-br from-[#1c1c1c] via-[#161616] to-[#141414] px-5 py-6 sm:px-7 sm:py-8 shadow-[0_0_0_1px_rgba(255,255,255,0.03)_inset]">
                    <div
                        className="pointer-events-none absolute inset-y-0 left-0 w-1 bg-linear-to-b from-primary-1 via-primary-1/70 to-primary-1/25"
                        aria-hidden
                    />
                    <div className="relative space-y-4 pl-4 sm:pl-5">
                        <div className="flex flex-wrap items-center gap-3">
                            <div
                                className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-1/12 ring-1 ring-primary-1/25 shadow-[0_0_24px_-4px_rgba(250,204,21,0.25)]"
                                aria-hidden
                            >

                            </div>
                            <div className="flex min-w-0 flex-col gap-0.5">
                                <p className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-[0.22em] text-primary-1/95">
                                    Product details
                                </p>
                                <p className="text-xs font-medium tracking-wide text-zinc-500"></p>
                            </div>
                        </div>


                        <div className="w-full flex gap-6">

                            <div className="w-1/2 bg-gray-800 h-96  flex items-center justify-center rounded-lg overflow-hidden">  
                            
                            <img src="https://vueroid.com/wp-content/uploads/2025/09/main_product.png" alt="" />
                            </div>
                            <div className="space-y-2.5">
                                <h1 className="text-3xl sm:text-[2.125rem] font-bold text-primary tracking-tight leading-[1.15]">
                                    {product.productName}
                                </h1>

                                <p className="text-zinc-300 text-xs leading-relaxed max-w-2xl">
                                    Type:      {product?.productType || "No description available."}
                                </p>


                               

                            </div>

                        </div>
                        <p
                            className="text-zinc-300 text-sm sm:text-[15px] leading-relaxed max-w-2xl"
                            dangerouslySetInnerHTML={{
                                __html: product?.productDescription || "",
                            }}
                        />



                    </div>
                </div>

            </div>










            <div className="mt-[800px]">
                <section className="rounded-2xl border border-border bg-card p-6 sm:p-8">
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary/80">
                        Product Details
                    </p>
                    <h1 className="mt-3 text-2xl font-semibold text-foreground sm:text-3xl">
                        {product.productName}
                    </h1>
                    <p className="mt-2 text-sm text-muted-foreground sm:text-base">

                    </p>
                </section>

                <section className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div className="rounded-2xl border border-border bg-card p-5">
                        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                            Basic Information
                        </h2>
                        <div className="mt-4 space-y-2 text-sm text-foreground">
                            <p><span className="text-muted-foreground">Product ID:</span> {product.productId}</p>
                            <p><span className="text-muted-foreground">Code:</span> {product.productCode || "-"}</p>
                            <p><span className="text-muted-foreground">Type:</span> {product.productType || "-"}</p>
                            <p><span className="text-muted-foreground">Category:</span> {product.categoryName || "-"}</p>
                            <p><span className="text-muted-foreground">Subcategory:</span> {product.subCategoryName || "-"}</p>
                        </div>
                    </div>

                    <div className="rounded-2xl border border-border bg-card p-5">
                        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                            Product Status
                        </h2>
                        <div className="mt-4 flex flex-wrap gap-2">
                            {[
                                ["Active", product.isActive],
                                ["Available Online", product.availableOnline],
                                ["Booking Required", product.isBookingRequired],
                                ["Saleable", product.isSaleable],
                                ["Combo Product", product.isComboProduct],
                                ["Customization", product.isForCustomization],
                            ].map(([label, enabled]) => (
                                <span
                                    key={String(label)}
                                    className={cn(
                                        "rounded-full border px-3 py-1 text-xs font-medium",
                                        enabled
                                            ? "border-primary/30 bg-primary/10 text-foreground"
                                            : "border-border bg-muted/40 text-muted-foreground"
                                    )}
                                >
                                    {label}: {enabled ? "Yes" : "No"}
                                </span>
                            ))}
                        </div>
                    </div>
                </section>

                <section className="rounded-2xl border border-border bg-card p-5 sm:p-6">
                    <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                        Attribute Combinations
                    </h2>
                    {product.productAttributeCombinations?.length ? (
                        <div className="mt-4 space-y-3">
                            {product.productAttributeCombinations.map((combo) => (
                                <div
                                    key={combo.productAttributeCombinationId}
                                    className="rounded-xl border border-border bg-background/60 p-4"
                                >
                                    <p className="text-sm font-semibold text-foreground">{combo.attributeCombinationName}</p>
                                    <p className="mt-1 text-xs text-muted-foreground">
                                        Option IDs: {combo.attributeCombinationSet.join(", ")}
                                    </p>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="mt-4 text-sm text-muted-foreground">No attribute combinations found.</p>
                    )}
                </section>
            </div>
        </div>
    );
}







