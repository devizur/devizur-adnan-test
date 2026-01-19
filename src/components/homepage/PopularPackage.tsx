
import React from 'react';
import ProductCard, { ProductItem } from "@/components/ui/reused/ProductCard";

export interface Package extends ProductItem {
    id: number;
    category: string;
}

export const popularPackagesData: Package[] = [
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
    },
    {
        id: 7,
        title: "City Tour & Street Food Crawl",
        category: "Food & Activity Combo",
        price: "$160",
        unit: "per person",
        rating: 4.8,
        image: "https://images.unsplash.com/photo-1489515217757-5fd1be406fef?auto=format&fit=crop&q=80&w=800",
        duration: "7 Hours",
        discount: "15% OFF",
        timeSlots: ["Afternoon", "Evening"]
    },
    {
        id: 8,
        title: "Theme Park Entry & Dinner Buffet",
        category: "Food & Activity Combo",
        price: "$250",
        unit: "per person",
        rating: 5.0,
        image: "https://images.unsplash.com/photo-1508261306211-45a1c5c2a5c5?auto=format&fit=crop&q=80&w=800",
        duration: "Full Day",
        discount: "22% OFF",
        timeSlots: ["All Day"]
    },
    {
        id: 9,
        title: "Spa Retreat & Healthy Brunch",
        category: "Wellness & Food",
        price: "$210",
        unit: "per person",
        rating: 4.9,
        image: "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?auto=format&fit=crop&q=80&w=800",
        duration: "5 Hours",
        discount: "18% OFF",
        timeSlots: ["Morning", "Afternoon"]
    },
    {
        id: 10,
        title: "Mountain Cabin Stay & BBQ Night",
        category: "Stay & Food",
        price: "$320",
        unit: "per person",
        rating: 4.8,
        image: "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&q=80&w=800",
        duration: "Overnight",
        discount: "20% OFF",
        timeSlots: ["All Day"]
    },
    {
        id: 11,
        title: "Cooking Class & Wine Tasting",
        category: "Experience & Food",
        price: "$185",
        unit: "per person",
        rating: 4.9,
        image: "https://images.unsplash.com/photo-1544145945-f90425340c7e?auto=format&fit=crop&q=80&w=800",
        duration: "4 Hours",
        discount: "10% OFF",
        timeSlots: ["Afternoon", "Evening"]
    },
    {
        id: 12,
        title: "Camping, Bonfire & Grill Night",
        category: "Adventure & Food",
        price: "$275",
        unit: "per person",
        rating: 4.7,
        image: "https://images.unsplash.com/photo-1504215680853-026ed2a45def?auto=format&fit=crop&q=80&w=800",
        duration: "Overnight",
        discount: "25% OFF",
        timeSlots: ["Evening", "Night"]
    }
];

interface PopularPackageProps {
    limit?: number;
    searchTerm?: string;
}

const PopularPackage: React.FC<PopularPackageProps> = ({ limit, searchTerm }) => {
    const normalized = searchTerm?.toLowerCase().trim() || "";

    const filtered = normalized
        ? popularPackagesData.filter(
              (pkg) =>
                  pkg.title.toLowerCase().includes(normalized) ||
                  pkg.category.toLowerCase().includes(normalized)
          )
        : popularPackagesData;

    const itemsToShow =
        normalized || !limit ? filtered : filtered.slice(0, limit);

    return (
        <section className="container mx-auto px-6  pb-20">
            {!normalized && (
                <div className="flex items-center justify-between mb-7">
                    <h2 className="text-2xl font-bold tracking-tight text-primary">Popular Packages</h2>
                </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {itemsToShow.map((pkg) => (
                    <ProductCard key={pkg.id} item={pkg} />
                ))}
            </div>


            {!normalized && (
                <div className="flex py-10 justify-center">
                    <button className="hidden md:block px-16 py-3 border  bg-primary-1/10 border-primary-1 text-primary-1 text-base font-semibold rounded-sm hover:bg-primary-1 hover:text-black transition-all duration-300 cursor-pointer">
                        View All Foods
                    </button>
                </div>
            )}
        </section>
    );
};

export default PopularPackage;