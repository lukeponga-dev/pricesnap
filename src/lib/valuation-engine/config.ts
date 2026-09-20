// =========================================================
// Valuation Engine Constants & Configuration
// =========================================================

import { MarketplacePlatform, ConditionGrade } from './types';

export const ENGINE_VERSION = '1.1.0';
export const DEFAULT_CURRENCY = 'NZD' as const;

// Market weighting for NZ resale estimation
export const PLATFORM_WEIGHTS: Record<MarketplacePlatform, number> = {
  'Trade Me': 1.35,              // Dominant NZ local marketplace
  'Facebook Marketplace': 1.15,  // Fast local cash & pickup
  'eBay': 0.75,                  // Global secondary market, higher shipping friction
  'Other NZ Retailer': 0.85      // Local electronics / pawn retailer
};

// Optional cosmetic grade ratios; the live pipeline uses condition-matched evidence
// directly to avoid discounting an already used asking price a second time.
export const CONDITION_MULTIPLIERS: Record<ConditionGrade, number> = {
  'A+': 1.05, A: 1, 'A-': 0.92, B: 0.8, C: 0.62, D: 0.4
};
