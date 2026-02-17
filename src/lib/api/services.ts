import { Activity, Food, Package, SignInResponse, RequestOtpRequest, RequestOtpResponse, VerifyOtpRequest, Slot, GetAvailabilitySlotsParams } from "./types";
import bookingFlowUrlHttp from "./bookingEngineUrlHttp";
import type { AxiosError } from "axios";

// Base API configuration - ready for REST API migration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "";

// Helper function to fetch JSON files (used when no REST API is configured)
async function fetchJson<T>(url: string): Promise<T> {
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`Failed to fetch ${url}: ${response.statusText}`);
    }
    return response.json();
}

// Helper for REST API requests when API_BASE_URL is configured, using the shared Axios http client
async function fetchFromApi<T>(path: string, errorLabel: string): Promise<T> {
    if (!API_BASE_URL) {
        throw new Error("REST API base URL is not configured");
    }

    try {
        const response = await bookingFlowUrlHttp.get<T>(path);
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

// Activities API
export const activitiesApi = {
    /**
     * Get all activities.
     * - If API_BASE_URL is configured, fetch from REST API.
     * - Otherwise, fall back to local JSON files.
     */
    async getAll(): Promise<Activity[]> {
        if (API_BASE_URL) {
            return fetchFromApi<Activity[]>("/api/activities", "fetch activities");
        }

        // JSON file implementation
        const [activities1] = await Promise.all([
            fetchJson<Activity[]>("/data/Activities1.json"),
     
        ]);

        return [...activities1];
    },

    /**
     * Search activities.
     * - When API_BASE_URL is set, this calls the REST API with a `search` query parameter.
     * - Otherwise, it falls back to client-side filtering on top of `getAll()`.
     */
    async search(term: string): Promise<Activity[]> {
        const query = term.trim();
        if (!query) {
            return activitiesApi.getAll();
        }

        if (API_BASE_URL) {
            const encoded = encodeURIComponent(query);
            return fetchFromApi<Activity[]>(`/api/activities?search=${encoded}`, "search activities");
        }

        const all = await activitiesApi.getAll();
        const normalized = query.toLowerCase();
        return all.filter(
            (activity) =>
                activity.title.toLowerCase().includes(normalized) ||
                activity.category.toLowerCase().includes(normalized)
        );
    },

    async getById(id: number): Promise<Activity | null> {
        const activities = await activitiesApi.getAll();
        return activities.find((activity) => activity.id === id) || null;
    },
};

// Foods API
export const foodsApi = {
    /**
     * Get all foods.
     * - If API_BASE_URL is configured, fetch from REST API.
     * - Otherwise, fall back to local JSON files.
     */
    async getAll(): Promise<Food[]> {
        if (API_BASE_URL) {
            return fetchFromApi<Food[]>("/api/foods", "fetch foods");
        }

        // JSON file implementation
        const [foods1] = await Promise.all([
            fetchJson<Food[]>("/data/Foods1.json"),
          
        ]);

        return [...foods1];
    },

    /**
     * Search foods.
     * - When API_BASE_URL is set, this calls the REST API with a `search` query parameter.
     * - Otherwise, it falls back to client-side filtering on top of `getAll()`.
     */
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
    /**
     * Get all packages.
     * - If API_BASE_URL is configured, fetch from REST API.
     * - Otherwise, fall back to local JSON files.
     */
    async getAll(): Promise<Package[]> {
        if (API_BASE_URL) {
            return fetchFromApi<Package[]>("/api/packages", "fetch packages");
        }

        // JSON file implementation
        const [packages1] = await Promise.all([
            fetchJson<Package[]>("/data/Packages1.json"),
      
        ]);

        return [...packages1];
    },

    /**
     * Search packages.
     * - When API_BASE_URL is set, this calls the REST API with a `search` query parameter.
     * - Otherwise, it falls back to client-side filtering on top of `getAll()`.
     */
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
    /**
     * Get available slots (start time + available count) for the given date, time of day, selected activities/packages and persons.
     * - If API_BASE_URL is set: GET /api/availability/slots?date=...&timeOfDay=...&activityIds=...&packageIds=...&adults=...&children=...
     * - Otherwise: returns fallback slots (e.g. 6 am, 6:30 am, ... with 100 available each).
     */
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

// Auth API – OTP sign-in: request OTP by email, then verify OTP to get token
export const authApi = {
    /** Send OTP to the given email. Backend sends the code to the user's inbox. */
    async requestOtp(data: RequestOtpRequest): Promise<RequestOtpResponse> {
        if (API_BASE_URL) {
            try {
                const response = await bookingFlowUrlHttp.post<RequestOtpResponse>("/api/auth/request-otp", data);
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
                const response = await bookingFlowUrlHttp.post<SignInResponse>("/api/auth/verify-otp", data);
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
