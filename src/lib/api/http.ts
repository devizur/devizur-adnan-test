import axios, { type AxiosError, type InternalAxiosRequestConfig } from "axios";
import { env } from "@/config";
import { store } from "@/store/store";
import { clearAuth, setToken } from "@/store/authSlice";

const { BaseUrl } = env();

const http = axios.create({
  baseURL: BaseUrl,
});

http.interceptors.request.use(
  (config) => {
    const state = store.getState();
    const tokenFromStore = state.auth?.token ?? null;
    const tokenFromStorage =
      typeof window !== "undefined"
        ? localStorage.getItem("authToken")
        : null;

    const token = tokenFromStore ?? tokenFromStorage ?? null;

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      config.baseURL = BaseUrl ? `${BaseUrl.replace(/\/+$/, "")}/` : BaseUrl;
    } else {
      config.baseURL = BaseUrl;
      delete (config.headers as Record<string, unknown>).Authorization;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

type RetriableRequestConfig = InternalAxiosRequestConfig & {
  _retryCount?: number;
};

async function refreshAccessToken(): Promise<string | null> {
  if (typeof window === "undefined") return null;

  const refreshToken = localStorage.getItem("refreshToken");
  if (!refreshToken) return null;

  try {
    const response = await axios.post(
      `${BaseUrl.replace(/\/+$/, "")}/auth/refresh`,
      { refresh_token: refreshToken },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    const data = response.data ?? {};
    const newToken: string | undefined =
      data.access_token ?? data.token ?? data.accessToken;

    if (!newToken) {
      return null;
    }

    // Persist new token
    localStorage.setItem("authToken", newToken);

    // Update Redux
    store.dispatch(setToken(newToken));

    return newToken;
  } catch (_err) {
    return null;
  }
}

function handleUnauthenticated() {
  if (typeof window !== "undefined") {
    localStorage.removeItem("authToken");
    localStorage.removeItem("user");
    localStorage.removeItem("refreshToken");
    window.location.href = "/sign-in";
  }
  store.dispatch(clearAuth());
}

http.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as RetriableRequestConfig | undefined;

    if (
      !originalRequest ||
      !error.response ||
      error.response.status !== 401
    ) {
      return Promise.reject(error);
    }

    // Max 3 attempts per request
    originalRequest._retryCount = originalRequest._retryCount ?? 0;

    if (originalRequest._retryCount >= 3) {
      handleUnauthenticated();
      return Promise.reject(error);
    }

    originalRequest._retryCount += 1;

    // Try to refresh token
    const newToken = await refreshAccessToken();

    if (!newToken) {
      handleUnauthenticated();
      return Promise.reject(error);
    }

    // Set new token on the original request and retry
    originalRequest.headers = originalRequest.headers ?? {};
    (originalRequest.headers as Record<string, string>).Authorization =
      `Bearer ${newToken}`;

    return http(originalRequest);
  }
);

export default http;

