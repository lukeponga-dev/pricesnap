// =========================================================
// PriceSnap Unified Valuation Engine - Master Pipeline Entry
// =========================================================

import { randomUUID } from 'node:crypto';
import { modelName } from './provider';
import { ENGINE_VERSION, DEFAULT_CURRENCY } from './config';
import { IdentifiedProduct, CleanEvidenceItem, ValuationResult, EngineOptions } from './types';
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
 * 9. Calculate range and asking strategies
 * 10. Score confidence
 */
export async function runValuationEngine(
  image: Buffer | string,
  options: EngineOptions = {},
  dependencies = { identifyProduct, groundedSearch }
): Promise<ValuationResult> {
  const startTime = Date.now();
  const scanId = randomUUID();
  const timestamp = new Date().toISOString();

  // 1. Identify Product & Condition
  options.onProgress?.('identifying');
  const product: IdentifiedProduct = await dependencies.identifyProduct(image, options.signal);

  // 2. Build Search Queries targeting NZ markets
  const queries = buildQueries(product);

  // 3. Perform Grounded Search (Trade Me / Facebook / eBay)
  options.onProgress?.('searching');
  const searchResults = await dependencies.groundedSearch(product, queries, options.signal);
  options.onProgress?.('calculating');

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
  evidence = removeOutliers(evidence).filter(item => !item.isOutlier);

  // Check if enough evidence exists
  if (evidence.length === 0) {
    const result = createInsufficientEvidenceResult(product, scanId, timestamp, startTime);
    result.evidence.totalFound = searchResults.rawListings.length;
    result.grounding = { sources: searchResults.groundingSources, searchEntryPoint: searchResults.searchEntryPoint };
    result.warnings = ['No usable NZD second-hand comparables were found. Try a clearer model label or another item.'];
    return result;
  }

  // Calculate Base Market Value via Weighted Median
  const marketValue = calculateWeightedMedian(evidence);

  // Comparables are requested in similar used condition. Do not discount an
  // already-used price a second time using an uncalibrated multiplier.
  const estimatedValue = marketValue;

  // Calculate Price Range and Marketplace Spreads
  const range = calculateRange(estimatedValue, evidence);

  // Calculate Multi-Factor AI Confidence Score
  const confidence = calculateConfidence(product, evidence);

  const executionTimeMs = Date.now() - startTime;

  // Assemble Canonical Result
  const result: ValuationResult = {
    status: 'success',
    grounding: { sources: searchResults.groundingSources, searchEntryPoint: searchResults.searchEntryPoint },
    warnings: [
      'Estimate based on publicly indexed listings; asking prices are not completed sales.',
      'Cosmetic condition is assessed from the photo. Functionality and hidden specifications are unverified.',
      'Quick-sale and higher-ask prices are suggested strategies, not observed sale outcomes.'
    ],
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
      executionTimeMs,
      model: modelName(),
      pricingBasis: 'NZD used comparables; relevance-weighted median'
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
      estimatedValue: null,
      lowEstimate: null,
      highEstimate: null,
      currency: DEFAULT_CURRENCY,
      recommendedResalePrice: null,
      quickSalePrice: null,
      balancedPrice: null,
      maxProfitPrice: null
    },
    confidence,
    evidence: {
      totalFound: 0,
      filteredCount: 0,
      sources: []
    },
    market: range.marketOutput,
    pricing_guide: {
      quick_sale_price: null,
      balanced_price: null,
      max_profit_price: null
    },
    meta: {
      engineVersion: ENGINE_VERSION,
      timestamp,
      analysisId: scanId,
      executionTimeMs: Date.now() - startTime,
      model: modelName()
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
