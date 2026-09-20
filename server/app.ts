import express from 'express';
import { createAnalyzeHandler } from './analyze';
import { ENGINE_VERSION, runValuationEngine } from '../src/lib/valuation-engine';
import { hasApiKey } from '../src/lib/valuation-engine/provider';

export function createApp(engine = runValuationEngine) {
  const app = express();
  app.disable('x-powered-by');
  app.use('/api', (_req, res, next) => { res.setHeader('Cache-Control', 'no-store'); next(); });
  app.use(express.json({ limit: '4100kb' }));
  app.all(['/api/analyze', '/api/pricesnap'], createAnalyzeHandler(engine));
  app.get('/api/ping', (_req, res) => res.json({ status: 'ok', service: 'pricesnap-api', engineVersion: ENGINE_VERSION, timestamp: Date.now() }));
  app.get('/api/health', (_req, res) => res.status(hasApiKey() ? 200 : 503).json({ status: hasApiKey() ? 'ready' : 'not_configured', service: 'pricesnap-api', hasApiKey: hasApiKey(), engineVersion: ENGINE_VERSION }));
  app.get('/api/version', (_req, res) => res.json({ service: 'pricesnap-api', engineVersion: ENGINE_VERSION }));
  app.use('/api', (_req, res) => res.status(404).json({ ok: false, error: 'NOT_FOUND', message: 'Unknown API endpoint.' }));
  app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    const large = err.type === 'entity.too.large';
    res.status(large ? 413 : 400).json({ ok: false, error: large ? 'IMAGE_TOO_LARGE' : 'INVALID_JSON', message: large ? 'Upload a smaller image.' : 'Request body must be valid JSON.' });
  });
  return app;
}
