"use client";

import { useMemo } from "react";
import { useAppSelector } from "@/store/hooks";
import { useModifierMasterData, type ModifierMasterDataShape } from "./useModifierMasterData";

export function getProductModifiersForProduct(
  productId: number | string | null | undefined,
  productModifierGroups: any[] = [],
  productModifierGroupTargets: any[] = [],
  productModifierGroupModifiers: any[] = [],
  productModifiers: any[] = []
) {
  if (!productId) return [];

  const targets =
    productModifierGroupTargets?.filter(
      (target) => String(target.productId) === String(productId) && target.isActive
    ) || [];

  return (
    targets
      .map((target) => {
        const group = productModifierGroups?.find(
          (g) => String(g.modifierGroupId) === String(target.modifierGroupId)
        );
        if (!group) return null;

        const groupModMaps =
          productModifierGroupModifiers?.filter(
            (gm) => String(gm.modifierGroupId) === String(group.modifierGroupId)
          ) || [];

        const options =
          groupModMaps
            .map((gm) => {
              const modifier = productModifiers?.find(
                (m) => String(m.modifierId) === String(gm.modifierId)
              );

              return modifier
                ? {
                    ...modifier,
                    additionalPrice: Number(gm.additionalPrice || 0),
                  }
                : null;
            })
            .filter(Boolean) || [];

        return {
          ...group,
          options,
        };
      })
      // remove nulls
      .filter(Boolean) || []
  );
}

export function useProductModifiers(productId: number | string | null | undefined) {
  const shopId = useAppSelector((state) => state.shop.shopId);

  const { data } = useModifierMasterData({
    shopId,
    enabled: Boolean(shopId),
  });

  return useMemo(() => {
    if (!productId || !data) return [];

    return getProductModifiersForProduct(
      productId,
      (data as ModifierMasterDataShape).productModifierGroups,
      (data as ModifierMasterDataShape).productModifierGroupTargets,
      (data as ModifierMasterDataShape).productModifierGroupModifiers,
      (data as ModifierMasterDataShape).productModifiers
    );
  }, [productId, data]);
}

