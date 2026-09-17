import { afterEach, describe, expect, it, vi } from 'vitest';
import { comparable, dedupeListings, groundMarket, marketConfidence, parseEbay, parseGroundedListings, parseTradeMe } from './market';
import { robustMarketStats } from './valuation';
import type { GenerateContentResponse } from '@google/genai';
import { generateContent } from './gemini';
vi.mock('./gemini', () => ({ generateContent: vi.fn(), groundingModel: () => 'test-model', providerStatus: (e: any) => e.status }));

function listing(price: number, id = String(price)) { return { source: 'trademe.co.nz', title: 'Canon EOS 80D', url: `https://www.trademe.co.nz/a/marketplace/listing/${id}`, priceNzd: price, condition: 'used', retrievedAt: new Date().toISOString() }; }
function grounded(overrides = {}, before = '') {
  const item = { title: 'Canon EOS 80D', url: listing(200).url, price: 200, currency: 'NZD', condition: 'used', ...overrides };
  const text = before + JSON.stringify(item);
  return { candidates: [{ content: { parts: [{ text }] }, groundingMetadata: { groundingChunks: [{ web: { uri: item.url } }], groundingSupports: [{ segment: { startIndex: Buffer.byteLength(before), endIndex: Buffer.byteLength(text) }, groundingChunkIndices: [0] }] } }] } as GenerateContentResponse;
}
afterEach(() => { vi.unstubAllGlobals(); vi.clearAllMocks(); });

describe('market evidence', () => {
  it('rejects wrong model numbers, storage and variants', () => {
    expect(comparable('Canon EOS 80D', 'Canon EOS 90D')).toBe(false);
    expect(comparable('iPhone 13', 'Apple iPhone 13 Pro')).toBe(false);
    expect(comparable('Apple iPhone 13 128GB', 'Apple iPhone 13 256GB')).toBe(false);
    expect(comparable('Apple iPhone 13 128GB', 'Used Apple iPhone 13 128 GB')).toBe(true);
  });
  it('allows an accessory when it is the scanned product, not when it is a substitute', () => {
    expect(comparable('Canon EOS 80D', 'Canon EOS 80D charger')).toBe(false);
    expect(comparable('Apple USB C cable', 'Apple USB C cable')).toBe(true);
  });
  it('rejects uncited model output and unsupported currency or condition', () => {
    expect(parseGroundedListings({ candidates: [{ content: { parts: [{ text: JSON.stringify({ title: 'Canon EOS 80D', price: 200 }) }] } }] } as any, 'Canon EOS 80D')).toEqual([]);
    expect(parseGroundedListings(grounded({ currency: 'USD' }), 'Canon EOS 80D')).toEqual([]);
    expect(parseGroundedListings(grounded({ condition: 'new' }), 'Canon EOS 80D')).toEqual([]);
  });
  it('accepts a cited price and handles UTF-8 grounding offsets', () => {
    expect(parseGroundedListings(grounded({}, 'Résumé 📷\n'), 'Canon EOS 80D')[0].priceNzd).toBe(200);
  });
  it('rejects a support that covers the title but not the price', () => {
    const response = grounded();
    response.candidates![0].groundingMetadata!.groundingSupports![0].segment!.endIndex = 28;
    expect(parseGroundedListings(response, 'Canon EOS 80D')).toEqual([]);
  });
  it('does not attach an unrelated citation to a generated listing URL', () => {
    const response = grounded();
    response.candidates![0].groundingMetadata!.groundingChunks![0].web!.uri = 'https://example.com/unrelated';
    expect(parseGroundedListings(response, 'Canon EOS 80D')).toEqual([]);
  });
  it('retains Google redirect citations and the source domain supplied by Google', () => {
    const response = grounded();
    response.candidates![0].groundingMetadata!.groundingChunks![0].web = { uri: 'https://vertexaisearch.cloud.google.com/grounding-api-redirect/abc', title: 'trademe.co.nz' };
    const found = parseGroundedListings(response, 'Canon EOS 80D');
    expect(found[0].source).toBe('trademe.co.nz');
    expect(found[0].url).toContain('grounding-api-redirect');
  });
  it('does not scrape a price from a neighbouring Trade Me card', () => {
    const raw = '<a title="Canon EOS 80D" href="/a/marketplace/listing/123">Camera</a><div>$5 charger</div>';
    expect(parseTradeMe(raw, 'Canon EOS 80D')).toEqual([]);
  });
  it('accepts only a used NZD offer attached to its product', () => {
    const raw = `<script type="application/ld+json">${JSON.stringify({ '@type': 'Product', name: 'Canon EOS 80D', offers: { url: listing(200).url, price: '200', priceCurrency: 'NZD', itemCondition: 'https://schema.org/UsedCondition' } })}</script>`;
    expect(parseTradeMe(raw, 'Canon EOS 80D')[0].priceNzd).toBe(200);
    expect(parseTradeMe(raw.replace('NZD', 'USD'), 'Canon EOS 80D')).toEqual([]);
  });
  it('rejects ambiguous eBay dollars and price ranges', () => {
    const card = (price: string) => `<li class="s-item"><a href="https://www.ebay.com/itm/123" class="s-item__link"><div class="s-item__title"><span>Canon EOS 80D</span></div></a><span class="s-item__price">${price}</span></li>`;
    expect(parseEbay(card('NZ $200.00'), 'Canon EOS 80D')[0].priceNzd).toBe(200);
    expect(parseEbay(card('$200.00'), 'Canon EOS 80D')).toEqual([]);
    expect(parseEbay(card('NZ $200 to NZ $500'), 'Canon EOS 80D')).toEqual([]);
  });
  it('deduplicates the same URL even when its price or tracking query differs', () => {
    expect(dedupeListings([listing(200, '1'), { ...listing(210, '1'), url: listing(210, '1').url + '?utm_source=google' }])).toHaveLength(1);
  });
  it('uses the median and removes outliers even for repeated equal prices', () => {
    expect(robustMarketStats([100, 200, 300].map(x => listing(x)))?.median).toBe(200);
    expect(robustMarketStats([100, 100, 100, 100, 10000].map((x, i) => listing(x, String(i))))?.evidence_count).toBe(4);
  });
  it('keeps thin evidence low-confidence and counts more than eight observations', () => {
    expect(marketConfidence([listing(200)]).label).toBe('low');
    expect(marketConfidence(Array.from({ length: 12 }, (_, i) => listing(200 + i, String(i)))).evidence_count).toBe(12);
  });
  it('returns a null price with a useful warning when search quota and public pages fail', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('unavailable')));
    vi.mocked(generateContent).mockRejectedValue({ status: 429 });
    const result = await groundMarket('Canon EOS 80D');
    expect(result.market.recommended_price).toBeNull();
    expect(result.market.grounded).toBe(false);
    expect(result.warnings.join(' ')).toContain('quota');
  });
  it('groups Google-sourced Trade Me evidence and does not discount or count it twice', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('', { status: 403 })));
    vi.mocked(generateContent).mockResolvedValue(grounded());
    const result = await groundMarket('Canon EOS 80D', 5, ['scratch']);
    expect(result.market.recommended_price).toBe(200);
    expect(result.market.trademe?.evidence_count).toBe(1);
    expect(result.market.confidence.evidence_count).toBe(1);
  });
});
