export type Screen = 'home' | 'scanner' | 'analyzing' | 'result' | 'history' | 'settings' | 'pitch' | 'privacy';

export interface ProductInfo {
  name: string;
  item_name?: string;
  brand: string | null;
  category: string;
  item_category?: string;
  condition_score?: number; // 1-10
  condition_grade?: string; // A, B, C, D
  defects?: string[];
  issues?: string[];
  resale_price_nz?: number;
  confidence: number;
  confidence_color?: string;
  summary?: string;
}

export interface MarketPlatformData {
  low: number;
  median: number;
  high: number;
  sample_listings?: string[];
}

export interface MarketInfo {
  trademe: MarketPlatformData;
  facebook: MarketPlatformData;
  ebay: MarketPlatformData;
  trend: string;
  recommended_price: number;
  best_platform: string;
}

export interface PriceSnapResult {
  product: ProductInfo;
  market: MarketInfo;
  condition?: {
    score?: number;
    grade: string;
    issues: string[];
    summary: string;
  };
  id?: string;
  date?: string;
  isMock?: boolean;
  item_category?: string;
  item_name?: string;
  brand?: string | null;
  condition_score?: number;
  defects?: string[];
  resale_price_nz?: number;
  confidence?: number;
  price?: {
    low: number;
    average: number;
    high: number;
  };
  platforms?: Array<{
    name: string;
    low?: number;
    median?: number;
    high?: number;
    data?: MarketPlatformData;
  }>;
  emoji?: string;
  name?: string;
  meta?: {
    timestamp: string;
    analysis_id: string;
  };
}

export type ScanResult = PriceSnapResult;
