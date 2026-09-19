// =========================================================
// Step 6: Normalize Foreign Currencies into NZD
// =========================================================

import { CleanEvidenceItem } from '../types';
import { EXCHANGE_RATES_TO_NZD } from '../config';

export function normalizeCurrency(evidence: CleanEvidenceItem[]): CleanEvidenceItem[] {
  return evidence.map(item => {
    const curr = (item.originalCurrency || 'NZD').toUpperCase().trim();
    const rate = EXCHANGE_RATES_TO_NZD[curr] || 1.0;
    
    // Convert price to NZD
    const priceNZD = Math.round(item.originalPrice * rate);

    return {
      ...item,
      priceNZD: Math.max(1, priceNZD),
      price: Math.max(1, priceNZD) // Unified working price
    };
  });
}
