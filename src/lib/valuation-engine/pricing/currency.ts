import { CleanEvidenceItem } from '../types';
// No silent static FX conversion. Foreign/unknown currencies are excluded.
export function normalizeCurrency(evidence: CleanEvidenceItem[]): CleanEvidenceItem[] {
  return evidence.filter(item => item.originalCurrency === 'NZD' && Number.isFinite(item.originalPrice) && item.originalPrice > 0)
    .map(item => ({ ...item, priceNZD: item.originalPrice, price: item.originalPrice }));
}
