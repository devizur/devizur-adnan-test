
import React from 'react';
import PopularCard, { PopularItem } from "./PopularCard";

interface Activity extends PopularItem {
    id: number;
    category: string;
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
                    <PopularCard key={activity.id} item={activity} showTimeSlots />
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