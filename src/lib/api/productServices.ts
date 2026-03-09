import { Activity, Food, Package, ProductAdvancedItem } from "./types";
import bookingEngineUrlHttp from "./bookingEngineUrlHttp";
import type { AxiosError } from "axios";

async function fetchFromApi<T>(path: string, errorLabel: string): Promise<T> {
  try {
    const response = await bookingEngineUrlHttp.get<T>(path);
    return response.data;
  } catch (error) {
    const err = error as AxiosError<any>;
    const message =
      (err.response?.data as any)?.message || err.message || `Failed to ${errorLabel}`;
    throw new Error(message);
  }
}

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

async function fetchProductAdvanced(
  params: ProductAdvancedParams
): Promise<ProductAdvancedItem[]> {
  const search = new URLSearchParams();
  search.set("ShopId", String(params.ShopId));
  if (params.CategoryId != null) search.set("CategoryId", String(params.CategoryId));
  if (params.SubCategoryId != null) search.set("SubCategoryId", String(params.SubCategoryId));
  if (params.ProductId != null) search.set("ProductId", String(params.ProductId));
  if (params.IsBookingRequired != null)
    search.set("IsBookingRequired", String(params.IsBookingRequired));
  if (params.IsBundleProduct != null)
    search.set("IsBundleProduct", String(params.IsBundleProduct));
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
  const opts = item.attributeOptions ?? [];
  const combos = item.attributeCombinations ?? [];
  // Derive games from API: e.g. "Game Type" options 1 Game → 1, 2 Games → 2
  const gameTypeAttr = opts.filter((o) => /game\s*type|number\s*of\s*games/i.test(o.attributeName));
  const gameTypeOptionCount =
    gameTypeAttr.length > 0 ? new Set(gameTypeAttr.map((o) => o.attributeOptionId)).size : 0;
  const games: (1 | 2 | 3)[] =
    gameTypeOptionCount > 0
      ? ([1, 2, 3].slice(0, Math.min(3, gameTypeOptionCount)) as (1 | 2 | 3)[])
      : ([1, 2, 3] as (1 | 2 | 3)[]);

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
    games,
    attributeOptions: item.attributeOptions ?? [],
    attributeCombinations: (item.attributeCombinations ?? []).map((c) => ({
      ...c,
      minPrice: c.minPrice ?? null,
      maxPrice: c.maxPrice ?? null,
    })),
  };
}

function mapProductToActivity(item: ProductAdvancedItem): Activity {
  return mapProductToBase(item) as Activity;
}

function mapProductToFood(item: ProductAdvancedItem): Food {
  return mapProductToBase(item) as Food;
}

function mapProductToPackage(item: ProductAdvancedItem): Package {
  return mapProductToBase(item) as Package;
}

export const activitiesApi = {
  async getAll(shopId: number): Promise<Activity[]> {
    const raw = await fetchProductAdvanced({ ShopId: shopId, IsActivity: true });
    return raw.map(mapProductToActivity);
  },

  async search(term: string, shopId: number): Promise<Activity[]> {
    const raw = await fetchProductAdvanced({ ShopId: shopId, IsActivity: true });
    const all = raw.map(mapProductToActivity);
    const query = term.trim().toLowerCase();
    return query
      ? all.filter(
          (a) =>
            a.productName.toLowerCase().includes(query) ||
            a.category.toLowerCase().includes(query)
        )
      : all;
  },

  async getById(id: number, shopId = 1): Promise<Activity | null> {
    const raw = await fetchProductAdvanced({ ShopId: shopId, IsActivity: true, ProductId: id });
    const item = raw[0];
    return item ? mapProductToActivity(item) : null;
  },
};

export const foodsApi = {
  async getAll(shopId: number): Promise<Food[]> {
    const raw = await fetchProductAdvanced({ ShopId: shopId, IsFood: true });
    return raw.map(mapProductToFood);
  },

  async search(term: string, shopId: number): Promise<Food[]> {
    const raw = await fetchProductAdvanced({ ShopId: shopId, IsFood: true });
    const all = raw.map(mapProductToFood);
    const query = term.trim().toLowerCase();
    return query
      ? all.filter(
          (food) =>
            food.title.toLowerCase().includes(query) ||
            food.category.toLowerCase().includes(query)
        )
      : all;
  },

  async getById(id: number, shopId = 1): Promise<Food | null> {
    const raw = await fetchProductAdvanced({ ShopId: shopId, IsFood: true, ProductId: id });
    const item = raw[0];
    return item ? mapProductToFood(item) : null;
  },
};

export const packagesApi = {
  async getAll(shopId: number): Promise<Package[]> {
    const raw = await fetchProductAdvanced({ ShopId: shopId, IsBundleProduct: true });
    return raw.map(mapProductToPackage);
  },

  async search(term: string, shopId: number): Promise<Package[]> {
    const raw = await fetchProductAdvanced({ ShopId: shopId, IsBundleProduct: true });
    const all = raw.map(mapProductToPackage);
    const query = term.trim().toLowerCase();
    return query
      ? all.filter(
          (pkg) =>
            pkg.title.toLowerCase().includes(query) ||
            pkg.category.toLowerCase().includes(query)
        )
      : all;
  },

  async getById(id: number, shopId = 1): Promise<Package | null> {
    const raw = await fetchProductAdvanced({
      ShopId: shopId,
      IsBundleProduct: true,
      ProductId: id,
    });
    const item = raw[0];
    return item ? mapProductToPackage(item) : null;
  },
};

