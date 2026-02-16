import { Activity, Food, Package, SignInRequest, SignInResponse, SignUpRequest, SignUpResponse, ForgotPasswordRequest, ForgotPasswordResponse } from "./types";
import http from "./http";
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
        const response = await http.get<T>(path);
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

// Auth API
export const authApi = {
    async signIn(credentials: SignInRequest): Promise<SignInResponse> {
        if (API_BASE_URL) {
            try {
                const response = await http.post<SignInResponse>("/api/auth/signin", credentials);
                return response.data;
            } catch (error) {
                const err = error as AxiosError<any>;
                const message =
                    (err.response?.data as any)?.message ||
                    err.message ||
                    "Sign in failed";
                throw new Error(message);
            }
        }
        
        // Mock implementation for development
        // Simulating API delay
        await new Promise((resolve) => setTimeout(resolve, 1000));
        
        // Simple mock validation
        if (credentials.email && credentials.password) {
            return {
                user: {
                    id: "1",
                    email: credentials.email,
                    name: "John Doe",
                },
                token: "mock-jwt-token-" + Date.now(),
            };
        }
        
        throw new Error("Invalid credentials");
    },
    
    async signInWithOAuth(provider: "google" | "facebook"): Promise<SignInResponse> {
        if (API_BASE_URL) {
            // REST API implementation
            // This would typically redirect to OAuth provider or open a popup
            window.location.href = `${API_BASE_URL}/api/auth/${provider}`;
            // The actual response would come from a callback URL
            throw new Error("OAuth redirect initiated");
        }
        
        // Mock implementation for development
        await new Promise((resolve) => setTimeout(resolve, 1500));
        
        return {
            user: {
                id: "oauth-" + provider + "-" + Date.now(),
                email: `user@${provider}.com`,
                name: `${provider.charAt(0).toUpperCase() + provider.slice(1)} User`,
            },
            token: `mock-${provider}-token-` + Date.now(),
        };
    },
    
    async signUp(data: SignUpRequest): Promise<SignUpResponse> {
        if (API_BASE_URL) {
            try {
                const response = await http.post<SignUpResponse>("/api/auth/signup", data);
                return response.data;
            } catch (error) {
                const err = error as AxiosError<any>;
                const message =
                    (err.response?.data as any)?.message ||
                    err.message ||
                    "Sign up failed";
                throw new Error(message);
            }
        }
        
        // Mock implementation for development
        await new Promise((resolve) => setTimeout(resolve, 1000));
        
        // Validate passwords match
        if (data.password !== data.confirmPassword) {
            throw new Error("Passwords do not match");
        }
        
        // Simple validation
        if (data.name && data.email && data.password) {
            return {
                user: {
                    id: "new-user-" + Date.now(),
                    email: data.email,
                    name: data.name,
                },
                token: "mock-signup-token-" + Date.now(),
            };
        }
        
        throw new Error("Please fill in all fields");
    },
    
    async forgotPassword(data: ForgotPasswordRequest): Promise<ForgotPasswordResponse> {
        if (API_BASE_URL) {
            try {
                const response = await http.post<ForgotPasswordResponse>("/api/auth/forgot-password", data);
                return response.data;
            } catch (error) {
                const err = error as AxiosError<any>;
                const message =
                    (err.response?.data as any)?.message ||
                    err.message ||
                    "Failed to send reset email";
                throw new Error(message);
            }
        }
        
        // Mock implementation for development
        await new Promise((resolve) => setTimeout(resolve, 1500));
        
        // Simple validation
        if (data.email) {
            return {
                success: true,
                message: "Password reset link has been sent to your email address.",
            };
        }
        
        throw new Error("Please provide a valid email address");
    },
};
