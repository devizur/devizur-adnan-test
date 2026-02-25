/**
 * Common API response shape for bookingFlowUrlHttp endpoints.
 * All booking-flow APIs return { success, message?, data? }.
 */
export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
}

/**
 * Shared base type for all catalog items (activities, foods, packages).
 * This keeps domain types independent from UI components.
 */
export interface BaseProduct {
  id: number;
  productId?: number;
  title: string;
  productName: string;
  price: string;
  fixedPrice: string;
  unit: string;
  rating: number;
  image: string;
  duration: string;
  discount?: string;
  timeSlots?: string[];
  games?: (1 | 2 | 3)[];
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

// Auth types – OTP sign-in flow
export interface RequestOtpRequest {
  email: string;
}

export interface RequestOtpResponse {
  success: boolean;
  message?: string;
}

export interface VerifyOtpRequest {
  email: string;
  otp: string;
}

export interface SignInResponse {
  user: {
    id: string;
    email: string;
    name: string;
  };
  token: string;
}

// Availability / slots (for booking step: select date, persons, products → get slots with start time + available count)
export interface Slot {
  /** Display label e.g. "6:00 am", "6 am" */
  startTime: string;
  /** Number of spots available for this slot */
  available: number;
  /** Optional discount in dollars */
  discount?: number;
}

export interface GetAvailabilitySlotsParams {
  /** Date YYYY-MM-DD */
  date: string;
  /** 1 = Morning, 2 = Afternoon, 3 = Evening */
  timeOfDay: 1 | 2 | 3;
  /** Selected activity IDs */
  activityIds: number[];
  /** Selected package IDs */
  packageIds: number[];
  /** Products with attribute (for retrieveTimeSlots API) */
  selectedBookableProducts: { id: number; attributeOptionId: number }[];
  adults: number;
  children: number;
  shopId: number;
}

// Booking dapper status (from /api/Booking/bookingDapperStatuses)
export interface BookingDapperStatus {
  id: number;
  name: string;
  createdAt: string;
  versionNo: number;
}

export type BookingDapperStatusesResponse = ApiResponse<BookingDapperStatus[]>;

/** retrieveTimeSlots response data */
export interface RetrieveTimeSlotsData {
  bookingId?: string;
  selectedDate?: string;
  timeSlots?: Record<string, string[]>;
}

export type RetrieveTimeSlotsResponse = ApiResponse<RetrieveTimeSlotsData>;

/** Result from availabilityApi.getSlots – raw timeSlots (all periods) + which periods have slots */
export interface AvailabilitySlotsResult {
  timeSlots: Record<string, string[]>;
  periodsWithSlots: ("Morning" | "Afternoon" | "Night")[];
  /** Returned by backend when available (for generateBookingItemSteps) */
  bookingId?: string;
}

/** Single step from generateBookingItemSteps API */
export interface GenerateBookingItemStep {
  serial: number;
  startingTime: string;  // "00:00", "00:43" – HH:mm offset from slot start
  endingTime: string;
  itemName: string;
  itemDuration: string;
}

export type GenerateBookingItemStepsResponse = ApiResponse<GenerateBookingItemStep[]>;
