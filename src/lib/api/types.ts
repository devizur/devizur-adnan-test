/**
 * Shared base type for all catalog items (activities, foods, packages).
 * This keeps domain types independent from UI components.
 */
export interface BaseProduct {
  id: number;
  title: string;
  price: string;
  unit: string;
  rating: number;
  image: string;
  duration: string;
  discount?: string;
  timeSlots?: string[];
}

export interface Activity extends BaseProduct {
  category: string;
}

export interface Food extends BaseProduct {
  category: string;
}

export interface Package extends BaseProduct {
  category: string;
}

// Auth types
export interface SignInRequest {
  email: string;
  password: string;
}

export interface SignInResponse {
  user: {
    id: string;
    email: string;
    name: string;
  };
  token: string;
}

export interface SignUpRequest {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface SignUpResponse {
  user: {
    id: string;
    email: string;
    name: string;
  };
  token: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ForgotPasswordResponse {
  message: string;
  success: boolean;
}

export type OAuthProvider = "google" | "facebook";
