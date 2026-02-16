"use client";

import { useQuery, UseQueryResult, useMutation, UseMutationResult } from "@tanstack/react-query";
import { activitiesApi, foodsApi, packagesApi, authApi } from "./services";
import { Activity, Food, Package, SignInRequest, SignInResponse, SignUpRequest, SignUpResponse, ForgotPasswordRequest, ForgotPasswordResponse } from "./types";

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

export function useSignUp(): UseMutationResult<SignUpResponse, Error, SignUpRequest> {
    return useMutation({
        mutationFn: (data: SignUpRequest) => authApi.signUp(data),
    });
}

export function useForgotPassword(): UseMutationResult<ForgotPasswordResponse, Error, ForgotPasswordRequest> {
    return useMutation({
        mutationFn: (data: ForgotPasswordRequest) => authApi.forgotPassword(data),
    });
}
