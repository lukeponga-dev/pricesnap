// =========================================================
// Valuation Engine Constants & Configuration
// =========================================================

import { MarketplacePlatform, ConditionGrade } from './types';

export const ENGINE_VERSION = '1.0.0';
export const DEFAULT_CURRENCY = 'NZD' as const;

// Market weighting for NZ resale estimation
export const PLATFORM_WEIGHTS: Record<MarketplacePlatform, number> = {
  'Trade Me': 1.35,              // Dominant NZ local marketplace
  'Facebook Marketplace': 1.15,  // Fast local cash & pickup
  'eBay': 0.75,                  // Global secondary market, higher shipping friction
  'Other NZ Retailer': 0.85      // Local electronics / pawn retailer
};

// Target marketplace default margins & trends
export const PLATFORM_PRICE_OFFSETS: Record<MarketplacePlatform, number> = {
  'Trade Me': 1.0,               // Benchmark standard
  'Facebook Marketplace': 0.92,  // Typically slightly lower for quick cash pickup
  'eBay': 1.08,                  // Global price before import fees
  'Other NZ Retailer': 0.95
};

// Exchange rates to NZD (fallback reference table)
export const EXCHANGE_RATES_TO_NZD: Record<string, number> = {
  NZD: 1.0,
  NZ$: 1.0,
  AUD: 1.09,
  AU$: 1.09,
  USD: 1.66,
  US$: 1.66,
  '$': 1.0, // Assume NZ$ by default in local context
  GBP: 2.12,
  '£': 2.12,
  EUR: 1.80,
  '€': 1.80,
  JPY: 0.011,
  '¥': 0.011,
  CAD: 1.23
};

// Multipliers applied to calculated base market value based on condition
export const CONDITION_MULTIPLIERS: Record<ConditionGrade, number> = {
  'A+': 1.05,  // Brand new in box / immaculate
  'A':  1.00,  // Like new / minor micro-handling
  'A-': 0.92,  // Excellent condition with very light cosmetic trace
  'B':  0.80,  // Good working condition with visible minor wear
  'C':  0.62,  // Fair condition, noticeable scratches/scuffs or missing minor accessory
  'D':  0.40   // Poor condition, heavy cosmetic wear or degraded battery
};

// Benchmark catalog for instant deterministic fallbacks / offline testing
export interface CatalogPreset {
  category: string;
  name: string;
  brand: string;
  basePriceNZD: number;
  conditionScore: number;
  conditionGrade: ConditionGrade;
  defects: string[];
  bestPlatform: MarketplacePlatform;
  trend: 'rising' | 'stable' | 'falling';
  sampleListings: string[];
}

export const BENCHMARK_CATALOG: CatalogPreset[] = [
  {
    category: 'Sneakers & Footwear',
    name: 'Nike Air Jordan 1 Retro High OG "Chicago"',
    brand: 'Nike',
    basePriceNZD: 340,
    conditionScore: 8,
    conditionGrade: 'A-',
    defects: ['Subtle creasing across toe box leather', 'Light sole discoloration'],
    bestPlatform: 'Trade Me',
    trend: 'rising',
    sampleListings: [
      'https://www.trademe.co.nz/a/marketplace/clothing/mens-shoes/sneakers/listing/jordan-1-chicago',
      'https://www.facebook.com/marketplace/auckland/item/jordan1-og',
      'https://www.ebay.com/itm/nike-air-jordan-1-retro-high'
    ]
  },
  {
    category: 'Audio & Electronics',
    name: 'Sony WH-1000XM4 Noise Canceling Headphones',
    brand: 'Sony',
    basePriceNZD: 280,
    conditionScore: 9,
    conditionGrade: 'A',
    defects: ['Minimal headband wear', 'Clean earpads, ANC verified'],
    bestPlatform: 'Facebook Marketplace',
    trend: 'rising',
    sampleListings: [
      'https://www.trademe.co.nz/a/marketplace/electronics-photography/home-audio/headphones/listing/sony-xm4',
      'https://www.facebook.com/marketplace/auckland/item/sony-wh1000xm4',
      'https://www.ebay.com/itm/sony-wh-1000xm4-black'
    ]
  },
  {
    category: 'Gaming Consoles',
    name: 'Nintendo Switch OLED Console (White)',
    brand: 'Nintendo',
    basePriceNZD: 395,
    conditionScore: 9,
    conditionGrade: 'A',
    defects: ['Pristine OLED panel, dock and white Joy-Cons included'],
    bestPlatform: 'Trade Me',
    trend: 'rising',
    sampleListings: [
      'https://www.trademe.co.nz/a/marketplace/gaming/nintendo/consoles/switch-oled-white',
      'https://www.facebook.com/marketplace/auckland/item/switch-oled'
    ]
  },
  {
    category: 'Footwear & Boots',
    name: 'R.M. Williams Comfort Craftsman Boots (Chestnut Leather)',
    brand: 'R.M. Williams',
    basePriceNZD: 360,
    conditionScore: 8,
    conditionGrade: 'A-',
    defects: ['Natural leather grain creasing', 'Good condition comfort rubber soles'],
    bestPlatform: 'Trade Me',
    trend: 'rising',
    sampleListings: [
      'https://www.trademe.co.nz/a/marketplace/clothing/mens-shoes/boots/rm-williams-craftsman',
      'https://www.ebay.com/itm/rm-williams-comfort-craftsman-chestnut'
    ]
  },
  {
    category: 'Smartphones',
    name: 'Apple iPhone 13 128GB (Midnight)',
    brand: 'Apple',
    basePriceNZD: 580,
    conditionScore: 8,
    conditionGrade: 'A-',
    defects: ['87% battery health', 'Micro-scratches on aluminum bezel border'],
    bestPlatform: 'Trade Me',
    trend: 'stable',
    sampleListings: [
      'https://www.trademe.co.nz/a/marketplace/mobile-phones/apple-iphone/iphone-13/listing/iphone-13-128gb',
      'https://www.facebook.com/marketplace/auckland/item/iphone13-128gb'
    ]
  },
  {
    category: 'Cameras & Optics',
    name: 'Fujifilm X100V Digital Camera (Silver)',
    brand: 'Fujifilm',
    basePriceNZD: 1950,
    conditionScore: 9,
    conditionGrade: 'A',
    defects: ['Low shutter count under 3,500', 'Clean front element'],
    bestPlatform: 'Trade Me',
    trend: 'rising',
    sampleListings: [
      'https://www.trademe.co.nz/a/marketplace/electronics-photography/digital-cameras/fujifilm/x100v',
      'https://www.ebay.com/itm/fujifilm-x100v-silver'
    ]
  },
  {
    category: 'Power Tools',
    name: 'Makita 18V LXT Brushless Cordless Drill Driver',
    brand: 'Makita',
    basePriceNZD: 175,
    conditionScore: 7,
    conditionGrade: 'B',
    defects: ['Light cosmetic jobsite scuffs on rubber casing', 'Motor running strong'],
    bestPlatform: 'Facebook Marketplace',
    trend: 'stable',
    sampleListings: [
      'https://www.trademe.co.nz/a/marketplace/building-renovation/tools/power-tools/drills/makita-18v-brushless',
      'https://www.facebook.com/marketplace/auckland/item/makita-18v-drill'
    ]
  }
];
