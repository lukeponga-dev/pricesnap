// =========================================================
// PriceSnap Unified Valuation Engine - Master Pipeline Entry
// =========================================================

import { ENGINE_VERSION, DEFAULT_CURRENCY } from './config';
import { IdentifiedProduct, CleanEvidenceItem, ValuationResult } from './types';
import { identifyProduct } from './identification/identifyProduct';
import { buildQueries } from './search/buildQueries';
import { groundedSearch } from './search/groundedSearch';
import { extractEvidence } from './search/extractEvidence';
import { classifyEvidence } from './evidence/classify';
import { scoreRelevance } from './evidence/relevance';
import { filterEvidence } from './evidence/filter';
import { deduplicate } from './evidence/deduplicate';
import { normalizeCurrency } from './pricing/currency';
import { removeOutliers } from './pricing/outliers';
import { calculateWeightedMedian } from './pricing/weightedMedian';
import { applyConditionAdjustment } from './pricing/condition';
import { calculateRange } from './pricing/range';
import { calculateConfidence } from './confidence/calculate';

export * from './types';
export * from './config';
export { identifyProduct } from './identification/identifyProduct';
export { buildQueries } from './search/buildQueries';
export { groundedSearch } from './search/groundedSearch';
export { extractEvidence } from './search/extractEvidence';
export { classifyEvidence } from './evidence/classify';
export { scoreRelevance } from './evidence/relevance';
export { filterEvidence } from './evidence/filter';
export { deduplicate } from './evidence/deduplicate';
export { normalizeCurrency } from './pricing/currency';
export { removeOutliers } from './pricing/outliers';
export { calculateWeightedMedian } from './pricing/weightedMedian';
export { applyConditionAdjustment } from './pricing/condition';
export { calculateRange } from './pricing/range';
export { calculateConfidence } from './confidence/calculate';

/**
 * Main Valuation Engine Orchestrator:
 * Executes the complete 10-step server-side valuation pipeline.
 *
 * 1. Identify product
 * 2. Search market
 * 3. Parse evidence
 * 4. Validate matches & score relevance
 * 5. Deduplicate
 * 6. Normalize NZD
 * 7. Remove outliers
 * 8. Calculate base value
 * 9. Calculate range & condition adjustment
 * 10. Score confidence
 */
export async function runValuationEngine(
  image: Buffer | string
): Promise<ValuationResult> {
  const startTime = Date.now();
  const scanId = Math.random().toString(36).substring(2, 9);
  const timestamp = new Date().toISOString();

  // 1. Identify Product & Condition
  const product: IdentifiedProduct = await identifyProduct(image);

  // 2. Build Search Queries targeting NZ markets
  const queries = buildQueries(product);

  // 3. Perform Grounded Search (Trade Me / Facebook / eBay)
  const searchResults = await groundedSearch(product, queries);

  // 4. Extract Evidence
  const rawEvidence = extractEvidence(searchResults);

  // 5. Classify Evidence
  let evidence: CleanEvidenceItem[] = classifyEvidence(rawEvidence);

  // 6. Score Relevance against Identified Product
  evidence = scoreRelevance(product, evidence);

  // 7. Filter low relevance or junk listings
  evidence = filterEvidence(evidence);

  // 8. Deduplicate
  evidence = deduplicate(evidence);

  // 9. Normalize Currencies into NZD
  evidence = normalizeCurrency(evidence);

  // 10. Remove Outliers via Statistical Envelope
  evidence = removeOutliers(evidence);

  // Check if enough evidence exists
  if (evidence.length === 0) {
    return createInsufficientEvidenceResult(product, scanId, timestamp, startTime);
  }

  // Calculate Base Market Value via Weighted Median
  const marketValue = calculateWeightedMedian(evidence);

  // Apply Condition Adjustment Multiplier
  const estimatedValue = applyConditionAdjustment(
    marketValue,
    product.condition_grade,
    product.condition_score
  );

  // Calculate Price Range and Marketplace Spreads
  const range = calculateRange(estimatedValue, evidence);

  // Calculate Multi-Factor AI Confidence Score
  const confidence = calculateConfidence(product, evidence);

  const executionTimeMs = Date.now() - startTime;

  // Assemble Canonical Result
  const result: ValuationResult = {
    status: 'success',
    valuationEngineVersion: ENGINE_VERSION,
    id: scanId,
    date: timestamp,
    product,
    valuation: {
      estimatedValue,
      lowEstimate: range.low,
      highEstimate: range.high,
      currency: DEFAULT_CURRENCY,
      recommendedResalePrice: estimatedValue,
      quickSalePrice: range.quickSalePrice,
      balancedPrice: range.balancedPrice,
      maxProfitPrice: range.maxProfitPrice
    },
    confidence,
    evidence: {
      totalFound: rawEvidence.length,
      filteredCount: evidence.length,
      sources: evidence
    },
    market: range.marketOutput,
    pricing_guide: {
      quick_sale_price: range.quickSalePrice,
      balanced_price: range.balancedPrice,
      max_profit_price: range.maxProfitPrice
    },
    meta: {
      engineVersion: ENGINE_VERSION,
      timestamp,
      analysisId: scanId,
      executionTimeMs
    },

    // Backward-compatibility aliases for existing web & mobile UI components
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

  return result;
}

function createInsufficientEvidenceResult(
  product: IdentifiedProduct,
  scanId: string,
  timestamp: string,
  startTime: number
): ValuationResult {
  // No synthetic price fallback: insufficient evidence must remain visibly unpriced.
  const estimatedValue = 0;
  const range = calculateRange(estimatedValue, []);
  const confidence = calculateConfidence(product, []);

  return {
    status: 'insufficient_evidence',
    valuationEngineVersion: ENGINE_VERSION,
    id: scanId,
    date: timestamp,
    product,
    valuation: {
      estimatedValue,
      lowEstimate: range.low,
      highEstimate: range.high,
      currency: DEFAULT_CURRENCY,
      recommendedResalePrice: estimatedValue,
      quickSalePrice: range.quickSalePrice,
      balancedPrice: range.balancedPrice,
      maxProfitPrice: range.maxProfitPrice
    },
    confidence,
    evidence: {
      totalFound: 0,
      filteredCount: 0,
      sources: []
    },
    market: range.marketOutput,
    pricing_guide: {
      quick_sale_price: range.quickSalePrice,
      balanced_price: range.balancedPrice,
      max_profit_price: range.maxProfitPrice
    },
    meta: {
      engineVersion: ENGINE_VERSION,
      timestamp,
      analysisId: scanId,
      executionTimeMs: Date.now() - startTime
    },
    item_name: product.name,
    item_category: product.category,
    brand: product.brand,
    condition_score: product.condition_score,
    condition_grade: product.condition_grade,
    defects: product.defects,
    resale_price_nz: undefined
  };
}
