import { RawEvidenceListing } from '../types';
import { GroundedSearchResult, publicUrl } from './groundedSearch';

export function extractEvidence(result: GroundedSearchResult): RawEvidenceListing[] {
  return result.rawListings.filter(item =>
    Number.isFinite(item.price) && item.price > 0 && item.title &&
    item.currency === 'NZD' && publicUrl(item.groundingUrl) &&
    item.url === item.groundingUrl && ['asking', 'sold'].includes(item.priceType || '')
  );
}
