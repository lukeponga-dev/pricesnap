// =========================================================
// Step 4: Classify Evidence by Platform and Nature
// =========================================================

import { RawEvidenceListing, CleanEvidenceItem, MarketplacePlatform } from '../types';
import { PLATFORM_WEIGHTS } from '../config';

export function classifyEvidence(
  rawListings: RawEvidenceListing[]
): CleanEvidenceItem[] {
  return rawListings.map((raw) => {
    const rawPlatform = (raw.platform || '').toLowerCase();
    const url = (raw.url || '').toLowerCase();

    let platform: MarketplacePlatform = 'Other NZ Retailer';

    if (rawPlatform.includes('trade') || url.includes('trademe.co.nz')) {
      platform = 'Trade Me';
    } else if (rawPlatform.includes('facebook') || rawPlatform.includes('fb') || url.includes('facebook.com')) {
      platform = 'Facebook Marketplace';
    } else if (rawPlatform.includes('ebay') || url.includes('ebay.com')) {
      platform = 'eBay';
    } else if (rawPlatform.includes('cash converters') || rawPlatform.includes('pb tech') || rawPlatform.includes('retail')) {
      platform = 'Other NZ Retailer';
    } else {
      platform = 'Other NZ Retailer';
    }

    const initialWeight = PLATFORM_WEIGHTS[platform] || 1.0;

    return {
      id: raw.id,
      title: raw.title,
      price: raw.price,
      originalPrice: raw.price,
      originalCurrency: (raw.currency || '').toUpperCase(),
      priceNZD: raw.price, // Will be converted in normalizeCurrency step
      platform,
      url: raw.url || '',
      condition: raw.conditionMentioned,
      priceType: raw.priceType,
      groundingUrl: raw.groundingUrl,
      retrievedAt: raw.retrievedAt,
      relevanceScore: 1.0,
      isOutlier: false,
      weight: initialWeight
    };
  });
}
