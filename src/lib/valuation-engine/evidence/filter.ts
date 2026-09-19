// =========================================================
// Step 4: Filter Unusable or Low-Relevance Evidence
// =========================================================

import { CleanEvidenceItem } from '../types';

export function filterEvidence(evidence: CleanEvidenceItem[]): CleanEvidenceItem[] {
  return evidence.filter(item => {
    // Must have positive valid price
    if (!item.price || isNaN(item.price) || item.price <= 2) {
      return false;
    }

    // Must meet minimum relevance threshold
    if (item.relevanceScore < 0.20) {
      return false;
    }

    // Must have a meaningful title
    if (!item.title || item.title.length < 3) {
      return false;
    }

    return true;
  });
}
