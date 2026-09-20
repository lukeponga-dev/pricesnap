// =========================================================
// Step 10: Canonical Confidence Scoring Engine
// =========================================================

import { IdentifiedProduct, CleanEvidenceItem, ConfidenceOutput } from '../types';

export function calculateConfidence(
  product: IdentifiedProduct,
  evidence: CleanEvidenceItem[]
): ConfidenceOutput {
  const validEvidence = evidence.filter(e => !e.isOutlier);
  const sampleSize = validEvidence.length;

  // 1. Identification Factor (0.0 to 1.0)
  const idFactor = product.certaintyScore ?? 0.50;

  // 2. Sample Size Factor (0.0 to 1.0)
  // Optimal sample size is 4-8 comparable listings
  let sampleFactor = 0.5;
  if (sampleSize >= 6) sampleFactor = 1.0;
  else if (sampleSize >= 4) sampleFactor = 0.90;
  else if (sampleSize >= 2) sampleFactor = 0.75;
  else if (sampleSize === 1) sampleFactor = 0.55;
  else sampleFactor = 0.35;

  // 3. Price Spread Consistency Factor (0.0 to 1.0)
  let spreadFactor = sampleSize >= 2 ? 0.85 : 0.35;
  if (sampleSize >= 2) {
    const prices = validEvidence.map(e => e.priceNZD).sort((a, b) => a - b);
    const minP = prices[0];
    const maxP = prices[prices.length - 1];
    const avgP = prices.reduce((a, b) => a + b, 0) / prices.length;
    const spreadRatio = avgP > 0 ? (maxP - minP) / avgP : 0.5;

    if (spreadRatio <= 0.25) spreadFactor = 0.98; // Very tight clustering
    else if (spreadRatio <= 0.50) spreadFactor = 0.88;
    else if (spreadRatio <= 0.80) spreadFactor = 0.70;
    else spreadFactor = 0.50; // High dispersion
  }

  // 4. Source Reliability Factor (0.0 to 1.0)
  const hasTradeMe = validEvidence.some(e => e.platform === 'Trade Me');
  const hasFacebook = validEvidence.some(e => e.platform === 'Facebook Marketplace');
  let sourceFactor = sampleSize === 0 ? 0.25 : 0.65;
  if (hasTradeMe && hasFacebook) sourceFactor = 0.96;
  else if (hasTradeMe) sourceFactor = 0.90;

  // Weighted canonical formula:
  // 35% Identification + 30% Sample size + 20% Price consistency + 15% Source reliability
  const rawScore = (
    idFactor * 0.35 +
    sampleFactor * 0.30 +
    spreadFactor * 0.20 +
    sourceFactor * 0.15
  );

  const evidenceCap = sampleSize === 0 ? 0.35 : sampleSize === 1 ? 0.55 : sampleSize < 4 ? 0.75 : 0.99;
  const score = Math.max(0.10, Math.min(evidenceCap, Number(rawScore.toFixed(3))));
  const percentage = Math.round(score * 100);

  let level: 'HIGH' | 'MODERATE' | 'LOW' = 'HIGH';
  let color: 'green' | 'orange' | 'red' = 'green';

  if (percentage >= 82) {
    level = 'HIGH';
    color = 'green';
  } else if (percentage >= 60) {
    level = 'MODERATE';
    color = 'orange';
  } else {
    level = 'LOW';
    color = 'red';
  }

  const reasons: string[] = [];
  if (idFactor >= 0.9) {
    reasons.push(`High certainty visual match for ${product.brand} ${product.name}.`);
  }
  if (sampleSize >= 3) {
    reasons.push(`Compared with ${sampleSize} relevant marketplace listings found during this scan.`);
  }
  if (spreadFactor >= 0.85) {
    reasons.push('Secondary market listing prices show tight pricing clustering.');
  }
  if (hasTradeMe) {
    reasons.push('Includes Trade Me marketplace evidence.');
  }

  if (sampleSize === 0) {
    reasons.push('No trustworthy priced marketplace comparables were found; no evidence-based valuation was produced.');
  }

  return {
    score,
    percentage,
    level,
    color,
    reasons,
    factors: {
      identification: Number(idFactor.toFixed(2)),
      sampleSize: Number(sampleFactor.toFixed(2)),
      priceSpread: Number(spreadFactor.toFixed(2)),
      sourceReliability: Number(sourceFactor.toFixed(2))
    }
  };
}
