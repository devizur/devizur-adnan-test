"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Search, Calendar, Clock, User, ChevronDown } from "lucide-react";
import Image from "next/image";
import { ProtectedRoute } from "@/components/providers/protected-route";

// Mock Data
const bookings = [
    {
        id: "mb_1002",
        title: "Brunswick Bowling lanes",
        status: "Upcoming",
        date: "Dec 17, 2025",
        time: "12:00 AM",
        people: 4,
        price: 30.96,
        paymentStatus: "Payment Paid",
        image: "/images/bowling.png",
    },
    {
        id: "mb_1003",
        title: "Brunswick Bowling lanes",
        status: "Upcoming",
        date: "Dec 16, 2025",
        time: "10:00 AM",
        people: 4,
        price: 30.96,
        paymentStatus: "Payment Paid",
        image: "/images/bowling.png",
    },
    {
        id: "mb_1004",
        title: "Brunswick Bowling lanes",
        status: "Completed",
        date: "Dec 16, 2025",
        time: "12:00 PM",
        people: 4,
        price: 30.96,
        paymentStatus: "Payment Paid",
        image: "/images/bowling.png",
    },
    {
        id: "mb_1005",
        title: "Brunswick Bowling lanes",
        status: "Cancelled",
        date: "Dec 16, 2025",
        time: "12:00 PM",
        people: 4,
        price: 30.96,
        paymentStatus: "Payment Paid",
        refundAmount: 30.96,
        image: "/images/bowling.png",
    },
];

const stats = [
    { label: "Upcoming", value: 2, className: "text-yellow-400" },
    { label: "Past", value: 1, className: "text-zinc-400" },
    { label: "Cancelled", value: 1, className: "text-orange-400" }, // Using orange for cancelled based on typical UI patterns, though image might be yellow/white. Image shows yellow for all numbers.
];

export default function MyBookingsPage() {
    return (
        <ProtectedRoute>
            <div className="min-h-screen bg-[#121212] pt-8 pb-20 font-sans text-white mt-32">
            <div className="container mx-auto px-4 lg:px-8 space-y-8">

                {/* Header Section */}
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6">
                    <div className="space-y-4">
                        <Badge className="bg-primary-1 text-black hover:bg-primary-1-hover font-semibold px-4 py-1.5 rounded-full text-xs">
                            Manage your reservations
                        </Badge>
                        <div>
                            <h1 className="text-4xl lg:text-5xl font-bold text-white mb-2">
                                My Bookings
                            </h1>
                            <p className="text-zinc-400 max-w-lg">
                                View, edit, or cancel upcoming bookings. Past bookings stay here
                                for reference.
                            </p>
                        </div>
                    </div>

                    {/* Stats Cards */}
                    <div className="flex gap-4 w-full lg:w-auto overflow-x-auto pb-2 lg:pb-0">
                        {stats.map((stat, i) => (
                            <div
                                key={i}
                                className="bg-[#1a1a1a] border border-zinc-800 rounded-xl p-4 min-w-[140px] flex flex-col justify-between"
                            >
                                <span className="text-zinc-400 text-sm font-medium">
                                    {stat.label}
                                </span>
                                <span className={`text-3xl font-bold text-primary-1`}>
                                    {stat.value}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Toolbar Section */}
                <div className="bg-[#1a1a1a] p-4 rounded-xl border border-zinc-800 flex flex-col md:flex-row gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 size-4" />
                        <Input
                            placeholder="Search by Activity name, slot or booking ID"
                            className="bg-[#121212] border-zinc-800 text-zinc-300 pl-10 h-10 md:h-12 rounded-lg focus-visible:ring-zinc-700"
                        />
                    </div>
                    <div className="flex gap-4">
                        <div className="relative min-w-[120px]">
                            <label className="absolute -top-2 left-3 bg-[#1a1a1a] px-1 text-[10px] text-zinc-500">Filter</label>
                            <button className="w-full flex items-center justify-between h-10 md:h-12 px-4 rounded-lg bg-[#121212] border border-zinc-800 text-zinc-300 text-sm">
                                All
                                <ChevronDown className="size-4 text-zinc-500" />
                            </button>
                        </div>
                        <div className="relative min-w-[160px]">
                            <label className="absolute -top-2 left-3 bg-[#1a1a1a] px-1 text-[10px] text-zinc-500">Sort</label>
                            <button className="w-full flex items-center justify-between h-10 md:h-12 px-4 rounded-lg bg-[#121212] border border-zinc-800 text-zinc-300 text-sm">
                                Nearest date
                                <ChevronDown className="size-4 text-zinc-500" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Bookings List */}
                <div className="space-y-4">
                    {bookings.map((booking) => (
                        <div key={booking.id} className="group bg-[#1a1a1a] hover:bg-[#202020] transition-colors border border-zinc-800 rounded-2xl p-4 lg:p-6 flex flex-col lg:flex-row gap-6">
                            {/* Image */}
                            <div className="shrink-0 relative w-full lg:w-48 h-48 lg:h-32 rounded-xl overflow-hidden">
                                <Image
                                    src={booking.image}
                                    alt={booking.title}
                                    fill
                                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                                />
                                {/* Mobile Status Badge */}
                                <div className="absolute top-2 right-2 lg:hidden">
                                    <StatusBadge status={booking.status} />
                                </div>
                            </div>

                            {/* Content */}
                            <div className="flex-1 flex flex-col justify-between py-1">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <div className="flex items-center gap-3 mb-2">
                                            <h3 className="text-xl font-bold text-white mb-0">{booking.title}</h3>
                                            <div className="hidden lg:block">
                                                <StatusBadge status={booking.status} />
                                            </div>
                                        </div>
                                        <div className="flex flex-wrap items-center gap-4 text-zinc-400 text-sm">
                                            <div className="flex items-center gap-1.5">
                                                <Calendar className="size-4 text-primary-1" />
                                                <span>{booking.date}</span>
                                            </div>
                                            <div className="flex items-center gap-1.5">
                                                <Clock className="size-4 text-primary-1" />
                                                <span>{booking.time}</span>
                                            </div>
                                            <div className="flex items-center gap-1.5">
                                                <User className="size-4 text-primary-1" />
                                                <span>{booking.people} People</span>
                                            </div>
                                            <div className="w-1 h-1 rounded-full bg-zinc-600 hidden sm:block" />
                                            <div className="text-white font-bold text-lg">${booking.price}</div>
                                        </div>
                                        <div className="mt-2 text-xs text-zinc-500">
                                            Booking ID: <span className="text-zinc-400">{booking.id}</span> • {booking.paymentStatus}
                                        </div>
                                    </div>

                                    {/* Desktop Actions */}
                                    <div className="hidden lg:flex items-center gap-3">
                                        {booking.status === "Upcoming" && (
                                            <Button className="bg-cyan-400 hover:bg-cyan-500 text-black font-semibold h-9 px-4">
                                                Check In
                                            </Button>
                                        )}
                                        <Button className="bg-primary-1 hover:bg-primary-1-hover text-black font-semibold h-9 px-4">
                                            View
                                        </Button>
                                        <Button variant="outline" className="border-zinc-700 bg-transparent text-zinc-300 hover:bg-zinc-800 h-9 px-4" disabled={booking.status !== "Upcoming"}>
                                            Edit
                                        </Button>
                                        <Button variant="outline" className="border-red-900/30 text-red-500 bg-red-950/10 hover:bg-red-950/20 hover:text-red-400 h-9 px-4" disabled={booking.status !== "Upcoming"}>
                                            Cancel
                                        </Button>
                                    </div>
                                </div>

                                {/* Footer / Refund Status */}
                                {booking.status === "Cancelled" && (
                                    <div className="mt-2 pt-3 border-t border-zinc-800/50 flex items-center justify-between">
                                        <span className="text-zinc-400 text-sm">Refund: <span className="text-white font-bold">${booking.refundAmount}</span></span>
                                        <Badge className="bg-emerald-900/30 text-emerald-400 border border-emerald-900/50 hover:bg-emerald-900/30">Refunded</Badge>
                                    </div>
                                )}

                                {/* Mobile Actions */}
                                <div className="lg:hidden grid grid-cols-2 gap-2 mt-4">
                                    {booking.status === "Upcoming" && (
                                        <Button className="bg-cyan-400 hover:bg-cyan-500 text-black font-semibold w-full">
                                            Check In
                                        </Button>
                                    )}
                                    <Button className="bg-primary-1 hover:bg-primary-1-hover text-black font-semibold w-full">
                                        View
                                    </Button>
                                    <Button variant="outline" className="border-zinc-700 bg-transparent text-zinc-300 hover:bg-zinc-800 w-full" disabled={booking.status !== "Upcoming"}>
                                        Edit
                                    </Button>
                                    <Button variant="outline" className="border-red-900/30 text-red-500 bg-red-950/10 hover:bg-red-950/20 hover:text-red-400 w-full" disabled={booking.status !== "Upcoming"}>
                                        Cancel
                                    </Button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
        </ProtectedRoute>
    );
}

function StatusBadge({ status }: { status: string }) {
    const styles: Record<string, string> = {
        Upcoming: "border-emerald-500/30 text-emerald-400 bg-emerald-500/10",
        Completed: "border-zinc-500/30 text-zinc-400 bg-zinc-500/10",
        Cancelled: "border-red-500/30 text-red-400 bg-red-500/10",
    };

    return (
        <Badge variant="outline" className={cn("px-3 py-1 rounded-full border", styles[status])}>
            {status}
        </Badge>
    );
}
