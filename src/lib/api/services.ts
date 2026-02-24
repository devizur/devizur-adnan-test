import { Activity, Food, Package, SignInResponse, RequestOtpRequest, RequestOtpResponse, VerifyOtpRequest, Slot, GetAvailabilitySlotsParams, BookingDapperStatus, BookingDapperStatusesResponse } from "./types";
import bookingEngineUrlHttp from "./bookingEngineUrlHttp";
import bookingFlowUrlHttp from "./bookingFlowUrlHttp";
import type { AxiosError } from "axios";

// Base API configuration - ready for REST API migration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "";


async function fetchJson<T>(url: string): Promise<T> {
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`Failed to fetch ${url}: ${response.statusText}`);
    }
    return response.json();
}


async function fetchFromApi<T>(path: string, errorLabel: string): Promise<T> {
    try {
        const response = await bookingEngineUrlHttp.get<T>(path);
        return response.data;
    } catch (error) {
        const err = error as AxiosError<any>;
        const message =
            (err.response?.data as any)?.message ||
            err.message ||
            `Failed to ${errorLabel}`;
        throw new Error(message);
    }
}


export const activitiesApi = {

    async getAll(page = 1, pageSize = 9): Promise<Activity[]> {
        const search = new URLSearchParams();
        search.set("shopId", "1");
        search.set("page", String(page));
        search.set("pageSize", String(pageSize));

        return fetchFromApi<Activity[]>(
            `/api/datasync/products/changes?${search.toString()}`,
            "fetch activities"
        );
    },


    async search(term: string, page = 1, pageSize = 9): Promise<Activity[]> {
        const query = term.trim();

        const searchParams = new URLSearchParams();
        searchParams.set("shopId", "1");
        searchParams.set("page", String(page));
        searchParams.set("pageSize", String(pageSize));
        if (query) {
            // Assumes backend accepts `search` as a filter parameter
            searchParams.set("search", query);
        }

        return fetchFromApi<Activity[]>(
            `/api/datasync/products/changes?${searchParams.toString()}`,
            "search activities"
        );
    },

    async getById(id: number): Promise<Activity | null> {
        const activities = await activitiesApi.getAll();
        return activities.find((activity) => activity.id === id) || null;
    },
};

// Foods API
export const foodsApi = {

    async getAll(): Promise<Food[]> {
        if (API_BASE_URL) {
            return fetchFromApi<Food[]>("/api/foods", "fetch foods");
        }


        const [foods1] = await Promise.all([
            fetchJson<Food[]>("/data/Foods1.json"),

        ]);

        return [...foods1];
    },


    async search(term: string): Promise<Food[]> {
        const query = term.trim();
        if (!query) {
            return foodsApi.getAll();
        }

        if (API_BASE_URL) {
            const encoded = encodeURIComponent(query);
            return fetchFromApi<Food[]>(`/api/foods?search=${encoded}`, "search foods");
        }

        const all = await foodsApi.getAll();
        const normalized = query.toLowerCase();
        return all.filter(
            (food) =>
                food.title.toLowerCase().includes(normalized) ||
                food.category.toLowerCase().includes(normalized)
        );
    },

    async getById(id: number): Promise<Food | null> {
        const foods = await foodsApi.getAll();
        return foods.find((food) => food.id === id) || null;
    },
};

// Packages API
export const packagesApi = {

    async getAll(): Promise<Package[]> {
        if (API_BASE_URL) {
            return fetchFromApi<Package[]>("/api/packages", "fetch packages");
        }


        const [packages1] = await Promise.all([
            fetchJson<Package[]>("/data/Packages1.json"),

        ]);

        return [...packages1];
    },


    async search(term: string): Promise<Package[]> {
        const query = term.trim();
        if (!query) {
            return packagesApi.getAll();
        }

        if (API_BASE_URL) {
            const encoded = encodeURIComponent(query);
            return fetchFromApi<Package[]>(`/api/packages?search=${encoded}`, "search packages");
        }

        const all = await packagesApi.getAll();
        const normalized = query.toLowerCase();
        return all.filter(
            (pkg) =>
                pkg.title.toLowerCase().includes(normalized) ||
                pkg.category.toLowerCase().includes(normalized)
        );
    },

    async getById(id: number): Promise<Package | null> {
        const packages = await packagesApi.getAll();
        return packages.find((pkg) => pkg.id === id) || null;
    },
};

// Availability / slots API – returns start times with available count for the selected date, time of day, products and persons
const FALLBACK_SLOTS: Slot[] = [
    { startTime: "6:00 am", available: 100 },
    { startTime: "6:30 am", available: 100, discount: 5 },
    { startTime: "7:00 am", available: 100 },
    { startTime: "7:30 am", available: 100 },
    { startTime: "8:00 am", available: 100 },
    { startTime: "8:30 am", available: 100 },
    { startTime: "9:00 am", available: 100 },
    { startTime: "9:30 am", available: 100 },
    { startTime: "10:00 am", available: 100 },
    { startTime: "10:30 am", available: 100 },
    { startTime: "11:00 am", available: 100, discount: 5 },
    { startTime: "11:30 am", available: 100 },
    { startTime: "12:00 pm", available: 100 },
    { startTime: "12:30 pm", available: 100 },
    { startTime: "1:00 pm", available: 100 },
    { startTime: "1:30 pm", available: 100 },
];

const timeOfDayMap: Record<1 | 2 | 3, string> = { 1: "morning", 2: "afternoon", 3: "evening" };

export const availabilityApi = {

    async getSlots(params: GetAvailabilitySlotsParams): Promise<Slot[]> {
        const { date, timeOfDay, activityIds, packageIds, adults, children } = params;
        if (API_BASE_URL) {
            const search = new URLSearchParams();
            search.set("date", date);
            search.set("timeOfDay", timeOfDayMap[timeOfDay]);
            if (activityIds.length) search.set("activityIds", activityIds.join(","));
            if (packageIds.length) search.set("packageIds", packageIds.join(","));
            search.set("adults", String(adults));
            search.set("children", String(children));
            return fetchFromApi<Slot[]>(`/api/availability/slots?${search.toString()}`, "fetch availability slots");
        }
        return [...FALLBACK_SLOTS];
    },
};

// Booking API – uses bookingFlowUrlHttp (UAT backend)
export const bookingApi = {
    async getDapperStatuses(): Promise<BookingDapperStatus[]> {
        const response = await bookingFlowUrlHttp.get<BookingDapperStatusesResponse>(
            "/api/Booking/bookingDapperStatuses"
        );
        const { success, data } = response.data ?? {};
        if (!success || !Array.isArray(data)) {
            throw new Error(
                (response.data as BookingDapperStatusesResponse)?.message ??
                "Failed to fetch booking dapper statuses"
            );
        }
        return data.map((item) => ({
            id: item.id,
            name: item.name,
            createdAt: item.createdAt,
            versionNo: item.versionNo,
        }));
    },
};

// Auth API – OTP sign-in: request OTP by email, then verify OTP to get token
export const authApi = {
    async requestOtp(data: RequestOtpRequest): Promise<RequestOtpResponse> {
        if (API_BASE_URL) {
            try {
                const response = await bookingEngineUrlHttp.post<RequestOtpResponse>("/api/auth/request-otp", data);
                return response.data;
            } catch (error) {
                const err = error as AxiosError<any>;
                const message =
                    (err.response?.data as any)?.message ||
                    err.message ||
                    "Failed to send OTP";
                throw new Error(message);
            }
        }
        await new Promise((resolve) => setTimeout(resolve, 800));
        if (data.email) {
            return { success: true, message: "OTP sent to your email." };
        }
        throw new Error("Please provide a valid email address");
    },

    /** Verify OTP and return user + token (sign in). */
    async verifyOtp(data: VerifyOtpRequest): Promise<SignInResponse> {
        if (API_BASE_URL) {
            try {
                const response = await bookingEngineUrlHttp.post<SignInResponse>("/api/auth/verify-otp", data);
                return response.data;
            } catch (error) {
                const err = error as AxiosError<any>;
                const message =
                    (err.response?.data as any)?.message ||
                    err.message ||
                    "Invalid or expired OTP";
                throw new Error(message);
            }
        }
        await new Promise((resolve) => setTimeout(resolve, 800));
        if (data.email && data.otp && data.otp.length >= 4) {
            return {
                user: {
                    id: "otp-user-" + Date.now(),
                    email: data.email,
                    name: data.email.split("@")[0],
                },
                token: "mock-jwt-token-" + Date.now(),
            };
        }
        throw new Error("Invalid or expired OTP");
    },
};
