import axios, { type AxiosError, type InternalAxiosRequestConfig } from "axios";
import { env } from "@/config";
import { store } from "@/store/store";
import { clearAuth, setToken } from "@/store/authSlice";

const { bookingFlowUrl } = env();
const baseURL = bookingFlowUrl?.replace(/\/+$/, "") ?? "";

const bookingFlowUrlHttp = axios.create({
  baseURL: `${baseURL}/`,
});

/** Token API response from POST /oauth/token */
export interface OAuthTokenResponse {
  success: boolean;
  message: string;
  data: {
    accessToken: string;
    refreshToken: string;
    tokenType: string;
    expiresIn: number;
  };
}

const OAUTH_TOKEN_BODY = {
  clientId: "web_app",
  clientSecret: "web_secret",
} as const;

/** Fetch new token via client credentials (POST /oauth/token) */
export async function fetchBookingFlowToken(): Promise<string | null> {
  try {
    const response = await axios.post<OAuthTokenResponse>(
      `${baseURL}/oauth/token`,
      OAUTH_TOKEN_BODY,
      { headers: { "Content-Type": "application/json" } }
    );
    const { success, data } = response.data ?? {};
    if (!success || !data?.accessToken) return null;
    store.dispatch(
      setToken({
        token: data.accessToken,
        refreshToken: data.refreshToken ?? null,
      })
    );
    return data.accessToken;
  } catch {
    return null;
  }
}

bookingFlowUrlHttp.interceptors.request.use(
  (config) => {
    const state = store.getState();
    const token = state.auth?.token ?? null;

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      config.baseURL = `${baseURL}/`;
    } else {
      config.baseURL = `${baseURL}/`;
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

  const state = store.getState();
  const refreshToken = state.auth?.refreshToken ?? null;
  if (refreshToken) {
    try {
      const response = await axios.post<OAuthTokenResponse>(
        `${baseURL}/oauth/refresh`,
        { refreshToken },
        { headers: { "Content-Type": "application/json" } }
      );
      const { success, data } = response.data ?? {};
      const newToken = success && data?.accessToken ? data.accessToken : null;
      if (newToken) {
        store.dispatch(
          setToken({
            token: newToken,
            refreshToken: data?.refreshToken ?? refreshToken,
          })
        );
        return newToken;
      }
    } catch {
      // fall through to client-credentials
    }
  }
  return fetchBookingFlowToken();
}

function handleUnauthenticated() {
  store.dispatch(clearAuth());
  if (typeof window !== "undefined") {
    alert("Token Invalid. Please refresh the page to try again.");
  }
}

bookingFlowUrlHttp.interceptors.response.use(
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

    return bookingFlowUrlHttp(originalRequest);
  }
);

export default bookingFlowUrlHttp;

