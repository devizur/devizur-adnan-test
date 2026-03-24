import bookingEngineUrlHttp from "./bookingEngineUrlHttp";
import type { AxiosError } from "axios";

export interface Modifier {
  modifierGroupModifierMapId: number;
  modifierId: number;
  /** Optional – depends on backend payload */
  modifierName?: string;
  additionalPrice: number | null;
}

export interface ModifierTarget {
  modifierGroupTargetId: number;
  productId: number;
  productCode: string;
  productName: string;
  isActive: boolean;
  productCategoryId: number | null;
  productCategoryName: string | null;
  productSubCategoryId: number | null;
  productSubCategoryName: string | null;
}

interface ProductModifierGroupResponseItem {
  targets?: ModifierTarget[];
}

async function fetchModifierTargetsFromApi(
  shopId: number
): Promise<ModifierTarget[]> {
  try {
    // Use full UAT URL as requested, ignoring bookingEngineUrlHttp baseURL
    const response = await bookingEngineUrlHttp.get<ProductModifierGroupResponseItem[]>(
      "https://devizur-pos-backend-core-uat-dsdehpdrc7e7fxe4.australiaeast-01.azurewebsites.net/api/ProductModifierGroup",
      {
        params: { ShopId: shopId },
      }
    );
    const data = response.data ?? [];
    if (!Array.isArray(data)) return [];

    // This app only needs flattened targets (no modifierGroup info)
    const allTargets = data.flatMap((group) => group.targets ?? []);
    return allTargets.filter((t) => t.isActive);
  } catch (error) {
    const err = error as AxiosError<any>;
    const message =
      (err.response?.data as any)?.message ||
      err.message ||
      "Failed to fetch modifier master data";
    throw new Error(message);
  }
}

export const modifiersApi = {
  async getTargets(shopId: number): Promise<ModifierTarget[]> {
    return fetchModifierTargetsFromApi(shopId);
  },
};

