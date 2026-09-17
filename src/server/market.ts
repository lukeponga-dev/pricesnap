import type { ListingComparable } from './schema';
import { calculateResellerValuation, robustMarketStats } from './valuation';

async function ebayToken(): Promise<string | null> {
  const clientId = process.env.EBAY_CLIENT_ID;
  const clientSecret = process.env.EBAY_CLIENT_SECRET;
  if (!clientId || !clientSecret) return null;
  const auth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
  const response = await fetch('https://api.ebay.com/identity/v1/oauth2/token', {
    method: 'POST',
    headers: { Authorization: `Basic ${auth}`, 'Content-Type': 'application/x-www-form-urlencoded' },
    body: 'grant_type=client_credentials&scope=https%3A%2F%2Fapi.ebay.com%2Foauth%2Fapi_scope',
    signal: AbortSignal.timeout(5000),
  });
  if (!response.ok) throw new Error(`eBay OAuth failed (${response.status})`);
  const body: any = await response.json();
  return typeof body.access_token === 'string' ? body.access_token : null;
}

function conversionToNzd(currency: string): number | null {
  if (currency === 'NZD') return 1;
  const configured = Number(process.env[`${currency}_NZD_RATE`]);
  return Number.isFinite(configured) && configured > 0 ? configured : null;
}

function normalizedWords(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9 ]/g, ' ').split(/\s+/).filter(x => x.length > 1);
}

function relevant(query: string, title: string) {
  const words = normalizedWords(query);
  const haystack = title.toLowerCase();
  if (!words.length) return true;
  return words.filter(word => haystack.includes(word)).length / words.length >= 0.5;
}

function excludedAccessory(title: string) {
  return /\b(case|cover|charger|cable|screen protector|parts only|for parts|manual|box only|replacement)\b/i.test(title);
}

export async function retrieveEbayComparables(query: string): Promise<ListingComparable[]> {
  const token = await ebayToken();
  if (!token) return [];
  const url = new URL('https://api.ebay.com/buy/browse/v1/item_summary/search');
  url.searchParams.set('q', query);
  url.searchParams.set('limit', '50');
  url.searchParams.set('filter', 'conditions:{USED},buyingOptions:{FIXED_PRICE}');
  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${token}`, 'X-EBAY-C-MARKETPLACE-ID': 'EBAY_AU' },
    signal: AbortSignal.timeout(7000),
  });
  if (!response.ok) throw new Error(`eBay Browse search failed (${response.status})`);
  const body: any = await response.json();
  const seen = new Set<string>();
  return (Array.isArray(body.itemSummaries) ? body.itemSummaries : []).flatMap((item: any) => {
    const value = Number(item?.price?.value);
    const title = typeof item?.title === 'string' ? item.title : '';
    const itemUrl = typeof item?.itemWebUrl === 'string' ? item.itemWebUrl : '';
    if (!Number.isFinite(value) || value <= 0 || !itemUrl || !title || !relevant(query, title) || excludedAccessory(title)) return [];
    if (seen.has(itemUrl)) return [];
    seen.add(itemUrl);
    const conversion = conversionToNzd(String(item?.price?.currency || '').toUpperCase());
    if (conversion === null) return [];
    return [{
      source: 'ebay' as const,
      title,
      url: itemUrl,
      priceNzd: Math.round(value * conversion * 100) / 100,
      condition: item.condition ? String(item.condition) : null,
      retrievedAt: new Date().toISOString(),
    }];
  });
}

export async function groundMarket(itemName: string) {
  const started = Date.now();
  const warnings: string[] = [];
  let ebayListings: ListingComparable[] = [];

  try {
    ebayListings = await retrieveEbayComparables(itemName);
  } catch (error: any) {
    warnings.push(`eBay: ${error?.message || String(error)}`);
  }

  const ebay = robustMarketStats(ebayListings);
  const valuation = calculateResellerValuation([ebay]);

  return {
    market: {
      // These stay explicit rather than being populated by unofficial scrapers.
      trademe: null,
      facebook: null,
      ebay,
      trend: null,
      recommended_price: valuation.recommendedPrice,
      best_platform: ebay?.median != null ? 'eBay' : null,
      grounded: valuation.evidenceCount > 0,
    },
    durationMs: Date.now() - started,
    warnings,
  };
}
