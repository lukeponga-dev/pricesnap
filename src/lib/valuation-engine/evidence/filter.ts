import { CleanEvidenceItem } from '../types';
export function filterEvidence(evidence: CleanEvidenceItem[]): CleanEvidenceItem[] {
  return evidence.filter(item => Number.isFinite(item.price) && item.price > 0 &&
    item.relevanceScore >= 0.5 && item.title.length >= 3 &&
    /used|pre.?owned|second.?hand/i.test(item.condition || '') && item.priceType !== 'retail');
}
