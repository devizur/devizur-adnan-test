import { getBrandConfig } from "@/lib/brand-config";

export default function MenuPage() {
    const config = getBrandConfig();
    const { menu } = config.content;

    return (
        <div className="container mx-auto px-4 py-16">
            <div className="max-w-3xl mx-auto">
                <h1 className="text-4xl font-bold mb-4 text-center">{menu.title}</h1>
                <p className="text-center text-muted-foreground mb-12">{menu.subtitle}</p>

                <div className="space-y-12">
                    {menu.categories.map((category, catIndex) => (
                        <section key={catIndex}>
                            <h2 className="text-2xl font-bold border-b-2 border-primary pb-2 mb-6">{category.name}</h2>
                            <div className="grid gap-6">
                                {category.items.map((item, itemIndex) => (
                                    <div key={itemIndex} className="flex justify-between items-start">
                                        <div>
                                            <h3 className="font-semibold text-lg">{item.name}</h3>
                                            <p className="text-sm text-muted-foreground">{item.description}</p>
                                        </div>
                                        <span className="font-bold text-primary">{item.price}</span>
                                    </div>
                                ))}
                            </div>
                        </section>
                    ))}
                </div>
            </div>
        </div>
    );
}
