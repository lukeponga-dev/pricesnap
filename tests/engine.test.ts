import test from 'node:test';
import assert from 'node:assert/strict';
import { runValuationEngine } from '../src/lib/valuation-engine';
import { parseImage, MAX_IMAGE_BYTES } from '../src/lib/valuation-engine/image';
import { parseGroundedResponse } from '../src/lib/valuation-engine/search/groundedSearch';
import { normalizeIdentifiedProduct } from '../src/lib/valuation-engine/identification/schema';
import { classifyEvidence } from '../src/lib/valuation-engine/evidence/classify';
import { scoreRelevance } from '../src/lib/valuation-engine/evidence/relevance';
import { filterEvidence } from '../src/lib/valuation-engine/evidence/filter';
import { normalizeCurrency } from '../src/lib/valuation-engine/pricing/currency';
import { removeOutliers } from '../src/lib/valuation-engine/pricing/outliers';
import { calculateWeightedMedian } from '../src/lib/valuation-engine/pricing/weightedMedian';
import { calculateConfidence } from '../src/lib/valuation-engine/confidence/calculate';
import { deduplicate } from '../src/lib/valuation-engine/evidence/deduplicate';
import { createProvider } from '../src/lib/valuation-engine/provider';
import { image, product, rows, providerResponse, dependencies } from './fixtures/provider';

const clean = () => classifyEvidence(parseGroundedResponse(providerResponse()).rawListings);

test('validates image contents, MIME, base64 and size before provider use', () => {
  assert.equal(parseImage(image).mimeType, 'image/png');
  for (const bad of ['', 'https://example.com/item.jpg', 'data:image/svg+xml;base64,PHN2Zz4=', image.replace('image/png', 'image/jpeg'), 'abcd=abc']) assert.throws(() => parseImage(bad));
  assert.throws(() => parseImage('A'.repeat(Math.ceil(MAX_IMAGE_BYTES / 3) * 4 + 4)), { code: 'IMAGE_TOO_LARGE' });
});
test('missing credentials cannot produce a catalogue identification', () => {
  const old = process.env.GEMINI_API_KEY, other = process.env.GOOGLE_AI_STUDIO_API_KEY;
  delete process.env.GEMINI_API_KEY; delete process.env.GOOGLE_AI_STUDIO_API_KEY;
  try { assert.throws(createProvider, { code: 'SERVICE_NOT_CONFIGURED' }); }
  finally { if (old !== undefined) process.env.GEMINI_API_KEY = old; if (other !== undefined) process.env.GOOGLE_AI_STUDIO_API_KEY = other; }
});
test('low and missing identity certainty remain low', () => {
  assert.equal(normalizeIdentifiedProduct({ certaintyScore: 0.1 }).certaintyScore, 0.1);
  assert.equal(normalizeIdentifiedProduct({}).certaintyScore, 0);
});
test('requires price-level grounding, not a plausible model-generated URL', () => {
  assert.equal(parseGroundedResponse(providerResponse()).rawListings.length, 3);
  assert.equal(parseGroundedResponse(providerResponse(rows, false)).rawListings.length, 0);
  const response = providerResponse();
  response.candidates![0].groundingMetadata!.groundingSupports![0].segment!.endIndex = 15;
  assert.equal(parseGroundedResponse(response).rawListings.length, 2);
});
test('rejects unknown currency, new retail, invented sale type and missing price', () => {
  for (const override of [{ currency: '$' }, { currency: 'USD' }, { priceType: 'retail' }, { priceType: undefined }, { price: '250' }, { conditionMentioned: 'New' }]) {
    assert.equal(parseGroundedResponse(providerResponse([{ ...rows[0], ...override }])).rawListings.length, 0);
  }
});
test('rejects malformed provider JSON instead of disguising it as zero results', () => {
  const response = providerResponse(); response.candidates![0].content!.parts = [{ text: 'upstream failed' }];
  assert.throws(() => parseGroundedResponse(response), { code: 'INVALID_SEARCH_RESPONSE' });
});
test('handles unicode grounding byte offsets and provider citation redirects', () => {
  const response = providerResponse([{ ...rows[0], title: 'Sony WH-1000XM4 — headphones' }]);
  const redirected = 'https://vertexaisearch.cloud.google.com/grounding-api-redirect/example';
  response.candidates![0].groundingMetadata!.groundingChunks![0].web!.uri = redirected;
  assert.equal(parseGroundedResponse(response).rawListings[0].url, redirected);
});
test('excludes unrelated products, accessories and wrong model variants', () => {
  for (const title of ['Apple iPhone 13', 'Sony WH-1000XM5 headphones', 'Sony WH-1000XM4 replacement ear pads', 'Sony WH-1000XM4 case only']) {
    assert.equal(filterEvidence(scoreRelevance(product, [{ ...clean()[0], title }])).length, 0);
  }
  assert.equal(filterEvidence(scoreRelevance(product, clean())).length, 3);
  const phone = normalizeIdentifiedProduct({ item_name: 'Apple iPhone 13 128GB', brand: 'Apple' });
  assert.equal(filterEvidence(scoreRelevance(phone, [{ ...clean()[0], title: 'Apple iPhone 13 Pro 128GB' }])).length, 0);
});
test('deduplicates repeated URLs and rejects unknown currency', () => {
  assert.equal(deduplicate([...clean(), clean()[0]]).length, 3);
  assert.equal(normalizeCurrency([{ ...clean()[0], originalCurrency: 'USD' }]).length, 0);
});
test('removes extreme prices and never revives marked outliers or invents a median', () => {
  const evidence = [240, 250, 260, 9999].map((p, i) => ({ ...clean()[0], id: String(i), priceNZD: p }));
  assert.equal(removeOutliers(evidence).filter(e => !e.isOutlier).length, 3);
  assert.equal(calculateWeightedMedian([{ ...clean()[0], isOutlier: true }]), 0);
  assert.equal(calculateWeightedMedian([]), 0);
});
test('pipeline returns one consistent NZD price, actual platform summaries and server progress', async () => {
  const stages: string[] = [];
  const result = await runValuationEngine(image, { onProgress: s => stages.push(s) }, dependencies);
  assert.deepEqual(stages, ['identifying', 'searching', 'calculating']);
  assert.equal(result.status, 'success');
  assert.equal(result.valuation.estimatedValue, 260);
  assert.equal(result.resale_price_nz, 260);
  assert.equal(result.market.recommended_price, 260);
  assert.equal(result.pricing_guide.balanced_price, 260);
  assert.equal(result.market.platforms.length, 1);
  assert.equal(result.market.trend, 'unknown');
  assert.equal(result.evidence.filteredCount, 3);
  assert.ok(result.confidence.percentage <= 75);
});
test('no evidence returns an explicit unpriced result and zero price confidence', async () => {
  const result = await runValuationEngine(image, {}, { ...dependencies, groundedSearch: async () => ({ rawListings: [], groundingSources: [] }) });
  assert.equal(result.status, 'insufficient_evidence');
  assert.equal(result.valuation.estimatedValue, null);
  assert.equal(result.confidence.percentage, 0);
  assert.equal(result.market.platforms.length, 0);
  assert.equal(calculateConfidence(product, [clean()[0]]).percentage <= 55, true);
});
test('provider failures propagate instead of producing a valuation', async () => {
  await assert.rejects(runValuationEngine(image, {}, { ...dependencies, groundedSearch: async () => { throw new Error('provider unavailable'); } }), /provider unavailable/);
});

test('small positive comparable prices remain positive instead of rounding to zero', () => {
  const evidence = clean().slice(0, 2).map(e => ({ ...e, priceNZD: 0.25 }));
  assert.equal(calculateWeightedMedian(evidence), 0.25);
});
