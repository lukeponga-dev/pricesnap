// =========================================================
// Step 5: Deduplicate Evidence Across Scraped Sources
// =========================================================

import { CleanEvidenceItem } from '../types';

export function deduplicate(evidence: CleanEvidenceItem[]): CleanEvidenceItem[] {
  const seenUrls = new Set<string>();
  const seenSignatures = new Set<string>();
  const uniqueItems: CleanEvidenceItem[] = [];

  for (const item of evidence) {
    // 1. Check direct URL duplicates
    if (item.url && item.url.startsWith('http')) {
      const cleanUrl = item.url.split('?')[0].toLowerCase();
      if (seenUrls.has(cleanUrl)) {
        continue;
      }
      seenUrls.add(cleanUrl);
    }

    // 2. Check content signature duplicate: platform + price + normalized title prefix
    const simplifiedTitle = item.title
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '')
      .slice(0, 20);
    const signature = `${item.platform}:${item.price}:${simplifiedTitle}`;

    if (seenSignatures.has(signature)) {
      continue;
    }
    seenSignatures.add(signature);

    uniqueItems.push(item);
  }

  return uniqueItems;
}
