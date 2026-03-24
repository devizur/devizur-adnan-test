// Common booking-flow API response shape
export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
}

// GET /api/Product/advanced response item
export interface ProductAdvancedItem {
  productId: number;
  productName: string;
  productDescription: string;
  productCode: string;
  productBarcode: string;
  categoryId: number;
  categoryName: string;
  subCategoryId: number;
  subCategoryName: string;
  isComboProduct: boolean;
  isBookingRequired: boolean;
  isBundleProduct: boolean;
  tags: string;
  allergens: string;
  thumbnailShortImage: string;
  thumbnailShortImageUrl: string;
  attributeOptions: Array<{
    attributeId: number;
    attributeName: string;
    attributeOptionId: number;
    attributeOptionName: string;
  }>;
  attributeCombinations: Array<{
    productAttributeCombinationId: number;
    attributeCombinationName: string;
    attributeCombinationSet: number[];
    fixedPrice: number;
    minPrice: number;
    maxPrice: number;
  }>;
  rating?: string | number;
}

// Attribute combination (from API) – used for dynamic activity options (e.g. "1 Game Adult", "2 Games Kids")
export interface AttributeCombinationItem {
  productAttributeCombinationId: number;
  attributeCombinationName: string;
  attributeCombinationSet: number[];
  fixedPrice: number;
  minPrice: number | null;
  maxPrice: number | null;
}

// Mapped catalog types – extend ProductAdvancedItem with UI-ready fields
interface MappedProduct extends ProductAdvancedItem {
  id: number;
  title: string;
  price: string;
  fixedPrice: string;
  unit: string;
  rating: number;
  image: string;
  duration: string;
  category: string;
  discount?: string;
  timeSlots?: string[];
  /** When API provides attributeOptions/attributeCombinations, options are dynamic (e.g. 1 Game, 2 Games from API) */
  games?: (1 | 2 | 3)[];
}

export interface Activity extends MappedProduct {}
export interface Food extends MappedProduct {}
export interface Package extends MappedProduct {}

// Auth – OTP sign-in
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

// Availability slots
export interface Slot {
  startTime: string;  // e.g. "6:00 am"
  available: number;
  discount?: number;  
}

export interface GetAvailabilitySlotsParams {
  date: string; 
  timeOfDay: 1 | 2 | 3;  
  activityIds: number[];
  packageIds: number[];
  selectedBookableProducts: { id: number; attributeOptionId: number }[];
  adults: number;
  kids: number;
  shopId: number;
}

// GET /api/Booking/bookingDapperStatuses
export interface BookingDapperStatus {
  id: number;
  name: string;
  createdAt: string;
  versionNo: number;
}

export type BookingDapperStatusesResponse = ApiResponse<BookingDapperStatus[]>;

// retrieveTimeSlots response
export interface RetrieveTimeSlotsData {
  bookingId?: string;
  selectedDate?: string;
  timeSlots?: Record<string, string[]>;
}

export type RetrieveTimeSlotsResponse = ApiResponse<RetrieveTimeSlotsData>;

// availabilityApi.getSlots result
export interface AvailabilitySlotsResult {
  timeSlots: Record<string, string[]>;
  periodsWithSlots: ("Morning" | "Afternoon" | "Night")[];
  bookingId?: string;
}

// generateBookingItemSteps single step
export interface GenerateBookingItemStep {
  serial: number;
  startingTime: string;  // HH:mm offset from slot start
  endingTime: string;
  itemName: string;
  itemDuration: string;
}

/** generateBookingItemSteps can return bookingId for use in subsequent calls */
export interface GenerateBookingItemStepsResponseData extends ApiResponse<GenerateBookingItemStep[]> {
  bookingId?: string;
}

export type GenerateBookingItemStepsResponse = GenerateBookingItemStepsResponseData;
