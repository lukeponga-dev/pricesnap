import type { Request, Response } from 'express';
import { runValuationEngine } from '../src/lib/valuation-engine';
import { parseImage } from '../src/lib/valuation-engine/image';
import { publicError } from '../src/lib/valuation-engine/errors';

export function createAnalyzeHandler(engine = runValuationEngine) {
  return async (req: Request, res: Response) => {
    res.setHeader('Cache-Control', 'no-store');
    if (req.method !== 'POST') {
      res.setHeader('Allow', 'POST');
      return res.status(405).json({ ok: false, error: 'METHOD_NOT_ALLOWED', message: 'Use POST /api/analyze.' });
    }
    const started = Date.now();
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 90000);
    const close = () => { if (!res.writableEnded) controller.abort(); };
    res.on('close', close);
    let streaming = false;
    const send = (event: unknown) => { if (!res.destroyed) res.write(JSON.stringify(event) + '\n'); };
    try {
      const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
      const input = body?.image ?? body?.imageBase64 ?? body?.imageUrl ?? body?.data;
      const image = parseImage(input);
      streaming = req.headers.accept?.includes('application/x-ndjson') ?? false;
      if (streaming) {
        res.status(200);
        res.setHeader('Content-Type', 'application/x-ndjson; charset=utf-8');
        res.setHeader('X-Accel-Buffering', 'no');
      }
      const result = await engine(`data:${image.mimeType};base64,${image.data}`, {
        signal: controller.signal,
        onProgress: stage => { console.info(JSON.stringify({ event: 'valuation_stage', stage, elapsedMs: Date.now() - started })); if (streaming) send({ type: 'progress', stage }); }
      });
      const payload = { ok: true, ...result, appraisal: result };
      console.info(JSON.stringify({ event: 'valuation_complete', id: result.id, status: result.status, evidence: result.evidence.filteredCount, durationMs: Date.now() - started }));
      if (streaming) { send({ type: 'result', data: payload }); res.end(); return; }
      return res.status(200).json(payload);
    } catch (error) {
      const failure = error instanceof SyntaxError
        ? { status: 400, code: 'INVALID_JSON', message: 'Request body must be valid JSON.' }
        : publicError(controller.signal.aborted ? { name: 'AbortError' } : error);
      console.warn(JSON.stringify({ event: 'valuation_failed', code: failure.code, durationMs: Date.now() - started }));
      const payload = { ok: false, status: 'error', error: failure.code, message: failure.message };
      if (res.destroyed) return;
      if (streaming) { send({ type: 'error', ...payload }); res.end(); return; }
      return res.status(failure.status).json(payload);
    } finally {
      clearTimeout(timeout);
      res.off('close', close);
    }
  };
}
