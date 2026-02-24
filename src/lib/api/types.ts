/**
 * Shared base type for all catalog items (activities, foods, packages).
 * This keeps domain types independent from UI components.
 */
export interface BaseProduct {
  id: number;
  productName: string;
  price: string; 
  fixedPrice: string;
  unit: string;
  rating: number;
  image: string;
  duration: string;
  discount?: string;
  timeSlots?: string[];
  /** Optional supported game options (1, 2, 3) for activities */
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
  adults: number;
  children: number;
}

// Booking dapper status (from /api/Booking/bookingDapperStatuses)
export interface BookingDapperStatus {
  id: number;
  name: string;
  createdAt: string;
  versionNo: number;
}

export interface BookingDapperStatusesResponse {
  success: boolean;
  message: string;
  data: BookingDapperStatus[];
}
