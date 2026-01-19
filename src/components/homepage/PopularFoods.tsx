
import React from 'react';
 
import { FaStar } from "react-icons/fa";
import { Button } from "@/components/ui/button"
import {
    Card,
    CardContent,
    
} from "@/components/ui/card"


interface Food {
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
const foods: Food[] = [
    {
        id: 1,
        title: "Gourmet Beef Burger",
        category: "Burgers",
        price: "$12.99",
        unit: "per item",
        rating: 4.5,
        image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&q=80&w=800",
        duration: "15 mins",
        discount: "$ 3 off",
        timeSlots: ["11:00 AM", "12:30 PM", "02:00 PM"]
    },
    {
        id: 2,
        title: "Authentic Italian Pizza",
        category: "Pizza",
        price: "$18.00",
        unit: "per pizza",
        rating: 4.8,
        image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&q=80&w=800",
        duration: "20 mins",
        timeSlots: ["12:00 PM", "01:30 PM", "07:00 PM"]
    },
    {
        id: 3,
        title: "Fresh Sushi Platter",
        category: "Japanese",
        price: "$35.00",
        unit: "per platter",
        rating: 5.0,
        image: "https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?auto=format&fit=crop&q=80&w=800",
        duration: "25 mins",
        discount: "$ 5 off",
        timeSlots: ["12:00 PM", "01:00 PM", "06:30 PM"]
    },
    {
        id: 4,
        title: "Classic Caesar Salad",
        category: "Salads",
        price: "$9.99",
        unit: "per bowl",
        rating: 4.7,
        image: "https://images.unsplash.com/photo-1546793665-c74683f339c1?auto=format&fit=crop&q=80&w=800",
        duration: "10 mins",
        discount: "$ 2 off",
        timeSlots: ["11:30 AM", "01:00 PM", "02:30 PM"]
    },
    {
        id: 5,
        title: "Spicy Chicken Tacos",
        category: "Mexican",
        price: "$14.99",
        unit: "per serving",
        rating: 4.6,
        image: "https://images.unsplash.com/photo-1565299585323-38d6b0865b47?auto=format&fit=crop&q=80&w=800",
        duration: "15 mins",
        timeSlots: ["12:00 PM", "02:00 PM", "07:00 PM"]
    },
    {
        id: 6,
        title: "Chocolate Lava Cake",
        category: "Desserts",
        price: "$8.50",
        unit: "per slice",
        rating: 4.9,
        image: "https://images.unsplash.com/photo-1624353365286-3f8d62daad51?auto=format&fit=crop&q=80&w=800",
        duration: "12 mins",
        discount: "$ 1 off",
        timeSlots: ["01:00 PM", "03:00 PM", "08:00 PM"]
    }
];

const PopularFoods: React.FC = () => {
    return (
        <section className="max-w-7xl mx-auto px-16 pb-20">
            <div className="flex items-center justify-between mb-7">
                <h2 className="text-2xl font-bold tracking-tight text-primary">Popular Foods</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {foods.map((food) => (
                    <Card key={food.id} className="p-2 hover:border-primary-1/30 bg-secondary-2 border border-transparent hover:border transition-transform duration-900  group">
                        <div className="relative h-48 rounded-[10px] overflow-hidden    ">
                            <img
                                src={food.image}
                                alt={food.title}
                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                            />
                            {food.discount && (
                                <div className="absolute top-0 right-0 bg-primary-1 text-black px-5 py-2.5 rounded-bl-[16px] text-xs font-black">
                                    {food.discount}
                                </div>
                            )}
                            {food.rating && (
                                <div className="absolute bottom-1.5 left-1.5 bg-primary-1 text-black px-2.5 py-1.5 rounded-l-[15px]  rounded-tr-[16px] text-xs  ">
                                <FaStar  className="inline w-3 h-3 bg-s " />    {food.rating}
                                </div>
                            )}
                        </div>

                        <CardContent className="px-1.5 pb-2  ">
                            <div className="flex justify-between items-start ">
                                <h3 className="text-[14px] font-bold text-primary tracking-tight   leading-tight">
                                    {food.title}
                                </h3>
                                <div className="text-right shrink-0">
                                    <div className="text-primary-1 text-[18px] font-bold">{food.price}</div>
                                </div>
                            </div>

                            <div className="flex justify-between items-center mb-4">
                                <span className="text-gray-500 text-xs font-medium">Duration: {food.duration}</span>
                                <span className="text-gray-500 text-[10px] font-medium">{food.unit}</span>
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


 
export default PopularFoods;