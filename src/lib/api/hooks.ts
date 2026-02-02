"use client";

import { useQuery, UseQueryResult, useMutation, UseMutationResult } from "@tanstack/react-query";
import { activitiesApi, foodsApi, packagesApi, authApi } from "./services";
import { Activity, Food, Package, SignInRequest, SignInResponse } from "./types";

// Query keys for React Query
export const queryKeys = {
    activities: {
        all: ["activities"] as const,
        lists: () => [...queryKeys.activities.all, "list"] as const,
        list: () => [...queryKeys.activities.lists()] as const,
        details: () => [...queryKeys.activities.all, "detail"] as const,
        detail: (id: number) => [...queryKeys.activities.details(), id] as const,
    },
    foods: {
        all: ["foods"] as const,
        lists: () => [...queryKeys.foods.all, "list"] as const,
        list: () => [...queryKeys.foods.lists()] as const,
        details: () => [...queryKeys.foods.all, "detail"] as const,
        detail: (id: number) => [...queryKeys.foods.details(), id] as const,
    },
    packages: {
        all: ["packages"] as const,
        lists: () => [...queryKeys.packages.all, "list"] as const,
        list: () => [...queryKeys.packages.lists()] as const,
        details: () => [...queryKeys.packages.all, "detail"] as const,
        detail: (id: number) => [...queryKeys.packages.details(), id] as const,
    },
};

// Activities hooks
export function useActivities(): UseQueryResult<Activity[], Error> {
    return useQuery({
        queryKey: queryKeys.activities.list(),
        queryFn: () => activitiesApi.getAll(),
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
export function useFoods(): UseQueryResult<Food[], Error> {
    return useQuery({
        queryKey: queryKeys.foods.list(),
        queryFn: () => foodsApi.getAll(),
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
export function usePackages(): UseQueryResult<Package[], Error> {
    return useQuery({
        queryKey: queryKeys.packages.list(),
        queryFn: () => packagesApi.getAll(),
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

// Auth hooks
export function useSignIn(): UseMutationResult<SignInResponse, Error, SignInRequest> {
    return useMutation({
        mutationFn: (credentials: SignInRequest) => authApi.signIn(credentials),
    });
}

export function useOAuthSignIn(): UseMutationResult<SignInResponse, Error, "google" | "facebook"> {
    return useMutation({
        mutationFn: (provider: "google" | "facebook") => authApi.signInWithOAuth(provider),
    });
}
