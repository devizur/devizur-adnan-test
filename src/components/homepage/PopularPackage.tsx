
import React from 'react';
import ProductCard, { ProductItem } from "@/components/ui/reused/ProductCard";

interface Package extends ProductItem {
    id: number;
    category: string;
}
const popularPackagesData: Package[] = [
    {
        id: 1,
        title: "Beach Day & Seafood Feast",
        category: "Food & Activity Combo",
        price: "$180",
        unit: "per person",
        rating: 4.9,
        image: "https://images.unsplash.com/photo-1559339352-11d035aa65de?auto=format&fit=crop&q=80&w=800",
        duration: "Full Day",
        discount: "20% OFF",
        timeSlots: ["All Day"]
    },
    {
        id: 2,
        title: "Hiking & Gourmet Lunch",
        category: "Food & Activity Combo",
        price: "$220",
        unit: "per person",
        rating: 5.0,
        image: "https://images.unsplash.com/photo-1545205597-3d9d02c29597?auto=format&fit=crop&q=80&w=800",
        duration: "6 Hours",
        discount: "25% OFF",
        timeSlots: ["Morning", "Afternoon"]
    },
    {
        id: 3,
        title: "Snorkeling & Beach BBQ",
        category: "Food & Activity Combo",
        price: "$195",
        unit: "per person",
        rating: 4.8,
        image: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&q=80&w=800",
        duration: "5 Hours",
        discount: "15% OFF",
        timeSlots: ["Morning"]
    },
    {
        id: 4,
        title: "Sunset Cruise & Fine Dining",
        category: "Food & Activity Combo",
        price: "$165",
        unit: "per person",
        rating: 4.9,
        image: "https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?auto=format&fit=crop&q=80&w=800",
        duration: "4 Hours",
        discount: "18% OFF",
        timeSlots: ["Evening"]
    },
    {
        id: 5,
        title: "Water Sports & Premium Buffet",
        category: "Food & Activity Combo",
        price: "$299",
        unit: "per person",
        rating: 5.0,
        image: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&q=80&w=800",
        duration: "Full Day",
        discount: "30% OFF",
        timeSlots: ["All Day"]
    },
    {
        id: 6,
        title: "Kayaking & Brunch Special",
        category: "Food & Activity Combo",
        price: "$145",
        unit: "per person",
        rating: 4.7,
        image: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&q=80&w=800",
        duration: "3 Hours",
        discount: "12% OFF",
        timeSlots: ["Morning", "Brunch"]
    }
];

const PopularPackage: React.FC = () => {
    return (
        <section className="max-w-7xl mx-auto px-16 pb-20">
            <div className="flex items-center justify-between mb-7">
                <h2 className="text-2xl font-bold tracking-tight text-primary">Popular Packages</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {popularPackagesData.map((pkg) => (
                    <ProductCard key={pkg.id} item={pkg} />
                ))}
            </div>


            <div className="flex py-10 justify-center">

                   <button className="hidden md:block px-16 py-3 border  bg-primary-1/10 border-primary-1 text-primary-1 text-base font-semibold rounded-sm hover:bg-primary-1 hover:text-black transition-all duration-300 cursor-pointer">
                     View All Foods
                    </button>
            </div>
        </section>
    );
};


 
 
export default PopularPackage;