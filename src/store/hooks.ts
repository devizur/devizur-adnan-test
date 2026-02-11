import { useDispatch, useSelector, type TypedUseSelectorHook } from "react-redux";
import type { RootState, AppDispatch } from "./store";

/**
 * Typed useDispatch – use instead of plain useDispatch for correct action types.
 */
export const useAppDispatch: () => AppDispatch = useDispatch;

/**
 * Typed useSelector – use instead of plain useSelector so state is typed (no need to pass RootState).
 */
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
