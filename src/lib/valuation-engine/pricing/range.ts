// =========================================================
// Step 9: Calculate Valuation Ranges and Platform Spreads
// =========================================================

import { CleanEvidenceItem, MarketOutput, PlatformPriceSummary, MarketplacePlatform } from '../types';
import { PLATFORM_PRICE_OFFSETS } from '../config';

export interface PriceRangeResult {
  low: number;
  high: number;
  quickSalePrice: number;
  balancedPrice: number;
  maxProfitPrice: number;
  marketOutput: MarketOutput;
}

export function calculateRange(
  estimatedValue: number,
  evidence: CleanEvidenceItem[]
): PriceRangeResult {
  const validItems = evidence.filter(e => !e.isOutlier);
  const itemsToUse = validItems.length > 0 ? validItems : evidence;

  let lowEstimate: number;
  let highEstimate: number;

  if (itemsToUse.length >= 2) {
    const prices = itemsToUse.map(e => e.priceNZD).sort((a, b) => a - b);
    const p20Idx = Math.floor(prices.length * 0.2);
    const p80Idx = Math.min(prices.length - 1, Math.ceil(prices.length * 0.8));

    lowEstimate = Math.min(prices[p20Idx], Math.round(estimatedValue * 0.88));
    highEstimate = Math.max(prices[p80Idx], Math.round(estimatedValue * 1.15));
  } else {
    lowEstimate = Math.round(estimatedValue * 0.85);
    highEstimate = Math.round(estimatedValue * 1.18);
  }

  // Ensure high > low
  if (highEstimate <= lowEstimate) {
    highEstimate = Math.round(lowEstimate * 1.25);
  }

  // Quick sale / Balanced / Max profit pricing guides
  const quickSalePrice = Math.round(estimatedValue * 0.86);
  const balancedPrice = estimatedValue;
  const maxProfitPrice = Math.round(estimatedValue * 1.14);

  // Group evidence by platform for specific platform summaries
  const getPlatformSummary = (platformName: MarketplacePlatform): PlatformPriceSummary => {
    const platItems = itemsToUse.filter(i => i.platform === platformName);
    const baseOffset = PLATFORM_PRICE_OFFSETS[platformName] || 1.0;
    const platMedianBase = Math.round(estimatedValue * baseOffset);

    if (platItems.length > 0) {
      const pPrices = platItems.map(i => i.priceNZD).sort((a, b) => a - b);
      const pLow = pPrices[0];
      const pHigh = pPrices[pPrices.length - 1];
      const pMedian = Math.round(
        pPrices.length % 2 === 0
          ? (pPrices[Math.floor(pPrices.length / 2) - 1] + pPrices[Math.floor(pPrices.length / 2)]) / 2
          : pPrices[Math.floor(pPrices.length / 2)]
      );

      return {
        low: pLow,
        median: pMedian,
        high: pHigh,
        sample_listings: platItems.map(i => i.url).filter(Boolean).slice(0, 3)
      };
    }

    return {
      low: Math.round(platMedianBase * 0.88),
      median: platMedianBase,
      high: Math.round(platMedianBase * 1.14),
      sample_listings: []
    };
  };

  const trademe = getPlatformSummary('Trade Me');
  const facebook = getPlatformSummary('Facebook Marketplace');
  const ebay = getPlatformSummary('eBay');

  const platforms = [
    {
      name: 'Trade Me (NZ)',
      low: trademe.low,
      median: trademe.median,
      high: trademe.high,
      sample_listings: trademe.sample_listings
    },
    {
      name: 'Facebook Marketplace',
      low: facebook.low,
      median: facebook.median,
      high: facebook.high,
      sample_listings: facebook.sample_listings
    },
    {
      name: 'eBay (Global NZD)',
      low: ebay.low,
      median: ebay.median,
      high: ebay.high,
      sample_listings: ebay.sample_listings
    }
  ];

  return {
    low: lowEstimate,
    high: highEstimate,
    quickSalePrice,
    balancedPrice,
    maxProfitPrice,
    marketOutput: {
      trademe,
      facebook,
      ebay,
      trend: 'rising',
      recommended_price: estimatedValue,
      best_platform: 'Trade Me',
      platforms
    }
  };
}
