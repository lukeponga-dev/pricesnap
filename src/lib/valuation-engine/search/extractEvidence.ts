// =========================================================
// Step 3: Extract Evidence from Grounded Search Results
// =========================================================

import { RawEvidenceListing } from '../types';
import { GroundedSearchResult } from './groundedSearch';

export function extractEvidence(searchResult: GroundedSearchResult): RawEvidenceListing[] {
  const listings: RawEvidenceListing[] = [];

  if (Array.isArray(searchResult.rawListings)) {
    for (const item of searchResult.rawListings) {
      if (item && item.price && !isNaN(Number(item.price)) && Number(item.price) > 0) {
        listings.push({
          id: item.id || `ev-${Math.random().toString(36).substring(2, 8)}`,
          title: item.title || 'Market Listing',
          price: Number(item.price),
          currency: item.currency || 'NZD',
          platform: item.platform || 'Trade Me',
          url: item.url || '',
          conditionMentioned: item.conditionMentioned || 'Used',
          snippet: item.snippet || ''
        });
      }
    }
  }

  return listings;
}
