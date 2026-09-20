import type { Request, Response } from 'express';
import { hasApiKey } from '../src/lib/valuation-engine/provider';
import { ENGINE_VERSION } from '../src/lib/valuation-engine/config';
export default function handler(_req: Request, res: Response) {
  res.setHeader('Cache-Control', 'no-store');
  return res.status(hasApiKey() ? 200 : 503).json({ status: hasApiKey() ? 'ready' : 'not_configured', service: 'pricesnap-api', hasApiKey: hasApiKey(), engineVersion: ENGINE_VERSION });
}
