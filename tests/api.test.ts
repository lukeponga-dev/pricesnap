import test from 'node:test';
import assert from 'node:assert/strict';
import { once } from 'node:events';
import { createApp } from '../server/app';
import { runValuationEngine } from '../src/lib/valuation-engine';
import { image, dependencies } from './fixtures/provider';
import { ValuationError } from '../src/lib/valuation-engine/errors';
import { createAnalyzeHandler } from '../server/analyze';
import vercelHandler from '../api/analyze';
import express from 'express';

async function withServer(app: ReturnType<typeof express>, fn: (base: string) => Promise<void>) {
  const server = app.listen(0, '127.0.0.1'); await once(server, 'listening');
  try { await fn(`http://127.0.0.1:${(server.address() as any).port}`); }
  finally { server.closeAllConnections(); await new Promise<void>(resolve => server.close(() => resolve())); }
}
const engine = (input: Buffer | string, options: any) => runValuationEngine(input, options, dependencies);
const post = (base: string, body: unknown, headers = {}) => fetch(base + '/api/analyze', { method: 'POST', headers: { 'Content-Type': 'application/json', ...headers }, body: JSON.stringify(body) });

test('JSON and streaming APIs execute the same engine and preserve aliases', async () => {
  await withServer(createApp(engine), async base => {
    const response = await post(base, { image });
    assert.equal(response.status, 200); assert.equal(response.headers.get('cache-control'), 'no-store');
    const json = await response.json(); assert.equal(json.valuation.estimatedValue, 260); assert.deepEqual(json.appraisal.valuation, json.valuation);
    const stream = await post(base, { image }, { Accept: 'application/x-ndjson' });
    const events = (await stream.text()).trim().split('\n').map(line => JSON.parse(line));
    assert.deepEqual(events.filter(e => e.type === 'progress').map(e => e.stage), ['identifying', 'searching', 'calculating']);
    assert.equal(events.at(-1).data.valuation.estimatedValue, 260);
    const alias = await fetch(base + '/api/pricesnap', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ imageBase64: image }) });
    assert.equal(alias.status, 200);
  });
});
test('bad input, oversized JSON and wrong methods never reach the provider', async () => {
  let calls = 0;
  await withServer(createApp(async (input, options) => { calls++; return engine(input, options); }), async base => {
    assert.equal((await fetch(base + '/api/analyze')).status, 405);
    assert.equal((await post(base, {})).status, 400);
    assert.equal((await post(base, { image: 'https://example.com/a.png' })).status, 400);
    assert.equal((await fetch(base + '/api/analyze', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{' })).status, 400);
    assert.equal((await post(base, { image: 'A'.repeat(4_300_000) })).status, 413);
    assert.equal(calls, 0);
  });
});
test('provider errors stay actionable, redacted and never become successful estimates', async () => {
  for (const [failure, code, status] of [[new ValuationError('SERVICE_NOT_CONFIGURED', 'Set a server API key.', 503), 'SERVICE_NOT_CONFIGURED', 503], [{ status: 429, message: 'SECRET_KEY' }, 'PROVIDER_RATE_LIMIT', 429], [new Error('SECRET_KEY'), 'ANALYSIS_FAILED', 502], [{ name: 'TimeoutError' }, 'ANALYSIS_TIMEOUT', 504]] as const) {
    await withServer(createApp(async () => { throw failure; }), async base => {
      const response = await post(base, { image }); assert.equal(response.status, status);
      const body = await response.json(); assert.equal(body.error, code); assert.equal(body.ok, false); assert.ok(!JSON.stringify(body).includes('SECRET_KEY'));
      const stream = await post(base, { image }, { Accept: 'application/x-ndjson' });
      assert.equal(JSON.parse((await stream.text()).trim()).type, 'error');
    });
  }
});
test('Vercel adapter uses Node request/response and same validation contract', async () => {
  const app = express(); app.use(express.json()); app.all('/api/analyze', vercelHandler);
  await withServer(app, async base => { assert.equal((await post(base, {})).status, 400); assert.equal((await fetch(base + '/api/analyze')).status, 405); });
  assert.equal(typeof createAnalyzeHandler(), 'function');
});

test('real unconfigured engine reports 503 through the shared API, without fake identification', async () => {
  const oldKey = process.env.GEMINI_API_KEY, oldOther = process.env.GOOGLE_AI_STUDIO_API_KEY;
  delete process.env.GEMINI_API_KEY; delete process.env.GOOGLE_AI_STUDIO_API_KEY;
  try {
    await withServer(createApp(), async base => {
      const health = await fetch(base + '/api/health'); assert.equal(health.status, 503);
      assert.equal((await health.json()).status, 'not_configured');
      const response = await post(base, { image }); assert.equal(response.status, 503);
      assert.equal((await response.json()).error, 'SERVICE_NOT_CONFIGURED');
    });
  } finally { if (oldKey !== undefined) process.env.GEMINI_API_KEY = oldKey; if (oldOther !== undefined) process.env.GOOGLE_AI_STUDIO_API_KEY = oldOther; }
});
