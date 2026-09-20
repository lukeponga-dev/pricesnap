import fs from 'node:fs/promises';
import path from 'node:path';

const [file, base = 'http://localhost:3000'] = process.argv.slice(2);
if (!file) {
  console.error('Usage: npm run smoke:live -- /path/to/item.jpg [https://your-private-deployment]');
  process.exit(1);
}
try {
  const mime = { '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png', '.webp': 'image/webp' }[path.extname(file).toLowerCase()];
  if (!mime) throw new Error('Use JPEG, PNG or WebP.');
  const bytes = await fs.readFile(file);
  if (bytes.length > 3_000_000) throw new Error('Compress the image below 3 MB first.');
  const response = await fetch(new URL('/api/analyze', base), {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ image: `data:${mime};base64,${bytes.toString('base64')}` }),
    signal: AbortSignal.timeout(100000)
  });
  const body = await response.json();
  if (!response.ok || !body.ok) throw new Error(body.message || `HTTP ${response.status}`);
  console.log(JSON.stringify({ status: body.status, item: body.product.name, valuation: body.valuation,
    confidence: body.confidence, sources: body.evidence.sources, meta: body.meta }, null, 2));
  if (body.status !== 'success') process.exitCode = 2;
} catch (error) {
  console.error(error instanceof Error ? error.message : 'Live scan failed.');
  process.exitCode = 1;
}
