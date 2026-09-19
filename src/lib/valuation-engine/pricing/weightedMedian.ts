// =========================================================
// Step 8: Calculate Weighted Median Base Market Price
// =========================================================

import { CleanEvidenceItem } from '../types';

export function calculateWeightedMedian(evidence: CleanEvidenceItem[]): number {
  const validItems = evidence.filter(e => !e.isOutlier);
  const itemsToUse = validItems.length > 0 ? validItems : evidence;

  if (itemsToUse.length === 0) {
    return 100; // default fallback
  }

  if (itemsToUse.length === 1) {
    return itemsToUse[0].priceNZD;
  }

  // Sort by price ascending
  const sorted = [...itemsToUse].sort((a, b) => a.priceNZD - b.priceNZD);

  const totalWeight = sorted.reduce((sum, item) => sum + (item.weight || 1), 0);
  const halfWeight = totalWeight / 2;

  let cumulativeWeight = 0;
  for (let i = 0; i < sorted.length; i++) {
    cumulativeWeight += sorted[i].weight || 1;
    if (cumulativeWeight >= halfWeight) {
      // If exactly at boundary and not last item, average with next
      if (cumulativeWeight === halfWeight && i < sorted.length - 1) {
        return Math.round((sorted[i].priceNZD + sorted[i + 1].priceNZD) / 2);
      }
      return Math.round(sorted[i].priceNZD);
    }
  }

  // Fallback to simple median
  const mid = Math.floor(sorted.length / 2);
  return Math.round(
    sorted.length % 2 === 0
      ? (sorted[mid - 1].priceNZD + sorted[mid].priceNZD) / 2
      : sorted[mid].priceNZD
  );
}
