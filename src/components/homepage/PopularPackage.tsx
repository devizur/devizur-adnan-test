
import React from 'react';
 
import { FaStar } from "react-icons/fa";
import { Button } from "@/components/ui/button"
import {
    Card,
    CardContent,
    
} from "@/components/ui/card"


interface Package {
    id: number;
    title: string;
    category: string;
    price: string;
    unit: string;
    rating: number;
    image: string;
    duration: string;
    discount?: string;
    timeSlots: string[];
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
                    <Card key={pkg.id} className="p-2 hover:border-primary-1/30 bg-secondary-2 border border-transparent hover:border transition-transform duration-900  group">
                        <div className="relative h-48 rounded-[10px] overflow-hidden    ">
                            <img
                                src={pkg.image}
                                alt={pkg.title}
                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                            />
                            {pkg.discount && (
                                <div className="absolute top-0 right-0 bg-primary-1 text-black px-5 py-2.5 rounded-bl-[16px] text-xs font-black">
                                    {pkg.discount}
                                </div>
                            )}
                            {pkg.rating && (
                                <div className="absolute bottom-1.5 left-1.5 bg-primary-1 text-black px-2.5 py-1.5 rounded-l-[15px]  rounded-tr-[16px] text-xs  ">
                                <FaStar  className="inline w-3 h-3 bg-s " />    {pkg.rating}
                                </div>
                            )}
                        </div>

                        <CardContent className="px-1.5 pb-2  ">
                            <div className="flex justify-between items-start ">
                                <h3 className="text-[14px] font-bold text-primary tracking-tight   leading-tight">
                                    {pkg.title}
                                </h3>
                                <div className="text-right shrink-0">
                                    <div className="text-primary-1 text-[18px] font-bold">{pkg.price}</div>
                                </div>
                            </div>

                            <div className="flex justify-between items-center mb-4">
                                <span className="text-gray-500 text-xs font-medium">Duration: {pkg.duration}</span>
                                <span className="text-gray-500 text-[10px] font-medium">{pkg.unit}</span>
                            </div>
 

                            <Button className="w-full cursor-pointer py-4 rounded-[10px] text-[15px] bg-primary-1 hover:bg-primary-1/90 font-bold text-secondary">
                                Book Now
                            </Button>
                        </CardContent>
                    </Card>
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