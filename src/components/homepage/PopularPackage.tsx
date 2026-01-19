
import React from 'react';
import PopularCard, { PopularItem } from "./PopularCard";

interface Package extends PopularItem {
    id: number;
    category: string;
}
const popularPackagesData: Package[] = [
    {
        id: 1,
        title: "Cox's Bazar Beach Tour",
        category: "Beach",
        price: "$299",
        unit: "per person",
        rating: 4.5,
        image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&q=80&w=800",
        duration: "3 Days 2 Nights",
        discount: "20% OFF",
        timeSlots: ["Morning", "Afternoon", "Evening"]
    },
    {
        id: 2,
        title: "Sundarbans Adventure",
        category: "Wildlife",
        price: "$450",
        unit: "per person",
        rating: 4.8,
        image: "https://images.unsplash.com/photo-1564760055775-d63b17a55c44?auto=format&fit=crop&q=80&w=800",
        duration: "4 Days 3 Nights",
        timeSlots: ["Full Day"]
    },
    {
        id: 3,
        title: "Sajek Valley Retreat",
        category: "Mountain",
        price: "$380",
        unit: "per person",
        rating: 5.0,
        image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&q=80&w=800",
        duration: "2 Days 1 Night",
        discount: "15% OFF",
        timeSlots: ["Weekend"]
    },
    {
        id: 4,
        title: "Saint Martin Island Escape",
        category: "Island",
        price: "$520",
        unit: "per person",
        rating: 4.7,
        image: "https://images.unsplash.com/photo-1559827260-dc66d52bef19?auto=format&fit=crop&q=80&w=800",
        duration: "3 Days 2 Nights",
        discount: "10% OFF",
        timeSlots: ["Weekend", "Weekday"]
    },
    {
        id: 5,
        title: "Srimangal Tea Garden Tour",
        category: "Nature",
        price: "$320",
        unit: "per person",
        rating: 4.6,
        image: "https://images.unsplash.com/photo-1563789031959-4c02bcb41319?auto=format&fit=crop&q=80&w=800",
        duration: "2 Days 1 Night",
        timeSlots: ["Morning", "Full Day"]
    },
    {
        id: 6,
        title: "Bandarban Hill Tracts",
        category: "Adventure",
        price: "$410",
        unit: "per person",
        rating: 4.9,
        image: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&q=80&w=800",
        duration: "3 Days 2 Nights",
        discount: "25% OFF",
        timeSlots: ["Weekend", "Holiday"]
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
                    <PopularCard key={pkg.id} item={pkg} />
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