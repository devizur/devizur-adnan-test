
import React from 'react';
import ProductCard, { ProductItem } from "@/components/ui/reused/ProductCard";

interface Activity extends ProductItem {
    id: number;
    category: string;
}

 
const activities: Activity[] = [
    {
        id: 4,
        title: "Rock Climbing Wall",
        category: "Indoor Sports",
        price: "$25.00",
        unit: "per hour",
        rating: 4.6,
        image: "https://images.unsplash.com/photo-1522163182402-834f871fd851?auto=format&fit=crop&q=80&w=800",
        duration: "60 mins",
        discount: "$ 5 off",
        timeSlots: ["09:00 AM", "11:00 AM", "02:00 PM", "04:00 PM"]
    },
    {
        id: 5,
        title: "Indoor Trampoline Park",
        category: "Indoor Sports",
        price: "$18.00",
        unit: "per person",
        rating: 4.7,
        image: "https://images.unsplash.com/photo-1545205597-3d9d02c29597?auto=format&fit=crop&q=80&w=800",
        duration: "45 mins",
        timeSlots: ["10:00 AM", "12:00 PM", "03:00 PM", "05:00 PM"]
    },
    {
        id: 6,
        title: "Laser Tag Arena",
        category: "Indoor Games",
        price: "$22.00",
        unit: "per game",
        rating: 4.9,
        image: "https://images.unsplash.com/photo-1511882150382-421056c89033?auto=format&fit=crop&q=80&w=800",
        duration: "30 mins",
        discount: "$ 8 off",
        timeSlots: ["11:00 AM", "01:00 PM", "04:00 PM", "06:00 PM"]
    },
    {
        id: 7,
        title: "Indoor Karting",
        category: "Indoor Sports",
        price: "$40.00",
        unit: "per race",
        rating: 4.8,
        image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&q=80&w=800",
        duration: "15 mins",
        timeSlots: ["09:30 AM", "11:30 AM", "02:30 PM", "05:30 PM"]
    },
    {
        id: 8,
        title: "Virtual Reality Gaming",
        category: "Indoor Games",
        price: "$30.00",
        unit: "per hour",
        rating: 5.0,
        image: "https://images.unsplash.com/photo-1593508512255-86ab42a8e620?auto=format&fit=crop&q=80&w=800",
        duration: "60 mins",
        discount: "$ 10 off",
        timeSlots: ["10:00 AM", "01:00 PM", "03:00 PM", "06:00 PM"]
    },
    {
        id: 9,
        title: "Indoor Mini Golf",
        category: "Indoor Games",
        price: "$15.00",
        unit: "per person",
        rating: 4.4,
        image: "https://images.unsplash.com/photo-1587280501635-68a0e82cd5ff?auto=format&fit=crop&q=80&w=800",
        duration: "45 mins",
        timeSlots: ["09:00 AM", "12:00 PM", "03:00 PM", "05:00 PM", "07:00 PM"]
    }
,
    {
        id: 10,
        title: "Bowling Alley",
        category: "Indoor Sports",
        price: "$20.00",
        unit: "per game",
        rating: 4.5,
        image: "https://images.unsplash.com/photo-1579952363873-27f3bade9f55?auto=format&fit=crop&q=80&w=800",
        duration: "30 mins",
        discount: "$ 3 off",
        timeSlots: ["10:00 AM", "12:00 PM", "02:00 PM", "04:00 PM", "06:00 PM"]
    },
    {
        id: 11,
        title: "Escape Room",
        category: "Indoor Games",
        price: "$35.00",
        unit: "per person",
        rating: 4.9,
        image: "https://images.unsplash.com/photo-1604329760661-e71dc83f8f26?auto=format&fit=crop&q=80&w=800",
        duration: "60 mins",
        timeSlots: ["11:00 AM", "01:00 PM", "03:00 PM", "05:00 PM"]
    },
    {
        id: 12,
        title: "Arcade Games",
        category: "Indoor Games",
        price: "$12.00",
        unit: "per hour",
        rating: 4.3,
        image: "https://images.unsplash.com/photo-1511882150382-421056c89033?auto=format&fit=crop&q=80&w=800",
        duration: "60 mins",
        discount: "$ 2 off",
        timeSlots: ["09:00 AM", "11:00 AM", "01:00 PM", "03:00 PM", "05:00 PM"]
    },
    {
        id: 13,
        title: "Indoor Skydiving",
        category: "Indoor Sports",
        price: "$55.00",
        unit: "per session",
        rating: 5.0,
        image: "https://images.unsplash.com/photo-1519904981063-b0cf448d479e?auto=format&fit=crop&q=80&w=800",
        duration: "20 mins",
        discount: "$ 15 off",
        timeSlots: ["10:00 AM", "12:00 PM", "02:00 PM", "04:00 PM"]
    },
    {
        id: 14,
        title: "Paint & Sip Studio",
        category: "Indoor Activities",
        price: "$28.00",
        unit: "per person",
        rating: 4.6,
        image: "https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?auto=format&fit=crop&q=80&w=800",
        duration: "90 mins",
        timeSlots: ["11:00 AM", "02:00 PM", "05:00 PM", "07:00 PM"]
    },
    {
        id: 15,
        title: "Ice Skating Rink",
        category: "Indoor Sports",
        price: "$16.00",
        unit: "per person",
        rating: 4.7,
        image: "https://images.unsplash.com/photo-1551524164-687a55dd1126?auto=format&fit=crop&q=80&w=800",
        duration: "60 mins",
        discount: "$ 4 off",
        timeSlots: ["09:00 AM", "11:00 AM", "01:00 PM", "03:00 PM", "05:00 PM"]
    },
    {
        id: 16,
        title: "Axe Throwing",
        category: "Indoor Sports",
        price: "$32.00",
        unit: "per hour",
        rating: 4.8,
        image: "https://images.unsplash.com/photo-1511882150382-421056c89033?auto=format&fit=crop&q=80&w=800",
        duration: "60 mins",
        timeSlots: ["10:00 AM", "12:00 PM", "02:00 PM", "04:00 PM", "06:00 PM"]
    },
    {
        id: 17,
        title: "Indoor Soccer Arena",
        category: "Indoor Sports",
        price: "$45.00",
        unit: "per hour",
        rating: 4.5,
        image: "https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&q=80&w=800",
        duration: "60 mins",
        discount: "$ 7 off",
        timeSlots: ["09:00 AM", "11:00 AM", "01:00 PM", "03:00 PM", "05:00 PM"]
    }
];

const PopularActivities: React.FC<{ limit?: number }> = ({ limit }) => {
    return (
        <section className="container  mx-auto  pb-20">
            <div className="flex items-center justify-between mb-7">
                <h2 className="text-2xl font-bold tracking-tight text-primary">Popular Activities</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {activities.slice(0, limit).map((activity) => (
                    <ProductCard key={activity.id} item={activity} showTimeSlots />
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