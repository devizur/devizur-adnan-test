export const AUTH_STORAGE_KEY = "booking-engine.auth";
export const CUSTOMER_STORAGE_KEY = "booking-engine.customer";

export type StoredAuthUser = {
  id: string;
  email: string;
  name: string;
};

export type StoredAuthPayload = {
  user: StoredAuthUser;
};

export type StoredCustomerPayload = {
  customerId: number;
  customerCode: string;
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  city: string;
  country: string;
  isActive: boolean;
  createdAt: string;
};

export function loadStoredAuth(): StoredAuthPayload | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(AUTH_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<StoredAuthPayload>;
    if (
      !parsed ||
      !parsed.user ||
      typeof parsed.user.id !== "string" ||
      typeof parsed.user.email !== "string" ||
      typeof parsed.user.name !== "string"
    ) {
      return null;
    }
    return {
      user: {
        id: parsed.user.id,
        email: parsed.user.email,
        name: parsed.user.name,
      },
    };
  } catch {
    return null;
  }
}

export function saveStoredAuth(payload: StoredAuthPayload): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(payload));
}

export function clearStoredAuth(): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(AUTH_STORAGE_KEY);
}

export function loadStoredCustomer(): StoredCustomerPayload | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(CUSTOMER_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<StoredCustomerPayload>;
    if (
      !parsed ||
      typeof parsed.customerId !== "number" ||
      typeof parsed.firstName !== "string" ||
      typeof parsed.lastName !== "string" ||
      typeof parsed.phone !== "string" ||
      typeof parsed.email !== "string"
    ) {
      return null;
    }
    return {
      customerId: parsed.customerId,
      customerCode: typeof parsed.customerCode === "string" ? parsed.customerCode : "",
      firstName: parsed.firstName,
      lastName: parsed.lastName,
      phone: parsed.phone,
      email: parsed.email,
      city: typeof parsed.city === "string" ? parsed.city : "",
      country: typeof parsed.country === "string" ? parsed.country : "",
      isActive: typeof parsed.isActive === "boolean" ? parsed.isActive : true,
      createdAt: typeof parsed.createdAt === "string" ? parsed.createdAt : "",
    };
  } catch {
    return null;
  }
}

export function saveStoredCustomer(payload: StoredCustomerPayload): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(CUSTOMER_STORAGE_KEY, JSON.stringify(payload));
}

export function clearStoredCustomer(): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(CUSTOMER_STORAGE_KEY);
}
