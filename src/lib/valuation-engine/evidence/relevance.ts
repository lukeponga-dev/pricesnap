// =========================================================
// Step 4: Score Relevance of Evidence Listings
// =========================================================

import { IdentifiedProduct, CleanEvidenceItem } from '../types';

export function scoreRelevance(
  product: IdentifiedProduct,
  evidence: CleanEvidenceItem[]
): CleanEvidenceItem[] {
  const brandLower = product.brand.toLowerCase();
  const nameTokens = product.name
    .toLowerCase()
    .replace(/[()[\]",]/g, '')
    .split(/\s+/)
    .filter(t => t.length > 2 && t !== 'the' && t !== 'and' && t !== 'for');

  const accessoryKeywords = [
    'case only', 'box only', 'cover only', 'cable', 'charger', 'strap only',
    'replacement parts', 'for parts', 'broken', 'repair', 'earpads only',
    'dock only', 'power cord', 'manual', 'poster', 'keychain'
  ];

  return evidence.map(item => {
    const titleLower = item.title.toLowerCase();
    let score = 0.5; // Baseline score

    // 1. Brand match
    if (brandLower && brandLower !== 'generic / unbranded' && titleLower.includes(brandLower)) {
      score += 0.2;
    }

    // 2. Token overlap match
    let matchCount = 0;
    for (const token of nameTokens) {
      if (titleLower.includes(token)) {
        matchCount++;
      }
    }
    const tokenRatio = nameTokens.length > 0 ? matchCount / nameTokens.length : 0.5;
    score += tokenRatio * 0.3;

    // 3. Accessory / Junk Penalty (if the main item is not just an accessory)
    const isMainProductAccessory = product.category.toLowerCase().includes('accessory') ||
                                   product.name.toLowerCase().includes('case');
    if (!isMainProductAccessory) {
      for (const kw of accessoryKeywords) {
        if (titleLower.includes(kw)) {
          score -= 0.55; // severe penalty
          break;
        }
      }
    }

    // Clamp score between 0.05 and 1.0
    const finalScore = Math.max(0.05, Math.min(1.0, score));

    // Update weight combined with relevance
    return {
      ...item,
      relevanceScore: Number(finalScore.toFixed(3)),
      weight: Number((item.weight * finalScore).toFixed(3))
    };
  });
}
