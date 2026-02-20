"use client";

import { useBookingDapperStatuses } from "@/lib/api/hooks";

export default function TestBookingDapperPage() {
    const { data, isLoading, error, refetch } = useBookingDapperStatuses();

    if (isLoading) {
        return (
            <div className="container mx-auto px-4 py-8 mt-32">
                <h1 className="text-2xl font-semibold mb-4 text-primary">Test: Booking Dapper Statuses</h1>
                <p className="text-muted-foreground">Loading...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="container mx-auto px-4 py-8 mt-32">
                <h1 className="text-2xl font-semibold mb-4 text-primary">Test: Booking Dapper Statuses</h1>
                <p className="text-destructive mb-2">Error: {error.message}</p>
                <button
                    type="button"
                    onClick={() => refetch()}
                    className="rounded-md bg-primary px-3 py-2 text-primary-foreground hover:bg-primary/90"
                >
                    Retry
                </button>
            </div>
        );
    }

    const statuses = data ?? [];

    return (
        <div className="container mx-auto px-4 py-8 mt-32">
            <h1 className="text-2xl font-semibold mb-2 text-primary">Test: Booking Dapper Statuses</h1>
            <p className="text-primary mb-6">
                GET /api/Booking/bookingDapperStatuses (via bookingFlowUrlHttp)
            </p>
            <div className="rounded-lg border overflow-hidden text-primary">
                <table className="w-full text-left">
                    <thead className="bg-muted/50">
                        <tr>
                            <th className="px-4 py-3 font-medium">ID</th>
                            <th className="px-4 py-3 font-medium">Name</th>
                            <th className="px-4 py-3 font-medium">Created at</th>
                            <th className="px-4 py-3 font-medium">Version</th>
                        </tr>
                    </thead>
                    <tbody>
                        {statuses.map((item) => (
                            <tr key={item.id} className="border-t">
                                <td className="px-4 py-3">{item.id}</td>
                                <td className="px-4 py-3 font-medium">{item.name}</td>
                                <td className="px-4 py-3 text-muted-foreground">
                                    {new Date(item.createdAt).toLocaleString()}
                                </td>
                                <td className="px-4 py-3">{item.versionNo}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            {statuses.length === 0 && (
                <p className="text-muted-foreground mt-4">No statuses returned.</p>
            )}
            <button
                type="button"
                onClick={() => refetch()}
                className="mt-4 rounded-md bg-primary-1 px-3 py-2 text-secondary hover:bg-primary/90"
            >
                Refetch
            </button>
        </div>
    );
}
