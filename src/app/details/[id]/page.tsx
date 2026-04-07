 import { PAGE_CONTENT_CLASS } from "@/lib/page-layout";
import { cn } from "@/lib/utils";


const page = () => {
    return (
        <div className="min-w-0 pt-24 sm:pt-32 pb-16 sm:pb-20 text-primary">
            <div className={cn(PAGE_CONTENT_CLASS, "space-y-8")}>
                <header className="relative overflow-hidden rounded-2xl border border-zinc-800/90 bg-linear-to-br from-[#1c1c1c] via-[#161616] to-[#141414] px-5 py-6 sm:px-7 sm:py-8 shadow-[0_0_0_1px_rgba(255,255,255,0.03)_inset]">
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
                        <div className="space-y-2.5">
                            <h1 className="text-3xl sm:text-[2.125rem] font-bold text-primary tracking-tight leading-[1.15]">
                                name of the product
                            </h1>
                            <p className="text-zinc-400 text-sm sm:text-[15px] leading-relaxed max-w-2xl">
                                hello world
                            </p>
                        </div>
                    </div>
                </header>

            </div>
        </div>
    );
};

export default page;