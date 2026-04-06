import { getBrandConfig } from "@/lib/brand-config";
import { PAGE_CONTENT_CLASS } from "@/lib/page-layout";
import { cn } from "@/lib/utils";

export default function ServicesPage() {
    const config = getBrandConfig();
    const { services } = config.content;

    return (
        <div className={cn(PAGE_CONTENT_CLASS, "py-16")}>
            <h1 className="text-4xl font-bold mb-8 text-center">{services.title}</h1>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {services.items.map((service, index) => (
                    <div key={index} className="p-8 border rounded-[var(--radius)] bg-card shadow-sm hover:shadow-md transition-shadow">
                        <h2 className="text-2xl font-semibold mb-4 text-primary">{service.title}</h2>
                        <p className="text-muted-foreground">{service.description}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}
