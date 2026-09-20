import 'dotenv/config';
import path from 'node:path';
import express from 'express';
import { createApp } from './server/app';

async function startServer() {
  const app = createApp();
  if (process.env.NODE_ENV !== 'production') {
    const { createServer } = await import('vite');
    const vite = await createServer({ server: { middlewareMode: true }, appType: 'spa' });
    app.use(vite.middlewares);
  } else {
    const dist = path.join(process.cwd(), 'dist');
    app.use(express.static(dist));
    app.get('*', (_req, res) => res.sendFile(path.join(dist, 'index.html')));
  }
  const port = Number(process.env.PORT) || 3000;
  app.listen(port, '0.0.0.0', () => console.info(`PriceSnap running on http://localhost:${port}`));
}
startServer().catch(() => { console.error('PriceSnap server failed to start.'); process.exitCode = 1; });
