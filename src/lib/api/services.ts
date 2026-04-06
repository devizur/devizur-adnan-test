import {
  type ApiResponse,
  SignInResponse,
  RequestOtpRequest,
  RequestOtpResponse,
  VerifyOtpRequest,
  GetAvailabilitySlotsParams,
  BookingDapperStatus,
  BookingDapperStatusesResponse,
  RetrieveTimeSlotsResponse,
  AvailabilitySlotsResult,
  GenerateBookingItemStepsResponse,
} from "./types";
import bookingEngineUrlHttp from "./bookingEngineUrlHttp";
import bookingFlowUrlHttp from "./bookingFlowUrlHttp";
import type { AxiosError } from "axios";
import { activitiesApi, foodsApi, packagesApi } from "./productServices";
import { modifiersApi } from "./modifierServices";

export { activitiesApi, foodsApi, packagesApi, modifiersApi };

// Availability / slots API – returns all time slots; filter by period client-side
export const availabilityApi = {
  async getSlots(params: GetAvailabilitySlotsParams): Promise<AvailabilitySlotsResult> {
    const { date, selectedBookableProducts, adults, kids, shopId } = params;
    const empty: AvailabilitySlotsResult = { timeSlots: {}, periodsWithSlots: [], bookingReferenceId: undefined };
    if (selectedBookableProducts.length === 0 || adults + kids === 0) {
      return empty;
    }
    try {
      const response = await bookingFlowUrlHttp.post<RetrieveTimeSlotsResponse>(
        "/api/Booking/retrieveTimeSlots",
        {
          bookingReferenceId: "",
          shopId: String(shopId),
          selectedDate: date,
          selectedBookableProducts,
          adultPaxNo: adults,
          childPaxNo: kids,
        }
      );
      const { success, data } = response.data ?? {};
      if (!success || !data?.timeSlots) {
        return empty;
      }
      // API uses "Evening"; older payloads may use "Night". Normalize so UI always reads "Evening".
      const raw = data.timeSlots;
      const timeSlots: Record<string, string[]> = { ...raw };
      if (
        (!("Evening" in timeSlots) || !Array.isArray(timeSlots.Evening)) &&
        "Night" in raw &&
        Array.isArray(raw.Night)
      ) {
        timeSlots.Evening = raw.Night;
      }
      const periodsWithSlots = (["Morning", "Afternoon", "Evening"] as const).filter(
        (k) => k in timeSlots && Array.isArray(timeSlots[k])
      );
      return {
        timeSlots,
        periodsWithSlots,
        bookingReferenceId: data.bookingReferenceId ?? data.bookingId,
      };
    } catch {
      return empty;
    }
  },
};

// Booking API – uses bookingFlowUrlHttp (UAT backend)
export const bookingApi = {
  async generateBookingItemSteps(params: {
    bookingReferenceId: string;
    selectedSlot: string; // "09:00" or slot id
    selectedDate: string; // YYYY-MM-DD
  }): Promise<{
    steps: {
      serial: number;
      startingTime: string;
      endingTime: string;
      itemName: string;
      itemDuration: string;
    }[];
    bookingReferenceId?: string;
  }> {
    const response = await bookingFlowUrlHttp.post<GenerateBookingItemStepsResponse>(
      "/api/Booking/generateBookingItemSteps",
      params
    );
    const { success, data, bookingReferenceId, bookingId: legacyBookingId } = response.data ?? {};
    if (!success || !Array.isArray(data)) return { steps: [] };
    let steps = data;
    let returnedRef = bookingReferenceId ?? legacyBookingId;
    if (returnedRef && !params.bookingReferenceId) {
      const second = await bookingFlowUrlHttp.post<GenerateBookingItemStepsResponse>(
        "/api/Booking/generateBookingItemSteps",
        { ...params, bookingReferenceId: returnedRef }
      );
      const s = second.data ?? {};
      if (s.success && Array.isArray(s.data)) steps = s.data;
      const nextRef = s.bookingReferenceId ?? s.bookingId;
      if (nextRef) returnedRef = nextRef;
    }
    return { steps, bookingReferenceId: returnedRef };
  },

  /** POST /api/Booking/reserveBooking — lock selected slot after date/time chosen (booking flow). */
  async reserveBooking(params: {
    bookingReferenceId: string;
    selectedSlot: string;
    selectedDate: string;
  }): Promise<void> {
    try {
      const response = await bookingFlowUrlHttp.post<ApiResponse<unknown>>(
        "/api/Booking/reserveBooking",
        params
      );
      const { success, message } = response.data ?? {};
      if (!success) {
        throw new Error(
          typeof message === "string" && message.trim()
            ? message
            : "Failed to reserve this time slot"
        );
      }
    } catch (error) {
      const err = error as AxiosError<ApiResponse<unknown>>;
      if (err.response?.data && typeof err.response.data === "object") {
        const m = (err.response.data as ApiResponse<unknown>).message;
        if (typeof m === "string" && m.trim()) throw new Error(m);
      }
      if (error instanceof Error && error.message) throw error;
      throw new Error("Failed to reserve this time slot");
    }
  },

  /** POST /api/Booking/unreserveBooking — release slot (id as query param, e.g. ?bookingReferenceId=…). */
  async unreserveBooking(params: { bookingReferenceId: string }): Promise<void> {
    try {
      const response = await bookingFlowUrlHttp.post<ApiResponse<unknown>>(
        "/api/Booking/unreserveBooking",
        undefined,
        { params: { bookingReferenceId: params.bookingReferenceId } }
      );
      const { success, message } = response.data ?? {};
      if (!success) {
        throw new Error(
          typeof message === "string" && message.trim()
            ? message
            : "Failed to unreserve time slot"
        );
      }
    } catch (error) {
      const err = error as AxiosError<ApiResponse<unknown>>;
      if (err.response?.data && typeof err.response.data === "object") {
        const m = (err.response.data as ApiResponse<unknown>).message;
        if (typeof m === "string" && m.trim()) throw new Error(m);
      }
      if (error instanceof Error && error.message) throw error;
      throw new Error("Failed to unreserve time slot");
    }
  },

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
    try {
      const response = await bookingEngineUrlHttp.post<RequestOtpResponse>(
        "/api/auth/request-otp",
        data
      );
      return response.data;
    } catch (error) {
      const err = error as AxiosError<any>;
      const message =
        (err.response?.data as any)?.message || err.message || "Failed to send OTP";
      throw new Error(message);
    }
  },

  /** Verify OTP and return user + token (sign in). */
  async verifyOtp(data: VerifyOtpRequest): Promise<SignInResponse> {
    try {
      const response = await bookingEngineUrlHttp.post<SignInResponse>(
        "/api/auth/verify-otp",
        data
      );
      return response.data;
    } catch (error) {
      const err = error as AxiosError<any>;
      const message =
        (err.response?.data as any)?.message ||
        err.message ||
        "Invalid or expired OTP";
      throw new Error(message);
    }
  },
};

