import type { ListingComparable, PlatformMarket } from './schema';

function quantile(values: number[], q: number): number | null {
  if (!values.length) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const index = (sorted.length - 1) * q;
  const lo = Math.floor(index);
  const hi = Math.ceil(index);
  if (lo === hi) return sorted[lo];
  return sorted[lo] + (sorted[hi] - sorted[lo]) * (index - lo);
}

export function cleanComparables(listings: ListingComparable[]): ListingComparable[] {
  const valid = listings.filter(x => Number.isFinite(x.priceNzd) && x.priceNzd > 0);
  if (!valid.length) return [];
  const prices = valid.map(x => x.priceNzd).sort((a, b) => a - b);
  const q1 = quantile(prices, 0.25) ?? prices[0];
  const q3 = quantile(prices, 0.75) ?? prices[prices.length - 1];
  const iqr = q3 - q1;
  const filtered = valid.filter(x => (iqr === 0 ? x.priceNzd === q1 : x.priceNzd >= q1 - 1.5 * iqr && x.priceNzd <= q3 + 1.5 * iqr));
  return filtered;
}

export function robustMarketStats(listings: ListingComparable[]): PlatformMarket | null {
  const filtered = cleanComparables(listings);
  if (!filtered.length) return null;
  const cleanPrices = filtered.map(x => x.priceNzd).sort((a, b) => a - b);
  const median = quantile(cleanPrices, 0.5)!;
  return {
    low: Math.round((quantile(cleanPrices, 0.25) ?? cleanPrices[0]) * 100) / 100,
    median: Math.round(median * 100) / 100,
    high: Math.round((quantile(cleanPrices, 0.75) ?? cleanPrices[cleanPrices.length - 1]) * 100) / 100,
    sample_listings: filtered.slice(0, 8),
    evidence_count: filtered.length,
  };
}
