export type Screen = 'home' | 'scanner' | 'analyzing' | 'result' | 'history' | 'settings' | 'pitch';

export interface ProductInfo {
  name: string;
  brand: string;
  category: string;
  condition_grade: string;
  issues?: string[];
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
    grade: string;
    issues: string[];
    summary: string;
  };
  id?: string;
  date?: string;
  isMock?: boolean;
  meta?: {
    timestamp: string;
    analysis_id: string;
  };
}

export type ScanResult = PriceSnapResult;
