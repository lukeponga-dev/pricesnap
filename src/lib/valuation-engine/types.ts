// =========================================================
// PriceSnap Unified Valuation Engine - Core Type Definitions
// =========================================================

export type ConditionGrade = 'A+' | 'A' | 'A-' | 'B' | 'C' | 'D';

export type MarketplacePlatform = 'Trade Me' | 'Facebook Marketplace' | 'eBay' | 'Other NZ Retailer';

export type MarketTrend = 'rising' | 'stable' | 'falling';

export interface IdentifiedProduct {
  name: string;
  item_name: string;
  brand: string;
  category: string;
  item_category: string;
  modelVariant?: string;
  condition_score: number; // 1 to 10
  condition_grade: ConditionGrade;
  condition: {
    score: number;
    grade: ConditionGrade;
    defects: string[];
    issues: string[];
    summary: string;
  };
  defects: string[];
  issues: string[];
  summary: string;
  certaintyScore: number; // 0.0 to 1.0
  suggestedQueries: string[];
  visualAttributes?: Record<string, string>;
}

export interface RawEvidenceListing {
  id: string;
  title: string;
  price: number;
  currency?: string;
  platform?: string;
  url?: string;
  snippet?: string;
  conditionMentioned?: string;
  dateMentioned?: string;
}

export interface CleanEvidenceItem {
  id: string;
  title: string;
  price: number;
  originalPrice: number;
  originalCurrency: string;
  priceNZD: number;
  platform: MarketplacePlatform;
  url: string;
  condition?: string;
  relevanceScore: number; // 0.0 to 1.0
  isOutlier: boolean;
  weight: number;
}

export interface PlatformPriceSummary {
  low: number;
  median: number;
  high: number;
  sample_listings: string[];
}

export interface ValuationOutput {
  estimatedValue: number;
  lowEstimate: number;
  highEstimate: number;
  currency: 'NZD';
  recommendedResalePrice: number;
  quickSalePrice: number;
  balancedPrice: number;
  maxProfitPrice: number;
}

export interface ConfidenceOutput {
  score: number; // 0.0 to 1.0
  percentage: number; // 0 to 100
  level: 'HIGH' | 'MODERATE' | 'LOW';
  color: 'green' | 'orange' | 'red';
  reasons: string[];
  factors: {
    identification: number;
    sampleSize: number;
    priceSpread: number;
    sourceReliability: number;
  };
}

export interface MarketOutput {
  trademe: PlatformPriceSummary;
  facebook: PlatformPriceSummary;
  ebay: PlatformPriceSummary;
  trend: MarketTrend;
  recommended_price: number;
  best_platform: string;
  platforms: Array<{
    name: string;
    low: number;
    median: number;
    high: number;
    sample_listings: string[];
  }>;
}

export interface ValuationResult {
  status: 'success' | 'insufficient_evidence' | 'error';
  valuationEngineVersion: string;
  id: string;
  date: string;
  isMock?: boolean;
  product: IdentifiedProduct;
  valuation: ValuationOutput;
  confidence: ConfidenceOutput;
  evidence: {
    totalFound: number;
    filteredCount: number;
    sources: CleanEvidenceItem[];
  };
  market: MarketOutput;
  pricing_guide: {
    quick_sale_price: number;
    balanced_price: number;
    max_profit_price: number;
  };
  meta: {
    engineVersion: string;
    timestamp: string;
    analysisId: string;
    executionTimeMs?: number;
  };

  // Backward-compatibility accessors for existing UI components
  item_name?: string;
  item_category?: string;
  brand?: string;
  condition_score?: number;
  condition_grade?: string;
  defects?: string[];
  resale_price_nz?: number;
  platforms?: Array<{
    name: string;
    low?: number;
    median?: number;
    high?: number;
    data?: PlatformPriceSummary;
  }>;
}
