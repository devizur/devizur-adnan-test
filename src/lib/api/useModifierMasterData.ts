"use client";

import { useQuery } from "@tanstack/react-query";

const BASE_URL =
  "https://devizur-pos-backend-core-cdavc5ebecgcdben.eastasia-01.azurewebsites.net/api/datasync";

const formatLastSyncForServer = (lastSync: string | number | Date | null | undefined) => {
  if (!lastSync) return "01-Jan-1970";

  const asStr = String(lastSync).trim();

  if (/^\d{2}-[A-Za-z]{3}-\d{4}$/.test(asStr)) return asStr;

  const d = new Date(asStr);
  if (Number.isNaN(d.getTime())) return asStr;

  const day = String(d.getDate()).padStart(2, "0");
  const month = d.toLocaleString("en-US", { month: "short" });
  const year = d.getFullYear();

  return `${day}-${month}-${year}`;
};

const fetchAllPages = async ({
  entityName,
  shopId,
  lastSync,
  pageSize = 100,
}: {
  entityName: string;
  shopId: number | string;
  lastSync: string | number | Date;
  pageSize?: number;
}) => {
  const formattedLastSync = encodeURIComponent(formatLastSyncForServer(lastSync));
  let page = 1;
  let allRows: any[] = [];

  // Simple pagination loop mirroring the reference implementation
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const url = `${BASE_URL}/${entityName}/changes?shopId=${shopId}&lastSync=${formattedLastSync}&page=${page}&pageSize=${pageSize}`;

    const response = await fetch(url);

    if (!response.ok) {
      let bodyText = "";
      try {
        bodyText = await response.text();
      } catch (e: any) {
        bodyText = e?.message ?? "";
      }

      throw new Error(
        `Failed to fetch ${entityName}: ${response.status} ${response.statusText} - ${bodyText}`
      );
    }

    const data = await response.json();
    const rows = Array.isArray(data) ? data : [];

    allRows = [...allRows, ...rows];

    if (rows.length < pageSize) break;
    page += 1;
  }

  return allRows;
};

const fetchModifierMasterData = async ({
  shopId,
  lastSync,
}: {
  shopId: number | string;
  lastSync: string | number | Date;
}) => {
  const [
    productModifiers,
    productModifierGroups,
    productModifierGroupModifiers,
    productModifierGroupTargets,
  ] = await Promise.all([
    fetchAllPages({
      entityName: "product_modifier",
      shopId,
      lastSync,
    }),
    fetchAllPages({
      entityName: "product_modifier_group",
      shopId,
      lastSync,
    }),
    fetchAllPages({
      entityName: "product_modifier_group_modifier_map",
      shopId,
      lastSync,
    }),
    fetchAllPages({
      entityName: "product_modifier_group_target",
      shopId,
      lastSync,
    }),
  ]);

  return {
    productModifiers,
    productModifierGroups,
    productModifierGroupModifiers,
    productModifierGroupTargets,
  };
};

export interface ModifierMasterDataShape {
  productModifiers: any[];
  productModifierGroups: any[];
  productModifierGroupModifiers: any[];
  productModifierGroupTargets: any[];
}

export function useModifierMasterData({
  shopId,
  lastSync = "01-Jan-1970",
  enabled = true,
}: {
  shopId: number | string | null | undefined;
  lastSync?: string | number | Date;
  enabled?: boolean;
}) {
  return useQuery<ModifierMasterDataShape>({
    queryKey: ["modifier-master-data", shopId, lastSync],
    queryFn: () => fetchModifierMasterData({ shopId: shopId as number | string, lastSync }),
    enabled: Boolean(shopId) && enabled,
    staleTime: Infinity,
    gcTime: Infinity,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchOnMount: false,
  });
}

