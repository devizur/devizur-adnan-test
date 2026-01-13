import { getBrandConfig } from "@/lib/brand-config";
import { Button } from "@/components/ui/button";

export default function Home() {
  const config = getBrandConfig();

  return (
    <div className="flex flex-col items-center justify-center p-8 md:p-24">
      <section className="flex flex-col items-center gap-8 max-w-4xl text-center">
        <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-primary/10 text-primary mb-4">
          Now Booking for 2026
        </div>

        <h1 className="text-4xl font-extrabold tracking-tight lg:text-7xl">
          {config.content.heroTitle}
        </h1>

        <p className="text-xl text-muted-foreground max-w-[700px] leading-relaxed">
          {config.content.heroSubtitle}
        </p>

        <div className="flex flex-wrap items-center justify-center gap-4">
          <Button size="lg" className="px-8 py-6 text-lg rounded-[var(--radius)]">
            Book Your Stay
          </Button>
          <Button size="lg" variant="outline" className="px-8 py-6 text-lg rounded-[var(--radius)]">
            View Gallery
          </Button>
        </div>

        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 w-full">
          <div className="p-6 border rounded-[var(--radius)] bg-card text-left space-y-2">
            <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center mb-4">
              <div className="w-4 h-4 bg-accent rounded-full" />
            </div>
            <h3 className="font-bold">Premium Suites</h3>
            <p className="text-sm text-muted-foreground">Handpicked luxury for your comfort and style.</p>
          </div>
          <div className="p-6 border rounded-[var(--radius)] bg-card text-left space-y-2">
            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center mb-4">
              <div className="w-4 h-4 bg-primary rounded-full" />
            </div>
            <h3 className="font-bold">Central Location</h3>
            <p className="text-sm text-muted-foreground">Right in the heart of everything you love.</p>
          </div>
          <div className="p-6 border rounded-[var(--radius)] bg-card text-left space-y-2">
            <div className="w-10 h-10 rounded-full bg-secondary/80 flex items-center justify-center mb-4">
              <div className="w-4 h-4 bg-secondary-foreground rounded-full" />
            </div>
            <h3 className="font-bold">World-class Service</h3>
            <p className="text-sm text-muted-foreground">Dedicated team available 24/7 for your needs.</p>
          </div>
        </div>

        <div className="mt-20 p-8 border rounded-[var(--radius)] bg-primary/5 w-full text-left">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h2 className="text-2xl font-bold">System Status</h2>
              <p className="text-muted-foreground">Active Configuration: <span className="font-mono text-primary">{config.name}</span></p>
            </div>
            <div className="px-4 py-2 bg-background border rounded-md font-mono text-sm leading-none flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              NEXT_PUBLIC_BRAND: {process.env.NEXT_PUBLIC_BRAND || "brand-one"}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
