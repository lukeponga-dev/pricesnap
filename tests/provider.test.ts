import test from 'node:test';
import assert from 'node:assert/strict';
import { identifyProduct } from '../src/lib/valuation-engine/identification/identifyProduct';
import { groundedSearch } from '../src/lib/valuation-engine/search/groundedSearch';
import { image, product, providerResponse } from './fixtures/provider';

// Exercise the actual Google SDK request/response boundary without live credentials.
test('Google SDK sends inline image and search tool, parses structured and grounded responses', async t => {
  const oldKey = process.env.GEMINI_API_KEY;
  process.env.GEMINI_API_KEY = 'test-only-not-a-real-key';
  const requests: any[] = [];
  t.mock.method(globalThis, 'fetch', async (input: Request | string | URL, init?: RequestInit) => {
    const request = input instanceof Request ? input : new Request(input, init);
    const body = await request.json(); requests.push(body);
    const identification = { item_name: product.name, brand: product.brand, category: product.category, condition_score: 8, condition_grade: 'A-', certaintyScore: 0.9, defects: [], summary: 'Visible condition only.' };
    const payload = requests.length === 1 ? { candidates: [{ content: { parts: [{ text: JSON.stringify(identification) }] } }] } : providerResponse();
    return new Response(JSON.stringify(payload), { headers: { 'Content-Type': 'application/json' } });
  });
  try {
    const identified = await identifyProduct(image);
    assert.equal(identified.name, product.name);
    const search = await groundedSearch(identified, ['Sony WH-1000XM4 used NZD']);
    assert.equal(search.rawListings.length, 3);
    assert.equal(requests[0].contents[0].parts[0].inlineData.mimeType, 'image/png');
    assert.ok(requests[0].generationConfig.responseSchema);
    assert.deepEqual(requests[1].tools, [{ googleSearch: {} }]);
    assert.ok(!requests[1].contents[0].parts[0].text.includes(image));
  } finally { if (oldKey === undefined) delete process.env.GEMINI_API_KEY; else process.env.GEMINI_API_KEY = oldKey; }
});
