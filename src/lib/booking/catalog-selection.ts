import type { Activity, AttributeCombinationItem, Package } from "@/lib/api/types";

export type CatalogProduct = Activity | Package;

/** Age group (etc.): driven by Guests counts — not shown as chips; merged into combinations. */
export const GUEST_DERIVED_ATTRIBUTE_ID = 2;

/** e.g. "1 Game Adult" → 1, "2 Games Kids" → 2 */
function getGameCountFromCombinationName(name: string): number | null {
  const m = String(name).trim().match(/^(\d+)\s+Games?\b/i);
  if (!m) return null;
  const n = parseInt(m[1], 10);
  return Number.isFinite(n) && n > 0 ? n : null;
}

function formatActivityPriceAmount(n: number): string {
  const rounded = Math.round(n * 100) / 100;
  return Number.isInteger(rounded) ? String(rounded) : rounded.toFixed(2);
}

/** Min–max price for one game tier (adult/kids variants), e.g. "1 game · $15–$200 per person" */
function summarizeDynamicPricesForGameCount(
  combinations: AttributeCombinationItem[],
  gameCount: number
): string | null {
  const subset = combinations.filter(
    (c) => getGameCountFromCombinationName(c.attributeCombinationName) === gameCount
  );
  if (subset.length === 0) return null;
  const prices = subset
    .map((c) => c.fixedPrice)
    .filter((p) => typeof p === "number" && !Number.isNaN(p) && p >= 0);
  if (prices.length === 0) return null;
  const min = Math.min(...prices);
  const max = Math.max(...prices);
  const tier = gameCount === 1 ? "1 game" : `${gameCount} games`;
  const range =
    min === max
      ? `$${formatActivityPriceAmount(min)}`
      : `$${formatActivityPriceAmount(min)}–$${formatActivityPriceAmount(max)}`;
  return `${tier} · ${range} per person`;
}

function fallbackAllCombinationsRange(combinations: AttributeCombinationItem[]): string | null {
  const prices = combinations
    .map((c) => c.fixedPrice)
    .filter((p) => typeof p === "number" && !Number.isNaN(p) && p >= 0);
  if (prices.length === 0) return null;
  const min = Math.min(...prices);
  const max = Math.max(...prices);
  return min === max
    ? `$${formatActivityPriceAmount(min)} per person`
    : `$${formatActivityPriceAmount(min)}–$${formatActivityPriceAmount(max)} per person`;
}

export function getActivityCardPricingSubtitle(
  product: CatalogProduct,
  combinations: AttributeCombinationItem[],
  selected: boolean,
  selectedCombination: AttributeCombinationItem | undefined
): string {
  const slots = (product as Activity & { timeSlots?: string[] }).timeSlots;
  if (slots && slots.length > 0) {
    return slots.join(", ");
  }
  if (combinations.length === 0) return "--";

  if (selected && selectedCombination) {
    const n = getGameCountFromCombinationName(selectedCombination.attributeCombinationName);
    if (n != null) {
      const line = summarizeDynamicPricesForGameCount(combinations, n);
      if (line) return line;
    }
    const fp = selectedCombination.fixedPrice;
    if (typeof fp === "number" && !Number.isNaN(fp) && fp >= 0) {
      return `$${formatActivityPriceAmount(fp)} per person`;
    }
  }

  const counts = [
    ...new Set(
      combinations
        .map((c) => getGameCountFromCombinationName(c.attributeCombinationName))
        .filter((x): x is number => x != null)
    ),
  ].sort((a, b) => a - b);
  if (counts.length > 0) {
    const line = summarizeDynamicPricesForGameCount(combinations, counts[0]!);
    if (line) return line;
  }

  return fallbackAllCombinationsRange(combinations) ?? "--";
}

export function getProductCombinations(product: CatalogProduct): AttributeCombinationItem[] {
  const combos = (product as Activity & { attributeCombinations?: AttributeCombinationItem[] })
    .attributeCombinations;
  return Array.isArray(combos) && combos.length > 0 ? combos : [];
}

function getGuestAttributeOptions(product: CatalogProduct) {
  return (product.attributeOptions ?? []).filter(
    (o) => o.attributeId === GUEST_DERIVED_ATTRIBUTE_ID
  );
}

export function attributeOptionsForFlatDisplay(product: CatalogProduct) {
  return (product.attributeOptions ?? []).filter(
    (o) => o.attributeId !== GUEST_DERIVED_ATTRIBUTE_ID
  );
}

export function optionsWithSameAttributeId(product: CatalogProduct, attributeId: number) {
  return (product.attributeOptions ?? []).filter((o) => o.attributeId === attributeId);
}

function pickAgeOptionIdForGroup(
  options: Array<{ attributeOptionId: number; attributeOptionName: string }>,
  persons: { adults: number; kids: number }
): number | undefined {
  if (options.length === 0) return undefined;
  const { adults, kids } = persons;
  const pick = (pred: (name: string) => boolean) =>
    options.find((o) => pred(o.attributeOptionName))?.attributeOptionId;

  if (adults > 0 && kids === 0) {
    return pick((name) => /\badult\b|senior|18\s*\+|16\s*\+/i.test(name)) ?? options[0]!.attributeOptionId;
  }
  if (kids > 0 && adults === 0) {
    return (
      pick((name) => /\bchild\b|\bkids?\b|junior|minor|under\s*\d+/i.test(name)) ??
      options[options.length - 1]!.attributeOptionId
    );
  }
  if (adults > 0 && kids > 0) {
    return (
      pick((name) => /family|mixed|group|both|all\s*ages/i.test(name)) ??
      pick((name) => /\badult\b/i.test(name)) ??
      options[0]!.attributeOptionId
    );
  }
  return options[0]!.attributeOptionId;
}

function collectGuestDerivedAgeOptionIds(
  product: CatalogProduct,
  persons: { adults: number; kids: number }
): number[] {
  const opts = getGuestAttributeOptions(product);
  if (opts.length === 0) return [];
  const id = pickAgeOptionIdForGroup(opts, persons);
  return id != null ? [id] : [];
}

export function stripGuestDerivedOptionIds(product: CatalogProduct, ids: number[]): number[] {
  const drop = new Set(getGuestAttributeOptions(product).map((o) => o.attributeOptionId));
  return ids.filter((id) => !drop.has(id));
}

export function buildFullCombinationOptionIds(
  product: CatalogProduct,
  visibleSelectedIds: number[],
  persons: { adults: number; kids: number }
): number[] {
  const stripped = stripGuestDerivedOptionIds(product, visibleSelectedIds);
  const ageIds = collectGuestDerivedAgeOptionIds(product, persons);
  return [...new Set([...stripped, ...ageIds])].sort((a, b) => a - b);
}

export function findCombinationByOptionIds(
  product: CatalogProduct,
  selectedOptionIds: number[]
): AttributeCombinationItem | undefined {
  const combos = getProductCombinations(product);
  return combos.find((c) => {
    const set = c.attributeCombinationSet;
    return (
      set.length === selectedOptionIds.length && selectedOptionIds.every((id) => set.includes(id))
    );
  });
}

export function pickDefaultCombination(
  product: CatalogProduct,
  persons: { adults: number; kids: number }
): AttributeCombinationItem | undefined {
  const combos = getProductCombinations(product);
  if (combos.length === 0) return undefined;
  const ageIds = collectGuestDerivedAgeOptionIds(product, persons);
  if (ageIds.length === 0) return combos[0];
  const match = combos.find((c) => ageIds.every((id) => c.attributeCombinationSet.includes(id)));
  return match ?? combos[0];
}

/** When adults/kids change, returns the new combination if the merged option set maps to a different row. */
export function resolveGuestDerivedCombinationUpdate(
  product: CatalogProduct,
  combination: AttributeCombinationItem | undefined,
  persons: { adults: number; kids: number }
): AttributeCombinationItem | undefined {
  if (!combination) return undefined;
  const combos = getProductCombinations(product);
  if (combos.length === 0) return undefined;
  const visibleOnly = stripGuestDerivedOptionIds(product, combination.attributeCombinationSet);
  const merged = buildFullCombinationOptionIds(product, visibleOnly, persons);
  const next = findCombinationByOptionIds(product, merged);
  if (
    !next ||
    next.productAttributeCombinationId === combination.productAttributeCombinationId
  ) {
    return undefined;
  }
  return next;
}
