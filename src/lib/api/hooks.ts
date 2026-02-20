"use client";

import { useQuery, UseQueryResult, useMutation, UseMutationResult } from "@tanstack/react-query";
import { activitiesApi, foodsApi, packagesApi, authApi, availabilityApi, bookingApi } from "./services";
import { Activity, Food, Package, SignInResponse, RequestOtpRequest, RequestOtpResponse, VerifyOtpRequest, Slot, GetAvailabilitySlotsParams, BookingDapperStatus } from "./types";

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
        list: () => [...queryKeys.foods.lists()] as const,
        search: (term: string) => [...queryKeys.foods.list(), "search", term] as const,
        details: () => [...queryKeys.foods.all, "detail"] as const,
        detail: (id: number) => [...queryKeys.foods.details(), id] as const,
    },
    packages: {
        all: ["packages"] as const,
        lists: () => [...queryKeys.packages.all, "list"] as const,
        list: () => [...queryKeys.packages.lists()] as const,
        search: (term: string) => [...queryKeys.packages.list(), "search", term] as const,
        details: () => [...queryKeys.packages.all, "detail"] as const,
        detail: (id: number) => [...queryKeys.packages.details(), id] as const,
    },
    availability: {
        slots: (params: GetAvailabilitySlotsParams) =>
            ["availability", "slots", params.date, params.timeOfDay, params.activityIds.join(","), params.packageIds.join(","), params.adults, params.children] as const,
    },
    booking: {
        dapperStatuses: () => ["booking", "dapperStatuses"] as const,
    },
};

// Activities hooks
export function useActivities(searchTerm?: string): UseQueryResult<Activity[], Error> {
    const query = searchTerm?.trim() ?? "";
    const hasSearch = query.length > 0;

    return useQuery({
        queryKey: hasSearch ? queryKeys.activities.search(query) : queryKeys.activities.list(),
        queryFn: () => (hasSearch ? activitiesApi.search(query) : activitiesApi.getAll()),
        staleTime: 5 * 60 * 1000, // 5 minutes
    });
}

export function useActivity(id: number): UseQueryResult<Activity | null, Error> {
    return useQuery({
        queryKey: queryKeys.activities.detail(id),
        queryFn: () => activitiesApi.getById(id),
        enabled: !!id,
        staleTime: 5 * 60 * 1000,
    });
}

// Foods hooks
export function useFoods(searchTerm?: string): UseQueryResult<Food[], Error> {
    const query = searchTerm?.trim() ?? "";
    const hasSearch = query.length > 0;

    return useQuery({
        queryKey: hasSearch ? queryKeys.foods.search(query) : queryKeys.foods.list(),
        queryFn: () => (hasSearch ? foodsApi.search(query) : foodsApi.getAll()),
        staleTime: 5 * 60 * 1000, // 5 minutes
    });
}

export function useFood(id: number): UseQueryResult<Food | null, Error> {
    return useQuery({
        queryKey: queryKeys.foods.detail(id),
        queryFn: () => foodsApi.getById(id),
        enabled: !!id,
        staleTime: 5 * 60 * 1000,
    });
}

// Packages hooks
export function usePackages(searchTerm?: string): UseQueryResult<Package[], Error> {
    const query = searchTerm?.trim() ?? "";
    const hasSearch = query.length > 0;

    return useQuery({
        queryKey: hasSearch ? queryKeys.packages.search(query) : queryKeys.packages.list(),
        queryFn: () => (hasSearch ? packagesApi.search(query) : packagesApi.getAll()),
        staleTime: 5 * 60 * 1000, // 5 minutes
    });
}

export function usePackage(id: number): UseQueryResult<Package | null, Error> {
    return useQuery({
        queryKey: queryKeys.packages.detail(id),
        queryFn: () => packagesApi.getById(id),
        enabled: !!id,
        staleTime: 5 * 60 * 1000,
    });
}

// Availability slots – enabled when date, time of day, and at least one product + persons are selected
export function useAvailabilitySlots(params: GetAvailabilitySlotsParams | null): UseQueryResult<Slot[], Error> {
    const hasProducts =
        params && (params.activityIds.length > 0 || params.packageIds.length > 0);
    const hasPersons = params && params.adults + params.children > 0;
    const hasDate = !!params?.date;

    return useQuery({
        queryKey: params ? queryKeys.availability.slots(params) : ["availability", "slots", "disabled"],
        queryFn: () => availabilityApi.getSlots(params!),
        enabled: !!params && hasDate && !!hasProducts && !!hasPersons,
        staleTime: 2 * 60 * 1000, // 2 minutes – slots can change
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
