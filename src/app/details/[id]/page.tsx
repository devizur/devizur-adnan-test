import { PAGE_CONTENT_CLASS } from "@/lib/page-layout";
import { cn } from "@/lib/utils";
import { productApi } from "@/lib/api/productServices";
import { notFound } from "next/navigation";
import { BookingDialog } from "@/components/ui/booking-dialog";
import { Button } from "@/components/ui/button";

type ProductDetailsPageProps = {
  params: Promise<{ id: string }>;
};

export default async function ProductDetailsPage({ params }: ProductDetailsPageProps) {
  const { id } = await params;
  const productId = Number(id);
  if (!Number.isFinite(productId) || productId <= 0) notFound();

  let product: Awaited<ReturnType<typeof productApi.getById>> | null = null;
  try {
    product = await productApi.getById(productId);
  } catch {
    notFound();
  }
  if (!product) notFound();

  const firstNonEmpty = (...urls: Array<string | null | undefined>) => {
    for (const u of urls) {
      const s = u?.trim();
      if (s) return s;
    }
    return null;
  };

  const imageUrl: string =
    firstNonEmpty(
      product.thumbnailBigImageUrl,
      product.thumbnailShortImageUrl,
      product.thumbnailBigImage,
      product.thumbnailShortImage
    ) ?? "https://cdn.pixabay.com/photo/2023/03/20/15/37/postcards-7865294_1280.jpg";

  return (
    <div className="min-w-0 pb-16 pt-24 text-primary sm:pb-20 sm:pt-32">
      <div className={cn(PAGE_CONTENT_CLASS, "space-y-8")}>
        <div className="relative overflow-hidden rounded-2xl border border-zinc-800/90 bg-linear-to-br from-[#1c1c1c] via-[#161616] to-[#141414] px-5 py-6 shadow-[0_0_0_1px_rgba(255,255,255,0.03)_inset] sm:px-7 sm:py-8">
          <div
            className="pointer-events-none absolute inset-y-0 left-0 w-1 bg-linear-to-b from-primary-1 via-primary-1/70 to-primary-1/25"
            aria-hidden
          />
          <div className="relative space-y-6 pl-4 sm:pl-5">
            <div className="flex flex-wrap items-center gap-3">
              {/* <div
                className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-1/12 ring-1 ring-primary-1/25 shadow-[0_0_24px_-4px_rgba(250,204,21,0.25)]"
                aria-hidden
              /> */}
              <div className="flex min-w-0 flex-col gap-0.5">
                <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-primary-1/95 sm:text-[11px]">
                  Product details
                </p>
                <p className="text-xs font-medium tracking-wide text-zinc-500">
                  Clean overview with booking-ready product metadata
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
              <div className="relative flex min-h-72 items-center justify-center overflow-hidden rounded-2xl border border-zinc-700/70 bg-zinc-900/70 sm:min-h-88">
                <img src={imageUrl} alt={product.productName} className="h-full w-full object-cover" />
                <div
                  className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2 bg-linear-to-t from-black/65 to-transparent"
                  aria-hidden
                />
                <div className="absolute bottom-3 left-3 rounded-lg border border-primary-1/25 bg-black/40 px-2.5 py-1 text-[11px] font-medium text-primary-1 backdrop-blur-xs">
                  #{product.productCode || `ID-${product.productId}`}
                </div>
              </div>

              <div className="space-y-4">
                <h1 className="text-3xl font-bold leading-[1.15] tracking-tight text-primary sm:text-[2.125rem]">
                  {product.productName}
                </h1>
                {product.productShortName?.trim() ? (
                  <p className="text-sm font-medium text-zinc-400">{product.productShortName.trim()}</p>
                ) : null}
                <div className="flex flex-wrap gap-2">
                  {[
                    product.productType || "General",
                    product.categoryName || "Uncategorized",
                    product.subCategoryName || "No subcategory",
                  ].map((label) => (
                    <span
                      key={label}
                      className="rounded-full border border-zinc-700/80 bg-zinc-900/70 px-3 py-1 text-xs font-medium text-zinc-300"
                    >
                      {label}
                    </span>
                  ))}
                </div>

                <div className="rounded-xl border border-zinc-700/70 bg-[#121212]/70 p-4">
                  <h2 className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500">
                    Basic Information
                  </h2>
                  <div className="mt-3 grid grid-cols-1 gap-2 text-sm text-zinc-300 sm:grid-cols-2">
                    <p>
                      <span className="text-zinc-500">Product ID:</span> {product.productId}
                    </p>
                    <p>
                      <span className="text-zinc-500">Code:</span> {product.productCode || "-"}
                    </p>
                    <p>
                      <span className="text-zinc-500">Category:</span> {product.categoryName || "-"}
                    </p>
                    <p>
                      <span className="text-zinc-500">Subcategory:</span> {product.subCategoryName || "-"}
                    </p>
                  </div>
                </div>

                <div className="rounded-xl border border-primary-1/20 bg-primary-1/8 p-3 text-sm font-semibold uppercase tracking-wide text-primary-1">
                  Price:{" "}
                  {product.costPrice != null && Number.isFinite(Number(product.costPrice))
                    ? `$${Number(product.costPrice).toFixed(2)}`
                    : "—"}
                </div>
                <BookingDialog>
                  <Button className="w-full cursor-pointer rounded-lg bg-primary-1 py-3 text-sm font-bold text-secondary hover:bg-primary-1/90 sm:w-auto sm:px-8">
                    Book Now
                  </Button>
                </BookingDialog>
              </div>
            </div>

            <section className="rounded-2xl border border-zinc-800/90 bg-[#121212]/80 p-4 sm:p-5">
              <h2 className="text-sm font-semibold uppercase tracking-[0.16em] text-zinc-500">
                Description
              </h2>
              <div
                className="mt-3 max-w-none text-sm leading-relaxed text-zinc-300 sm:text-[15px] [&_li]:mb-1 [&_p]:mb-3 [&_ul]:list-disc [&_ul]:pl-5"
                dangerouslySetInnerHTML={{
                  __html: product.productDescription || "<p>No description available.</p>",
                }}
              />
            </section>

            
          </div>
        </div>
      </div>
    </div>
  );
}
