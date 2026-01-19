
import React from 'react';
 
import { FaStar } from "react-icons/fa";
import { Button } from "@/components/ui/button"
import {
    Card,
    CardContent,
    
} from "@/components/ui/card"


interface Activity {
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

const activities: Activity[] = [
    {
        id: 1,
        title: "Brunswick Bowling lanes",
        category: "Games",
        price: "$12.99",
        unit: "per game",
        rating: 4.5,
        image: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&q=80&w=800",
        duration: "30 mins",
        discount: "$ 10 off",
        timeSlots: ["08:00 AM", "08:30 AM", "09:00 AM"]
    },
    {
        id: 2,
        title: "Gourmet VR Dining",
        category: "Food",
        price: "$45.00",
        unit: "per person",
        rating: 4.8,
        image: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&q=80&w=800",
        duration: "90 mins",
        timeSlots: ["07:00 PM", "08:30 PM", "10:00 PM"]
    },
    {
        id: 3,
        title: "Neon Escape Room",
        category: "Activities",
        price: "$35.00",
        unit: "per group",
        rating: 5.0,
        image: "https://images.unsplash.com/photo-1622979135225-d2ba269cf1ac?auto=format&fit=crop&q=80&w=800",
        duration: "60 mins",
        discount: "$ 5 off",
        timeSlots: ["10:00 AM", "12:00 PM", "02:00 PM"]
    },
    {
        id: 4,
        title: "Arcade Championship",
        category: "Games",
        price: "$25.00",
        unit: "per hour",
        rating: 4.7,
        image: "https://images.unsplash.com/photo-1511882150382-421056c89033?auto=format&fit=crop&q=80&w=800",
        duration: "60 mins",
        discount: "$ 8 off",
        timeSlots: ["11:00 AM", "01:00 PM", "03:00 PM"]
    },
    {
        id: 5,
        title: "Karaoke Night",
        category: "Entertainment",
        price: "$20.00",
        unit: "per person",
        rating: 4.6,
        image: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&q=80&w=800",
        duration: "120 mins",
        timeSlots: ["06:00 PM", "08:00 PM", "10:00 PM"]
    },
    {
        id: 6,
        title: "Mini Golf Adventure",
        category: "Sports",
        price: "$18.00",
        unit: "per person",
        rating: 4.4,
        image: "https://images.unsplash.com/photo-1587280501635-68a0e82cd5ff?auto=format&fit=crop&q=80&w=800",
        duration: "45 mins",
        discount: "$ 3 off",
        timeSlots: ["09:00 AM", "11:00 AM", "01:00 PM"]
    }
];

const PopularActivities: React.FC = () => {
    return (
        <section className="max-w-7xl mx-auto px-16 pb-20">
            <div className="flex items-center justify-between mb-7">
                <h2 className="text-2xl font-bold tracking-tight text-primary">Popular Activities</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {activities.map((activity) => (
                    <Card key={activity.id} className="p-2 hover:border-primary-1/30 bg-secondary-2 border border-transparent hover:border transition-transform duration-900  group">
                        <div className="relative h-48 rounded-[10px] overflow-hidden    ">
                            <img
                                src={activity.image}
                                alt={activity.title}
                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                            />
                            {activity.discount && (
                                <div className="absolute top-0 right-0 bg-primary-1 text-black px-5 py-2.5 rounded-bl-[16px] text-xs font-black">
                                    {activity.discount}
                                </div>
                            )}
                            {activity.rating && (
                                <div className="absolute bottom-1.5 left-1.5 bg-primary-1 text-black px-2.5 py-1.5 rounded-l-[15px]  rounded-tr-[16px] text-xs  ">
                                <FaStar  className="inline w-3 h-3 bg-s " />    {activity.rating}
                                </div>
                            )}
                        </div>

                        <CardContent className="px-1.5 pb-2  ">
                            <div className="flex justify-between items-start ">
                                <h3 className="text-[14px] font-bold text-primary tracking-tight   leading-tight">
                                    {activity.title}
                                </h3>
                                <div className="text-right shrink-0">
                                    <div className="text-primary-1 text-[18px] font-bold">{activity.price}</div>
                                </div>
                            </div>

                            <div className="flex justify-between items-center mb-4">
                                <span className="text-gray-500 text-xs font-medium">Duration: {activity.duration}</span>
                                <span className="text-gray-500 text-[10px] font-medium">{activity.unit}</span>
                            </div>

                            <div className="flex items-center gap-2 mb-4">
                                {activity.timeSlots.map((slot, idx) => (
                                    <Button
                                        key={idx}
                                        variant="secondary"
                                        size="sm"
                                        className="flex-1 bg-secondary-2 rounded-full text-[12px] text-primary/80 border border-accent  transition-all"
                                    >
                                        {slot}
                                    </Button>
                                ))}
                                <div className="w-10 h-9 bg-primary/[0.04] border border-white/10 rounded-full text-[11px] font-bold text-gray-400 flex items-center justify-center">
                                    +5
                                </div>
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
                     View All Activities
                    </button>
            </div>
        </section>
    );
};



export default PopularActivities;