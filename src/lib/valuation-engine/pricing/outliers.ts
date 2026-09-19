// =========================================================
// Step 7: Remove Price Outliers via IQR / Statistical Trimming
// =========================================================

import { CleanEvidenceItem } from '../types';

export function removeOutliers(evidence: CleanEvidenceItem[]): CleanEvidenceItem[] {
  if (evidence.length < 4) {
    // Too few samples for strict IQR trimming; mark all as valid
    return evidence.map(e => ({ ...e, isOutlier: false }));
  }

  const sortedPrices = evidence
    .map(e => e.priceNZD)
    .sort((a, b) => a - b);

  const n = sortedPrices.length;
  const q1Index = Math.floor(n * 0.25);
  const q3Index = Math.floor(n * 0.75);

  const q1 = sortedPrices[q1Index];
  const q3 = sortedPrices[q3Index];
  const iqr = q3 - q1;

  // Interquartile bounds with minimum reasonable envelope
  const lowerBound = Math.max(5, q1 - 1.5 * iqr);
  const upperBound = q3 + 1.5 * iqr;

  return evidence.map(item => {
    const isOutlier = item.priceNZD < lowerBound || item.priceNZD > upperBound;
    return {
      ...item,
      isOutlier
    };
  });
}
