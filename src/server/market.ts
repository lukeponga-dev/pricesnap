import type { ListingComparable, PlatformMarket } from './schema';

function stats(listings: ListingComparable[]): PlatformMarket | null {
  if (!listings.length) return null;
  const ordered = listings.map(x => x.priceNzd).filter(Number.isFinite).sort((a, b) => a - b);
  if (!ordered.length) return null;
  const median = ordered.length % 2
    ? ordered[Math.floor(ordered.length / 2)]
    : (ordered[ordered.length / 2 - 1] + ordered[ordered.length / 2]) / 2;
  return {
    low: ordered[0],
    median: Math.round(median * 100) / 100,
    high: ordered[ordered.length - 1],
    sample_listings: listings.slice(0, 6),
    evidence_count: listings.length,
  };
}

async function ebayToken(): Promise<string | null> {
  const clientId = process.env.EBAY_CLIENT_ID;
  const clientSecret = process.env.EBAY_CLIENT_SECRET;
  if (!clientId || !clientSecret) return null;
  const auth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
  const response = await fetch('https://api.ebay.com/identity/v1/oauth2/token', {
    method: 'POST',
    headers: {
      Authorization: `Basic ${auth}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials&scope=https%3A%2F%2Fapi.ebay.com%2Foauth%2Fapi_scope',
  });
  if (!response.ok) throw new Error(`eBay OAuth failed (${response.status})`);
  const body: any = await response.json();
  return typeof body.access_token === 'string' ? body.access_token : null;
}

async function usdToNzd(): Promise<number> {
  const configured = Number(process.env.USD_NZD_RATE);
  return Number.isFinite(configured) && configured > 0 ? configured : 1;
}

export async function retrieveEbayComparables(query: string): Promise<ListingComparable[]> {
  const token = await ebayToken();
  if (!token) return [];
  const url = new URL('https://api.ebay.com/buy/browse/v1/item_summary/search');
  url.searchParams.set('q', query);
  url.searchParams.set('limit', '20');
  url.searchParams.set('filter', 'conditions:{USED}');
  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
      'X-EBAY-C-MARKETPLACE-ID': 'EBAY_AU',
    },
  });
  if (!response.ok) throw new Error(`eBay Browse search failed (${response.status})`);
  const body: any = await response.json();
  const rate = await usdToNzd();
  return (Array.isArray(body.itemSummaries) ? body.itemSummaries : []).flatMap((item: any) => {
    const value = Number(item?.price?.value);
    if (!Number.isFinite(value) || !item?.itemWebUrl || !item?.title) return [];
    const currency = String(item?.price?.currency || '').toUpperCase();
    // EBAY_AU commonly returns AUD. Configure AUD_NZD_RATE for production conversion.
    const audRate = Number(process.env.AUD_NZD_RATE);
    const conversion = currency === 'NZD' ? 1 : currency === 'AUD' && Number.isFinite(audRate) && audRate > 0 ? audRate : currency === 'USD' ? rate : NaN;
    if (!Number.isFinite(conversion)) return [];
    return [{
      source: 'ebay' as const,
      title: String(item.title),
      url: String(item.itemWebUrl),
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
    warnings.push(error?.message || 'eBay grounding failed');
  }

  const ebay = stats(ebayListings);
  const medians = [ebay?.median].filter((x): x is number => typeof x === 'number');
  const recommended = medians.length ? Math.round((medians.reduce((a, b) => a + b, 0) / medians.length) * 100) / 100 : null;

  return {
    market: {
      // Trade Me is deliberately disabled: its current Marketplace API use-case rules do not support
      // price-monitoring/comparison tools like PriceSnap without an approved eligible integration.
      trademe: null,
      facebook: null,
      ebay,
      trend: null,
      recommended_price: recommended,
      best_platform: ebay ? 'eBay' : null,
      grounded: Boolean(ebay),
    },
    durationMs: Date.now() - started,
    warnings,
  };
}
