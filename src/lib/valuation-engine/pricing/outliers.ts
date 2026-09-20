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

  const median = (values: number[]) => {
    const mid = Math.floor(values.length / 2);
    return values.length % 2 ? values[mid] : (values[mid - 1] + values[mid]) / 2;
  };
  const middle = median(sortedPrices);
  const mad = median(sortedPrices.map(p => Math.abs(p - middle)).sort((a, b) => a - b));
  const q1 = middle - Math.max(mad, middle * 0.15);
  const q3 = middle + Math.max(mad, middle * 0.15);
  const iqr = q3 - q1;

  // Interquartile bounds with minimum reasonable envelope
  const lowerBound = Math.max(0, q1 - 1.5 * iqr);
  const upperBound = q3 + 1.5 * iqr;

  return evidence.map(item => {
    const isOutlier = item.priceNZD < lowerBound || item.priceNZD > upperBound;
    return {
      ...item,
      isOutlier
    };
  });
}
