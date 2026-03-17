import {
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
    const empty: AvailabilitySlotsResult = { timeSlots: {}, periodsWithSlots: [], bookingId: undefined };
    if (selectedBookableProducts.length === 0 || adults + kids === 0) {
      return empty;
    }
    try {
      const response = await bookingFlowUrlHttp.post<RetrieveTimeSlotsResponse>(
        "/api/Booking/retrieveTimeSlots",
        {
          bookingId: "",
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
      const periodsWithSlots = (["Morning", "Afternoon", "Night"] as const).filter(
        (k) => data.timeSlots && k in data.timeSlots && Array.isArray(data.timeSlots[k])
      );
      return {
        timeSlots: data.timeSlots ?? {},
        periodsWithSlots,
        bookingId: data.bookingId,
      };
    } catch {
      return empty;
    }
  },
};

// Booking API – uses bookingFlowUrlHttp (UAT backend)
export const bookingApi = {
  async generateBookingItemSteps(params: {
    bookingId: string;
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
    bookingId?: string;
  }> {
    const response = await bookingFlowUrlHttp.post<GenerateBookingItemStepsResponse>(
      "/api/Booking/generateBookingItemSteps",
      params
    );
    const { success, data, bookingId } = response.data ?? {};
    if (!success || !Array.isArray(data)) return { steps: [] };
    let steps = data;
    let returnedBookingId = bookingId;
    if (returnedBookingId && !params.bookingId) {
      const second = await bookingFlowUrlHttp.post<GenerateBookingItemStepsResponse>(
        "/api/Booking/generateBookingItemSteps",
        { ...params, bookingId: returnedBookingId }
      );
      const s = second.data ?? {};
      if (s.success && Array.isArray(s.data)) steps = s.data;
      if (s.bookingId) returnedBookingId = s.bookingId;
    }
    return { steps, bookingId: returnedBookingId };
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

