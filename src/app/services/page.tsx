import { getBrandConfig } from "@/lib/brand-config";

export default function ServicesPage() {
    const config = getBrandConfig();

    return (
        <div className="container mx-auto px-4 py-16">
            <h1 className="text-4xl font-bold mb-8 text-center">{config.name} Services</h1>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="p-8 border rounded-[var(--radius)] bg-card shadow-sm hover:shadow-md transition-shadow">
                    <h2 className="text-2xl font-semibold mb-4 text-primary">Dine-In</h2>
                    <p className="text-muted-foreground">Experience the ultimate hospitality in our elegantly designed spaces.</p>
                </div>
                <div className="p-8 border rounded-[var(--radius)] bg-card shadow-sm hover:shadow-md transition-shadow">
                    <h2 className="text-2xl font-semibold mb-4 text-primary">Catering</h2>
                    <p className="text-muted-foreground">Bring the flavor of {config.name} to your special events and gatherings.</p>
                </div>
                <div className="p-8 border rounded-[var(--radius)] bg-card shadow-sm hover:shadow-md transition-shadow">
                    <h2 className="text-2xl font-semibold mb-4 text-primary">Delivery</h2>
                    <p className="text-muted-foreground">Order online and enjoy our signature dishes from the comfort of your home.</p>
                </div>
            </div>
        </div>
    );
}
