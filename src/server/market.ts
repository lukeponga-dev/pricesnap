import type { ListingComparable } from './schema';
import { calculateResellerValuation, robustMarketStats } from './valuation';

/**
 * PriceSnap market grounding.
 *
 * Pricing deliberately does not use a paid marketplace/search API or Gemini
 * grounding. It reads publicly accessible marketplace search pages and only
 * creates evidence from prices that are actually present in the returned HTML.
 * If a site blocks automated requests or its markup changes, that source simply
 * contributes no evidence; PriceSnap never invents a market price.
 */

const USER_AGENT = 'Mozilla/5.0 (compatible; PriceSnap/1.0; +https://github.com/lukeponga-dev/pricesnap)';
const TIMEOUT_MS = 4500;

function decodeHtml(value: string) {
  return value
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/\s+/g, ' ')
    .trim();
}

function stripTags(value: string) {
  return decodeHtml(value.replace(/<[^>]*>/g, ' '));
}

async function fetchHtml(url: string): Promise<string | null> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const response = await fetch(url, {
      signal: controller.signal,
      redirect: 'follow',
      headers: {
        'User-Agent': USER_AGENT,
        'Accept': 'text/html,application/xhtml+xml',
        'Accept-Language': 'en-NZ,en;q=0.9',
      },
    });
    if (!response.ok) return null;
    const type = response.headers.get('content-type') || '';
    if (!type.includes('text/html')) return null;
    return await response.text();
  } catch {
    return null;
  } finally {
    clearTimeout(timeout);
  }
}

function sensiblePrice(price: number) {
  return Number.isFinite(price) && price >= 1 && price <= 100000;
}

function parseEbay(html: string): ListingComparable[] {
  const results: ListingComparable[] = [];
  const cards = html.match(/<li[^>]*class="[^"]*s-item[^"]*"[\s\S]*?<\/li>/gi) || [];

  for (const card of cards.slice(0, 30)) {
    const titleMatch = card.match(/class="[^"]*s-item__title[^"]*"[^>]*>([\s\S]*?)<\/[^>]+>/i);
    const priceMatch = card.match(/class="[^"]*s-item__price[^"]*"[^>]*>[\s\S]*?(?:NZ\s*\$|NZD\s*|\$)\s*([\d,]+(?:\.\d{1,2})?)/i);
    const urlMatch = card.match(/class="[^"]*s-item__link[^"]*"[^>]*href="([^"]+)"/i);
    if (!priceMatch || !urlMatch) continue;

    const price = Number(priceMatch[1].replace(/,/g, ''));
    if (!sensiblePrice(price)) continue;

    results.push({
      source: 'ebay_public_web',
      title: titleMatch ? stripTags(titleMatch[1]) : 'eBay listing',
      url: decodeHtml(urlMatch[1]),
      priceNzd: price,
      condition: null,
      retrievedAt: new Date().toISOString(),
    });
  }
  return results;
}

function parseTradeMe(html: string): ListingComparable[] {
  const results: ListingComparable[] = [];
  // Trade Me markup changes regularly, so use listing links as stable card anchors
  // and inspect a bounded amount of surrounding HTML for an NZ-dollar price.
  const linkRegex = /href="(\/a\/marketplace\/[^"?#]+(?:\/listing\/\d+|[^"?#]*))"/gi;
  let match: RegExpExecArray | null;
  const seen = new Set<string>();

  while ((match = linkRegex.exec(html)) && results.length < 20) {
    const path = decodeHtml(match[1]);
    if (seen.has(path)) continue;
    seen.add(path);
    const start = Math.max(0, match.index - 900);
    const end = Math.min(html.length, match.index + 1800);
    const chunk = html.slice(start, end);
    const priceMatch = chunk.match(/(?:NZ\s*\$|\$)\s*([\d,]+(?:\.\d{1,2})?)/i);
    if (!priceMatch) continue;
    const price = Number(priceMatch[1].replace(/,/g, ''));
    if (!sensiblePrice(price)) continue;
    const titleMatch = chunk.match(/(?:aria-label|title)="([^"]{3,160})"/i);

    results.push({
      source: 'trademe_public_web',
      title: titleMatch ? decodeHtml(titleMatch[1]) : 'Trade Me listing',
      url: `https://www.trademe.co.nz${path}`,
      priceNzd: price,
      condition: null,
      retrievedAt: new Date().toISOString(),
    });
  }
  return results;
}

async function getTradeMeListings(query: string) {
  const url = `https://www.trademe.co.nz/a/marketplace/search?search_string=${encodeURIComponent(query)}`;
  const html = await fetchHtml(url);
  return html ? parseTradeMe(html) : [];
}

async function getEbayListings(query: string) {
  // eBay NZ search pages display NZD, avoiding a separate FX API.
  const url = `https://www.ebay.com/sch/i.html?_nkw=${encodeURIComponent(query)}&_sop=12&LH_ItemCondition=3000`;
  const html = await fetchHtml(url);
  return html ? parseEbay(html) : [];
}

export async function groundMarket(itemName: string, conditionScore: number | null = null, defects: string[] = []) {
  const started = Date.now();
  const warnings: string[] = [];

  // Identification remains AI-driven, but market pricing is deterministic and
  // based only on public listing evidence. Condition is applied later by the
  // valuation layer rather than asking an LLM to guess a price.
  const query = itemName.trim().slice(0, 120);
  const [tradeMeResult, ebayResult] = await Promise.allSettled([
    getTradeMeListings(query),
    getEbayListings(query),
  ]);

  const tradeMeListings = tradeMeResult.status === 'fulfilled' ? tradeMeResult.value : [];
  const ebayListings = ebayResult.status === 'fulfilled' ? ebayResult.value : [];

  if (!tradeMeListings.length) warnings.push('Trade Me public search returned no usable pricing evidence.');
  if (!ebayListings.length) warnings.push('eBay public search returned no usable pricing evidence.');

  const tradeMeMarket = robustMarketStats(tradeMeListings);
  const ebayMarket = robustMarketStats(ebayListings);
  const valuation = calculateResellerValuation([tradeMeMarket, ebayMarket]);

  // A small deterministic condition adjustment is only applied when enough
  // real listing evidence exists. Defects reduce the recommendation slightly;
  // this is transparent business logic, not an AI-generated market figure.
  let recommendedPrice = valuation.recommendedPrice;
  if (recommendedPrice !== null && conditionScore !== null) {
    const conditionFactor = 0.75 + (Math.max(1, Math.min(10, conditionScore)) / 10) * 0.25;
    const defectFactor = Math.max(0.7, 1 - Math.min(defects.length, 3) * 0.05);
    recommendedPrice = Math.round(recommendedPrice * conditionFactor * defectFactor * 100) / 100;
  }

  const bestPlatform = tradeMeMarket && ebayMarket
    ? (tradeMeMarket.evidence_count >= ebayMarket.evidence_count ? 'Trade Me' : 'eBay')
    : tradeMeMarket ? 'Trade Me'
    : ebayMarket ? 'eBay'
    : null;

  return {
    market: {
      trademe: tradeMeMarket,
      facebook: null,
      ebay: ebayMarket,
      trend: null,
      recommended_price: recommendedPrice,
      best_platform: bestPlatform,
      grounded: valuation.evidenceCount > 0,
    },
    durationMs: Date.now() - started,
    warnings,
  };
}
