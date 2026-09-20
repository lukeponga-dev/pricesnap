// Test-only HTTP server. Fixtures are injected at the provider boundary and
// are never selected by a production environment variable or public route.
import express from 'express';
import path from 'node:path';
import { createAnalyzeHandler } from '../../server/analyze';
import { runValuationEngine } from '../../src/lib/valuation-engine';
import { ValuationError } from '../../src/lib/valuation-engine/errors';
import { dependencies } from '../fixtures/provider';

const app = express(); app.use(express.json({ limit: '4100kb' }));
app.all('/api/analyze', (req, res) => {
  const scenario = req.headers['x-test-scenario'];
  const delay = (signal?: AbortSignal) => new Promise<void>((resolve, reject) => {
    if (signal?.aborted) { reject(new DOMException('Aborted', 'AbortError')); return; }
    const abort = () => { clearTimeout(timer); reject(new DOMException('Aborted', 'AbortError')); };
    const timer = setTimeout(() => { signal?.removeEventListener('abort', abort); resolve(); }, scenario === 'slow' ? 1500 : 150);
    signal?.addEventListener('abort', abort, { once: true });
  });
  return createAnalyzeHandler((input, options) => runValuationEngine(input, options, {
    identifyProduct: async (_image, signal) => { await delay(signal); if (scenario === 'error') throw new ValuationError('PROVIDER_RATE_LIMIT', 'The AI service is busy. Please try later.', 429); return dependencies.identifyProduct(); },
    groundedSearch: async (_product, _queries, signal) => { await delay(signal); return scenario === 'empty' ? { rawListings: [], groundingSources: [] } : dependencies.groundedSearch(); }
  }))(req, res);
});
app.use(express.static(path.resolve('dist')));
app.listen(3100, '127.0.0.1', () => console.log('E2E provider fixtures on 3100'));
