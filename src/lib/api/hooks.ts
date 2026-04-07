"use client";

import { useQuery, UseQueryResult, useMutation, UseMutationResult } from "@tanstack/react-query";
import { activitiesApi, foodsApi, packagesApi, authApi, availabilityApi, bookingApi, modifiersApi } from "./services";
import type { GenerateBookingItemStep } from "./types";
import { Activity, Food, Package, SignInResponse, RequestOtpRequest, RequestOtpResponse, VerifyOtpRequest, Slot, GetAvailabilitySlotsParams, BookingDapperStatus, AvailabilitySlotsResult } from "./types";
import { useAppSelector } from "@/store/hooks";
import { env } from "@/config";
import {
  fetchEngineCompanyConfig,
  type CompanyConfigResponse,
} from "./bookingEngineUrlHttp";

// Query keys for React Query
export const queryKeys = {
    activities: {
        all: ["activities"] as const,
        lists: () => [...queryKeys.activities.all, "list"] as const,
        list: () => [...queryKeys.activities.lists()] as const,
        search: (term: string) => [...queryKeys.activities.list(), "search", term] as const,
        details: () => [...queryKeys.activities.all, "detail"] as const,
        detail: (id: number) => [...queryKeys.activities.details(), id] as const,
    },
    foods: {
        all: ["foods"] as const,
        lists: () => [...queryKeys.foods.all, "list"] as const,
        list: (shopId: number) => [...queryKeys.foods.lists(), "shopId", shopId] as const,
        search: (term: string, shopId: number) => [...queryKeys.foods.list(shopId), "search", term] as const,
        details: () => [...queryKeys.foods.all, "detail"] as const,
        detail: (id: number, shopId: number) => [...queryKeys.foods.details(), id, "shopId", shopId] as const,
        withModifiers: (shopId: number, term: string | undefined) =>
            [...queryKeys.foods.all, "withModifiers", "shopId", shopId, term ?? ""] as const,
    },
    packages: {
        all: ["packages"] as const,
        lists: () => [...queryKeys.packages.all, "list"] as const,
        list: (shopId: number) => [...queryKeys.packages.lists(), "shopId", shopId] as const,
        search: (term: string, shopId: number) => [...queryKeys.packages.list(shopId), "search", term] as const,
        details: () => [...queryKeys.packages.all, "detail"] as const,
        detail: (id: number, shopId: number) => [...queryKeys.packages.details(), id, "shopId", shopId] as const,
    },
    availability: {
        slots: (params: GetAvailabilitySlotsParams) =>
            ["availability", "slots", params.date, params.shopId, params.selectedBookableProducts.map((p) => `${p.id}-${p.attributeOptionId}`).join(","), params.adults, params.kids] as const,
    },
    booking: {
        dapperStatuses: () => ["booking", "dapperStatuses"] as const,
        itemSteps: (bookingReferenceId: string, selectedSlot: string, selectedDate: string) =>
            ["booking", "itemSteps", bookingReferenceId, selectedSlot, selectedDate] as const,
    },
};

// Activities hooks – fetches all data; pagination is controlled on the frontend
export function useActivities(searchTerm?: string): UseQueryResult<Activity[], Error> {
    const shopId = useAppSelector((state) => state.shop.shopId);
    const query = searchTerm?.trim() ?? "";
    const hasSearch = query.length > 0;

    return useQuery({
        queryKey: hasSearch
            ? [...queryKeys.activities.search(query), "shopId", shopId]
            : [...queryKeys.activities.list(), "shopId", shopId],
        queryFn: () =>
            hasSearch ? activitiesApi.search(query, shopId) : activitiesApi.getAll(shopId),
        staleTime: 5 * 60 * 1000, // 5 minutes
    });
}

export function useActivity(id: number): UseQueryResult<Activity | null, Error> {
    const shopId = useAppSelector((state) => state.shop.shopId);
    return useQuery({
        queryKey: [...queryKeys.activities.detail(id), "shopId", shopId],
        queryFn: () => activitiesApi.getById(id, shopId),
        enabled: !!id,
        staleTime: 5 * 60 * 1000,
    });
}

// Foods hooks – fetches all data; pagination is controlled on the frontend
export function useFoods(searchTerm?: string): UseQueryResult<Food[], Error> {
    const shopId = useAppSelector((state) => state.shop.shopId);
    const query = searchTerm?.trim() ?? "";
    const hasSearch = query.length > 0;

    return useQuery({
        queryKey: hasSearch
            ? [...queryKeys.foods.search(query, shopId)]
            : [...queryKeys.foods.list(shopId)],
        queryFn: () =>
            hasSearch ? foodsApi.search(query, shopId) : foodsApi.getAll(shopId),
        staleTime: 5 * 60 * 1000, // 5 minutes
    });
}

// (Legacy) Combined foods + modifier targets hook removed; use `useFoods` + `useProductModifiers` instead.

export function useFood(id: number): UseQueryResult<Food | null, Error> {
    const shopId = useAppSelector((state) => state.shop.shopId);
    return useQuery({
        queryKey: queryKeys.foods.detail(id, shopId),
        queryFn: () => foodsApi.getById(id, shopId),
        enabled: !!id,
        staleTime: 5 * 60 * 1000,
    });
}

// Packages hooks – fetches all data; pagination is controlled on the frontend
export function usePackages(searchTerm?: string): UseQueryResult<Package[], Error> {
    const shopId = useAppSelector((state) => state.shop.shopId);
    const query = searchTerm?.trim() ?? "";
    const hasSearch = query.length > 0;

    return useQuery({
        queryKey: hasSearch
            ? [...queryKeys.packages.search(query, shopId)]
            : [...queryKeys.packages.list(shopId)],
        queryFn: () =>
            hasSearch ? packagesApi.search(query, shopId) : packagesApi.getAll(shopId),
        staleTime: 5 * 60 * 1000, // 5 minutes
    });
}

export function usePackage(id: number): UseQueryResult<Package | null, Error> {
    const shopId = useAppSelector((state) => state.shop.shopId);
    return useQuery({
        queryKey: queryKeys.packages.detail(id, shopId),
        queryFn: () => packagesApi.getById(id, shopId),
        enabled: !!id,
        staleTime: 5 * 60 * 1000,
    });
}

// Availability slots – enabled when date, time of day, and at least one product + persons are selected
export function useAvailabilitySlots(params: GetAvailabilitySlotsParams | null): UseQueryResult<AvailabilitySlotsResult, Error> {
    const hasProducts =
        params && (params.activityIds.length > 0 || params.packageIds.length > 0);
    const hasPersons = params && params.adults + params.kids > 0;
    const hasDate = !!params?.date;

    return useQuery({
        queryKey: params ? queryKeys.availability.slots(params) : ["availability", "slots", "disabled"],
        queryFn: () => availabilityApi.getSlots(params!),
        enabled: !!params && hasDate && !!hasProducts && !!hasPersons,
        staleTime: 2 * 60 * 1000, // 2 minutes – slots can change
    });
}

// Booking hooks – generateBookingItemSteps (timeline bar). Only runs after retrieveTimeSlots has returned.
export function useGenerateBookingItemSteps(
    bookingReferenceId: string | undefined,
    selectedSlot: string | undefined,
    selectedDate: string | undefined,
    slotsResponseReceived: boolean
): UseQueryResult<{ steps: GenerateBookingItemStep[]; bookingReferenceId?: string }, Error> {
    return useQuery({
        queryKey: queryKeys.booking.itemSteps(
            bookingReferenceId ?? "",
            selectedSlot ?? "",
            selectedDate ?? ""
        ),
        queryFn: () =>
            bookingApi.generateBookingItemSteps({
                bookingReferenceId: bookingReferenceId ?? "",
                selectedSlot: selectedSlot ?? "",
                selectedDate: selectedDate ?? "",
            }),
        enabled: slotsResponseReceived && !!selectedDate && !!selectedSlot,
        staleTime: 2 * 60 * 1000,
    });
}

// Booking hooks – dapper statuses (bookingFlowUrlHttp)
export function useBookingDapperStatuses(): UseQueryResult<BookingDapperStatus[], Error> {
    return useQuery({
        queryKey: queryKeys.booking.dapperStatuses(),
        queryFn: () => bookingApi.getDapperStatuses(),
        staleTime: 5 * 60 * 1000,
    });
}

// Auth hooks – OTP sign-in
export function useRequestOtp(): UseMutationResult<RequestOtpResponse, Error, RequestOtpRequest> {
    return useMutation({
        mutationFn: (data: RequestOtpRequest) => authApi.requestOtp(data),
    });
}

export function useVerifyOtp(): UseMutationResult<SignInResponse, Error, VerifyOtpRequest> {
    return useMutation({
        mutationFn: (data: VerifyOtpRequest) => authApi.verifyOtp(data),
    });
}


export function useCompanyConfig(): UseQueryResult<
  CompanyConfigResponse | null,
  Error
> {
  return useQuery({
    queryKey: ["companyConfig"] as const,
    queryFn: fetchEngineCompanyConfig,
    staleTime: 5 * 60 * 1000,
  });
}