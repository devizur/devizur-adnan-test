import { Activity, Food, Package, SignInRequest, SignInResponse } from "./types";

// Base API configuration - ready for REST API migration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "";

// Helper function to fetch JSON files (will be replaced with REST API calls)
async function fetchJson<T>(url: string): Promise<T> {
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`Failed to fetch ${url}: ${response.statusText}`);
    }
    return response.json();
}

// Activities API
export const activitiesApi = {
    // Fetch from JSON files (current implementation)
    async getAll(): Promise<Activity[]> {
        if (API_BASE_URL) {
            // Future REST API implementation
            // const response = await fetch(`${API_BASE_URL}/api/activities`);
            // return response.json();
            throw new Error("REST API not yet implemented");
        }
        
        // Current JSON file implementation
        const [activities1, activities2] = await Promise.all([
            fetchJson<Activity[]>("/data/Activities1.json"),
            fetchJson<Activity[]>("/data/Activities2.json"),
        ]);
        
        return [...activities1, ...activities2];
    },
    
    async getById(id: number): Promise<Activity | null> {
        const activities = await activitiesApi.getAll();
        return activities.find((activity) => activity.id === id) || null;
    },
};

// Foods API
export const foodsApi = {
    // Fetch from JSON files (current implementation)
    async getAll(): Promise<Food[]> {
        if (API_BASE_URL) {
            // Future REST API implementation
            // const response = await fetch(`${API_BASE_URL}/api/foods`);
            // return response.json();
            throw new Error("REST API not yet implemented");
        }
        
        // Current JSON file implementation
        const [foods1, foods2] = await Promise.all([
            fetchJson<Food[]>("/data/Foods1.json"),
            fetchJson<Food[]>("/data/Foods2.json"),
        ]);
        
        return [...foods1, ...foods2];
    },
    
    async getById(id: number): Promise<Food | null> {
        const foods = await foodsApi.getAll();
        return foods.find((food) => food.id === id) || null;
    },
};

// Packages API
export const packagesApi = {
    // Fetch from JSON files (current implementation)
    async getAll(): Promise<Package[]> {
        if (API_BASE_URL) {
            // Future REST API implementation
            // const response = await fetch(`${API_BASE_URL}/api/packages`);
            // return response.json();
            throw new Error("REST API not yet implemented");
        }
        
        // Current JSON file implementation
        const [packages1, packages2] = await Promise.all([
            fetchJson<Package[]>("/data/Packages1.json"),
            fetchJson<Package[]>("/data/Packages2.json"),
        ]);
        
        return [...packages1, ...packages2];
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
            // REST API implementation
            const response = await fetch(`${API_BASE_URL}/api/auth/signin`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(credentials),
            });
            
            if (!response.ok) {
                const error = await response.json().catch(() => ({ message: "Sign in failed" }));
                throw new Error(error.message || "Sign in failed");
            }
            
            return response.json();
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
};
