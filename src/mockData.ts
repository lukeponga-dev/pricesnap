import { ValuationResult } from './types';
import { ENGINE_VERSION, BENCHMARK_CATALOG } from './lib/valuation-engine/config';
import { applyConditionAdjustment } from './lib/valuation-engine/pricing/condition';
import { calculateRange } from './lib/valuation-engine/pricing/range';
import { calculateConfidence } from './lib/valuation-engine/confidence/calculate';
import { CleanEvidenceItem } from './lib/valuation-engine/types';

export function generateMockResult(): ValuationResult {
  const catalogItem = BENCHMARK_CATALOG[Math.floor(Math.random() * BENCHMARK_CATALOG.length)];
  const scanId = Math.random().toString(36).substring(2, 9);
  const timestamp = new Date().toISOString();

  const product = {
    name: catalogItem.name,
    item_name: catalogItem.name,
    brand: catalogItem.brand,
    category: catalogItem.category,
    item_category: catalogItem.category,
    condition_score: catalogItem.conditionScore,
    condition_grade: catalogItem.conditionGrade,
    condition: {
      score: catalogItem.conditionScore,
      grade: catalogItem.conditionGrade,
      defects: catalogItem.defects,
      issues: catalogItem.defects,
      summary: `Identified as ${catalogItem.name} in Grade ${catalogItem.conditionGrade} condition.`
    },
    defects: catalogItem.defects,
    issues: catalogItem.defects,
    summary: `Identified as ${catalogItem.name} in Grade ${catalogItem.conditionGrade} condition.`,
    certaintyScore: 0.94,
    suggestedQueries: [
      `${catalogItem.brand} ${catalogItem.name} Trade Me NZ`,
      `${catalogItem.name} Facebook Marketplace NZ`
    ]
  };

  const estimatedValue = applyConditionAdjustment(
    catalogItem.basePriceNZD,
    catalogItem.conditionGrade,
    catalogItem.conditionScore
  );

  const mockEvidence: CleanEvidenceItem[] = [
    {
      id: 'tm-1',
      title: `${catalogItem.brand} ${catalogItem.name} (Great Condition)`,
      price: Math.round(catalogItem.basePriceNZD * 1.02),
      originalPrice: Math.round(catalogItem.basePriceNZD * 1.02),
      originalCurrency: 'NZD',
      priceNZD: Math.round(catalogItem.basePriceNZD * 1.02),
      platform: 'Trade Me',
      url: catalogItem.sampleListings[0] || 'https://www.trademe.co.nz',
      condition: 'Very Good',
      relevanceScore: 0.98,
      isOutlier: false,
      weight: 1.35
    },
    {
      id: 'fb-1',
      title: `${catalogItem.name} cash pickup Auckland`,
      price: Math.round(catalogItem.basePriceNZD * 0.91),
      originalPrice: Math.round(catalogItem.basePriceNZD * 0.91),
      originalCurrency: 'NZD',
      priceNZD: Math.round(catalogItem.basePriceNZD * 0.91),
      platform: 'Facebook Marketplace',
      url: catalogItem.sampleListings[1] || 'https://www.facebook.com/marketplace',
      condition: 'Clean',
      relevanceScore: 0.92,
      isOutlier: false,
      weight: 1.15
    },
    {
      id: 'eb-1',
      title: `${catalogItem.name} Global Verified`,
      price: Math.round(catalogItem.basePriceNZD * 1.06),
      originalPrice: Math.round(catalogItem.basePriceNZD * 1.06 / 1.66),
      originalCurrency: 'USD',
      priceNZD: Math.round(catalogItem.basePriceNZD * 1.06),
      platform: 'eBay',
      url: catalogItem.sampleListings[2] || 'https://www.ebay.com',
      condition: 'Pre-Owned',
      relevanceScore: 0.88,
      isOutlier: false,
      weight: 0.75
    }
  ];

  const range = calculateRange(estimatedValue, mockEvidence);
  const confidence = calculateConfidence(product, mockEvidence);

  return {
    status: 'success',
    valuationEngineVersion: ENGINE_VERSION,
    id: scanId,
    date: timestamp,
    isMock: true,
    product,
    valuation: {
      estimatedValue,
      lowEstimate: range.low,
      highEstimate: range.high,
      currency: 'NZD',
      recommendedResalePrice: estimatedValue,
      quickSalePrice: range.quickSalePrice,
      balancedPrice: range.balancedPrice,
      maxProfitPrice: range.maxProfitPrice
    },
    confidence,
    evidence: {
      totalFound: mockEvidence.length,
      filteredCount: mockEvidence.length,
      sources: mockEvidence
    },
    market: range.marketOutput,
    pricing_guide: {
      quick_sale_price: range.quickSalePrice,
      balanced_price: range.balancedPrice,
      maxProfit_price: range.maxProfitPrice
    } as any,
    meta: {
      engineVersion: ENGINE_VERSION,
      timestamp,
      analysisId: scanId,
      executionTimeMs: 42
    },
    item_name: product.name,
    item_category: product.category,
    brand: product.brand,
    condition_score: product.condition_score,
    condition_grade: product.condition_grade,
    defects: product.defects,
    resale_price_nz: estimatedValue,
    platforms: range.marketOutput.platforms.map(p => ({
      name: p.name,
      low: p.low,
      median: p.median,
      high: p.high,
      data: {
        low: p.low,
        median: p.median,
        high: p.high,
        sample_listings: p.sample_listings
      }
    }))
  };
}
