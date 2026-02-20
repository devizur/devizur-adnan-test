"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAppSelector } from "@/store/hooks";

interface ProtectedRouteProps {
    children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
    const router = useRouter();
    const token = useAppSelector((state) => state.auth?.token ?? null);

    useEffect(() => {
        if (token === null) {
            router.push("/sign-in");
        }
    }, [router, token]);

    if (!token) {
        return (
            <div className="min-h-screen bg-[#121212] flex items-center justify-center">
                <div className="text-center space-y-4">
                    <div className="w-12 h-12 border-4 border-primary-1 border-t-transparent rounded-full animate-spin mx-auto" />
                    <p className="text-zinc-400 text-sm">Checking authentication...</p>
                </div>
            </div>
        );
    }

    return <>{children}</>;
}
