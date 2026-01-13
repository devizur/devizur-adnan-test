import { getBrandConfig } from "@/lib/brand-config";
import { Hero } from "@/components/homepage/hero";
import ColorComponent from "@/components/color/color";

export default function Home() {
  const config = getBrandConfig();
  const { home } = config.content;

  return (
    <div className="flex flex-col items-center justify-center p-8 md:p-24 space-y-24">
      <Hero  />

      <div className="max-w-4xl w-full">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full">
          {home.features.map((feature, index) => (
            <div key={index} className="p-6 border rounded-[var(--radius)] bg-card text-left space-y-2">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-4 bg-${feature.colorType}/20`}>
                <div className={`w-4 h-4 rounded-full bg-${feature.colorType}`} />
              </div>
              <h3 className="font-bold">{feature.title}</h3>
              <p className="text-sm text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </div>

        <ColorComponent/>
      </div>
    </div>
  );
}
