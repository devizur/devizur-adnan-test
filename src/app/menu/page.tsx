import { getBrandConfig } from "@/lib/brand-config";

export default function MenuPage() {
    const config = getBrandConfig();

    return (
        <div className="container mx-auto px-4 py-16">
            <div className="max-w-3xl mx-auto">
                <h1 className="text-4xl font-bold mb-4 text-center">Our Signature Menu</h1>
                <p className="text-center text-muted-foreground mb-12">Carefully curated dishes from the {config.name} kitchen.</p>

                <div className="space-y-12">
                    <section>
                        <h2 className="text-2xl font-bold border-b-2 border-primary pb-2 mb-6">Starters</h2>
                        <div className="grid gap-6">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h3 className="font-semibold text-lg">Truffle Arancini</h3>
                                    <p className="text-sm text-muted-foreground">Crispy risotto balls with infused truffle oil and parmesan.</p>
                                </div>
                                <span className="font-bold text-primary">$14</span>
                            </div>
                            <div className="flex justify-between items-start">
                                <div>
                                    <h3 className="font-semibold text-lg">Caprese Salad</h3>
                                    <p className="text-sm text-muted-foreground">Fresh mozzarella, tomatoes, and basil with balsamic glaze.</p>
                                </div>
                                <span className="font-bold text-primary">$12</span>
                            </div>
                        </div>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold border-b-2 border-primary pb-2 mb-6">Main Courses</h2>
                        <div className="grid gap-6">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h3 className="font-semibold text-lg">Herb Crust Salmon</h3>
                                    <p className="text-sm text-muted-foreground">Pan-seared salmon with seasonal roasted vegetables.</p>
                                </div>
                                <span className="font-bold text-primary">$28</span>
                            </div>
                            <div className="flex justify-between items-start">
                                <div>
                                    <h3 className="font-semibold text-lg">Signature Wagyu Burger</h3>
                                    <p className="text-sm text-muted-foreground">Premium wagyu beef, aged cheddar, and caramelized onions.</p>
                                </div>
                                <span className="font-bold text-primary">$24</span>
                            </div>
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
}
