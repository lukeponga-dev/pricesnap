import type { Request, Response } from 'express';
import { ENGINE_VERSION } from '../src/lib/valuation-engine/config';
export default function handler(_req: Request, res: Response) {
  res.setHeader('Cache-Control', 'no-store');
  return res.status(200).json({ status: 'ok', service: 'pricesnap-api', engineVersion: ENGINE_VERSION, timestamp: Date.now() });
}
