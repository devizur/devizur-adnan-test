import bookingEngineUrlHttp from "./bookingEngineUrlHttp";

/** Row from GET /api/Shop/getAllActiveShopsByCompanyId */
export interface ActiveShop {
  shopId: number;
  shopName: string;
  shopCode?: string;
  shopType?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
  regionName?: string | null;
  companyName?: string | null;
  email?: string;
  phone?: string;
  isActive?: boolean;
}

export type ShopPickerTag = {
  type: "rating" | "badge";
  label: string;
  icon: "star" | "pin";
};

/** UI model for the shop picker cards */
export type ShopPickerItem = {
  id: number;
  shopId: number;
  title: string;
  description: string;
  tags: ShopPickerTag[];
  image: string;
};

export async function fetchActiveShopsByCompanyId(
  companyId: number
): Promise<ActiveShop[]> {
  const { data } = await bookingEngineUrlHttp.get<unknown>(
    "/api/Shop/getAllActiveShopsByCompanyId",
    { params: { companyId } }
  );
  if (!Array.isArray(data)) return [];
  return data as ActiveShop[];
}

export function activeShopToPickerItem(shop: ActiveShop): ShopPickerItem {
  const parts = [
    shop.address?.trim(),
    [shop.city, shop.state].filter(Boolean).join(", ").trim(),
    shop.country?.trim(),
  ].filter(Boolean);
  const description =
    parts.length > 0
      ? parts.join(" · ")
      : [shop.shopCode, shop.shopType].filter(Boolean).join(" · ") || "—";

  const tags: ShopPickerTag[] = [];
  if (shop.shopType?.trim()) {
    tags.push({ type: "badge", label: shop.shopType.trim(), icon: "pin" });
  }
  if (shop.regionName?.trim()) {
    tags.push({ type: "badge", label: shop.regionName.trim(), icon: "pin" });
  }
  if (shop.shopCode?.trim()) {
    tags.push({ type: "badge", label: shop.shopCode.trim(), icon: "pin" });
  }

  return {
    id: shop.shopId,
    shopId: shop.shopId,
    title: shop.shopName?.trim() || `Shop ${shop.shopId}`,
    description,
    tags,
    image: `https://picsum.photos/seed/shop-${shop.shopId}/800/560`,
  };
}
