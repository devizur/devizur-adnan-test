export const AUTH_STORAGE_KEY = "booking-engine.auth";

export type StoredAuthUser = {
  id: string;
  email: string;
  name: string;
};

export type StoredAuthPayload = {
  user: StoredAuthUser;
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
