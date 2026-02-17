import axios, { type AxiosError } from "axios";
import { env } from "@/config";
import { store } from "@/store/store";
import { clearAuth } from "@/store/authSlice";

const { BookingEngineUrl } = env();

const bookingEngineUrlHttp = axios.create({
  baseURL: BookingEngineUrl,
});

 
bookingEngineUrlHttp.interceptors.request.use(
  (config) => {
    const state = store.getState();
    const tokenFromStore = state.auth?.token ?? null;

    const tokenFromStorage =
      typeof window !== "undefined"
        ? localStorage.getItem("authToken")
        : null;

    const token = tokenFromStore ?? tokenFromStorage;

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    } else {
      delete config.headers.Authorization;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

 
bookingEngineUrlHttp.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
     
      if (typeof window !== "undefined") {
        localStorage.removeItem("authToken");
        localStorage.removeItem("user");
        window.location.href = "/sign-in";
      }

      store.dispatch(clearAuth());
    }

    return Promise.reject(error);
  }
);

export default bookingEngineUrlHttp;
