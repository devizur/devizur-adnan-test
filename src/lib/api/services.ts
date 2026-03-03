import { Activity, Food, Package, ProductAdvancedItem, SignInResponse, RequestOtpRequest, RequestOtpResponse, VerifyOtpRequest, Slot, GetAvailabilitySlotsParams, BookingDapperStatus, BookingDapperStatusesResponse, RetrieveTimeSlotsResponse, AvailabilitySlotsResult, GenerateBookingItemStepsResponse } from "./types";
import bookingEngineUrlHttp from "./bookingEngineUrlHttp";
import bookingFlowUrlHttp from "./bookingFlowUrlHttp";
import type { AxiosError } from "axios";

async function fetchFromApi<T>(path: string, errorLabel: string): Promise<T> {
    try {
        const response = await bookingEngineUrlHttp.get<T>(path);
        return response.data;
    } catch (error) {
        const err = error as AxiosError<any>;
        const message =
            (err.response?.data as any)?.message ||
            err.message ||
            `Failed to ${errorLabel}`;
        throw new Error(message);
    }
}

/** Query params for GET /api/Product/advanced */
export interface ProductAdvancedParams {
    ShopId: number;
    CategoryId?: number;
    SubCategoryId?: number;
    ProductId?: number;
    IsBookingRequired?: boolean;
    IsBundleProduct?: boolean;
    IsActivity?: boolean;
    IsFood?: boolean;
}

async function fetchProductAdvanced(params: ProductAdvancedParams): Promise<ProductAdvancedItem[]> {
    const search = new URLSearchParams();
    search.set("ShopId", String(params.ShopId));
    if (params.CategoryId != null) search.set("CategoryId", String(params.CategoryId));
    if (params.SubCategoryId != null) search.set("SubCategoryId", String(params.SubCategoryId));
    if (params.ProductId != null) search.set("ProductId", String(params.ProductId));
    if (params.IsBookingRequired != null) search.set("IsBookingRequired", String(params.IsBookingRequired));
    if (params.IsBundleProduct != null) search.set("IsBundleProduct", String(params.IsBundleProduct));
    if (params.IsActivity != null) search.set("IsActivity", String(params.IsActivity));
    if (params.IsFood != null) search.set("IsFood", String(params.IsFood));

    const raw = await fetchFromApi<ProductAdvancedItem[]>(
        `/api/Product/advanced?${search.toString()}`,
        "fetch product catalog"
    );
    return Array.isArray(raw) ? raw : [];
}

function getPriceFromProduct(item: ProductAdvancedItem): { price: string; fixedPrice: string } {
    const combo = item.attributeCombinations?.[0];
    const num = combo?.fixedPrice ?? combo?.minPrice ?? combo?.maxPrice;
    if (num != null && !Number.isNaN(num)) {
        const str = String(num);
        return { price: `$${str}`, fixedPrice: str };
    }
    return { price: "Unavailable", fixedPrice: "Unavailable" };
}

function mapProductToBase(item: ProductAdvancedItem) {
    const category = item.categoryName || item.subCategoryName || "";
    const { price, fixedPrice } = getPriceFromProduct(item);
    const image = item.thumbnailShortImageUrl || "https://picsum.photos/400/200";
    return {
        id: item.productId,
        productId: item.productId,
        title: item.productName,
        productName: item.productName,
        price,
        fixedPrice,
        unit: "per person",
        rating: 4.5,
        image,
        duration: "60 mins",
        category,
        discount: "$5 off",
        timeSlots: ["9:00 am", "11:00 am", "2:00 pm"],
        games: [1, 2, 3] as (1 | 2 | 3)[],
    };
}

/** Map Product/advanced item to Activity */
function mapProductToActivity(item: ProductAdvancedItem): Activity {
    return mapProductToBase(item) as Activity;
}

/** Map Product/advanced item to Food */
function mapProductToFood(item: ProductAdvancedItem): Food {
    return mapProductToBase(item) as Food;
}

/** Map Product/advanced item to Package */
function mapProductToPackage(item: ProductAdvancedItem): Package {
    return mapProductToBase(item) as Package;
}

export const activitiesApi = {
    async getAll(shopId: number, page = 1, pageSize = 9): Promise<Activity[]> {
        const raw = await fetchProductAdvanced({ ShopId: shopId, IsActivity: true });
        const all = raw.map(mapProductToActivity);
        const start = (page - 1) * pageSize;
        return all.slice(start, start + pageSize);
    },

    async search(term: string, shopId: number, page = 1, pageSize = 9): Promise<Activity[]> {
        const raw = await fetchProductAdvanced({ ShopId: shopId, IsActivity: true });
        const all = raw.map(mapProductToActivity);
        const query = term.trim().toLowerCase();
        const filtered = query
            ? all.filter(
                  (a) =>
                      a.productName.toLowerCase().includes(query) ||
                      a.category.toLowerCase().includes(query)
              )
            : all;
        const start = (page - 1) * pageSize;
        return filtered.slice(start, start + pageSize);
    },

    async getById(id: number, shopId = 1): Promise<Activity | null> {
        const raw = await fetchProductAdvanced({ ShopId: shopId, IsActivity: true, ProductId: id });
        const item = raw[0];
        return item ? mapProductToActivity(item) : null;
    },
};

// Foods API – from Product/advanced with IsFood=true
export const foodsApi = {
    async getAll(shopId: number, page = 1, pageSize = 9): Promise<Food[]> {
        const raw = await fetchProductAdvanced({ ShopId: shopId, IsFood: true });
        const all = raw.map(mapProductToFood);
        const start = (page - 1) * pageSize;
        return all.slice(start, start + pageSize);
    },

    async search(term: string, shopId: number, page = 1, pageSize = 9): Promise<Food[]> {
        const raw = await fetchProductAdvanced({ ShopId: shopId, IsFood: true });
        const all = raw.map(mapProductToFood);
        const query = term.trim().toLowerCase();
        const filtered = query
            ? all.filter(
                  (food) =>
                      food.title.toLowerCase().includes(query) ||
                      food.category.toLowerCase().includes(query)
              )
            : all;
        const start = (page - 1) * pageSize;
        return filtered.slice(start, start + pageSize);
    },

    async getById(id: number, shopId = 1): Promise<Food | null> {
        const raw = await fetchProductAdvanced({ ShopId: shopId, IsFood: true, ProductId: id });
        const item = raw[0];
        return item ? mapProductToFood(item) : null;
    },
};

// Packages API – from Product/advanced with IsBundleProduct=true
export const packagesApi = {
    async getAll(shopId: number, page = 1, pageSize = 9): Promise<Package[]> {
        const raw = await fetchProductAdvanced({ ShopId: shopId, IsBundleProduct: true });
        const all = raw.map(mapProductToPackage);
        const start = (page - 1) * pageSize;
        return all.slice(start, start + pageSize);
    },

    async search(term: string, shopId: number, page = 1, pageSize = 9): Promise<Package[]> {
        const raw = await fetchProductAdvanced({ ShopId: shopId, IsBundleProduct: true });
        const all = raw.map(mapProductToPackage);
        const query = term.trim().toLowerCase();
        const filtered = query
            ? all.filter(
                  (pkg) =>
                      pkg.title.toLowerCase().includes(query) ||
                      pkg.category.toLowerCase().includes(query)
              )
            : all;
        const start = (page - 1) * pageSize;
        return filtered.slice(start, start + pageSize);
    },

    async getById(id: number, shopId = 1): Promise<Package | null> {
        const raw = await fetchProductAdvanced({ ShopId: shopId, IsBundleProduct: true, ProductId: id });
        const item = raw[0];
        return item ? mapProductToPackage(item) : null;
    },
};

// Availability / slots API – returns all time slots; filter by period client-side
export const availabilityApi = {

    async getSlots(params: GetAvailabilitySlotsParams): Promise<AvailabilitySlotsResult> {
        const { date, selectedBookableProducts, adults, children, shopId } = params;
        const empty: AvailabilitySlotsResult = { timeSlots: {}, periodsWithSlots: [], bookingId: undefined };
        if (selectedBookableProducts.length === 0 || (adults + children) === 0) {
            return empty;
        }
        try {
            const response = await bookingFlowUrlHttp.post<RetrieveTimeSlotsResponse>("/api/Booking/retrieveTimeSlots", {
                bookingId: "",
                shopId: String(shopId),
                selectedDate: date,
                selectedBookableProducts,
                adultPaxNo: adults,
                childPaxNo: children,
            });
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
        selectedSlot: string;   // "09:00" or slot id
        selectedDate: string;   // YYYY-MM-DD
    }): Promise<{ steps: { serial: number; startingTime: string; endingTime: string; itemName: string; itemDuration: string }[]; bookingId?: string }> {
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
            const response = await bookingEngineUrlHttp.post<RequestOtpResponse>("/api/auth/request-otp", data);
            return response.data;
        } catch (error) {
            const err = error as AxiosError<any>;
            const message =
                (err.response?.data as any)?.message ||
                err.message ||
                "Failed to send OTP";
            throw new Error(message);
        }
    },

    /** Verify OTP and return user + token (sign in). */
    async verifyOtp(data: VerifyOtpRequest): Promise<SignInResponse> {
        try {
            const response = await bookingEngineUrlHttp.post<SignInResponse>("/api/auth/verify-otp", data);
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
