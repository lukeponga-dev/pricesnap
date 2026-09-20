import { roundPrice } from './money';
import { CleanEvidenceItem, MarketOutput, PlatformPriceSummary, MarketplacePlatform } from '../types';

export interface PriceRangeResult {
  low: number; high: number; quickSalePrice: number; balancedPrice: number;
  maxProfitPrice: number; marketOutput: MarketOutput;
}

export function calculateRange(estimatedValue: number, evidence: CleanEvidenceItem[]): PriceRangeResult {
  const items = evidence.filter(e => !e.isOutlier);
  const summary = (platform: MarketplacePlatform): PlatformPriceSummary => {
    const rows = items.filter(e => e.platform === platform);
    const prices = rows.map(e => e.priceNZD).sort((a, b) => a - b);
    if (!prices.length) return { low: 0, median: 0, high: 0, sample_listings: [] };
    const mid = Math.floor(prices.length / 2);
    return { low: prices[0], high: prices.at(-1)!,
      median: roundPrice(prices.length % 2 ? prices[mid] : (prices[mid - 1] + prices[mid]) / 2),
      sample_listings: rows.map(e => e.url) };
  };
  const names = [...new Set(items.map(e => e.platform))];
  const platforms = names.map(name => ({ name, ...summary(name) }));
  const prices = items.map(e => e.priceNZD);
  const low = prices.length ? Math.min(...prices, roundPrice(estimatedValue * 0.85)) : 0;
  const high = prices.length ? Math.max(...prices, roundPrice(estimatedValue * 1.15)) : 0;
  return {
    low, high, quickSalePrice: roundPrice(estimatedValue * 0.85),
    balancedPrice: estimatedValue, maxProfitPrice: roundPrice(estimatedValue * 1.15),
    marketOutput: {
      trademe: summary('Trade Me'), facebook: summary('Facebook Marketplace'), ebay: summary('eBay'),
      trend: 'unknown', recommended_price: estimatedValue,
      best_platform: names.length ? names.sort((a, b) => items.filter(e => e.platform === b).length - items.filter(e => e.platform === a).length)[0] : 'Unavailable',
      platforms
    }
  };
}
