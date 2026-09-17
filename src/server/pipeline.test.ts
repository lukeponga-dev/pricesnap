import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { generateContent } from './gemini';
import { analyzeAppraisal } from './appraisal';
import { handleAnalysisRequest } from './http';
import { readAnalysisResponse } from '../lib/analysis-client';
vi.mock('./gemini', () => ({ generateContent: vi.fn(), geminiKey: () => process.env.GEMINI_API_KEY, geminiModel: () => 'test-model', groundingModel: () => 'test-model', providerStatus: (e: any) => e.status }));
const image = 'data:image/jpeg;base64,' + Buffer.from([255, 216, 255, 217]).toString('base64');
const vision = { item: 'Canon camera', item_name: 'Canon EOS 80D', item_category: 'Camera', brand: 'Canon', condition_score: 8, defects: [], confidence: .95 };
function request(stream = false, body = JSON.stringify({ imageBase64: image })) { return new Request('http://localhost/api/analyze', { method: 'POST', headers: { 'Content-Type': 'application/json', Accept: stream ? 'application/x-ndjson' : 'application/json' }, body }); }
beforeEach(() => { vi.stubEnv('GEMINI_API_KEY', 'test-key'); vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('', { status: 403 }))); });
afterEach(() => { vi.unstubAllEnvs(); vi.unstubAllGlobals(); vi.clearAllMocks(); });

describe('analysis HTTP and client contract', () => {
  it('keeps normal JSON responses compatible and consistent across all price fields', async () => {
    const record = JSON.stringify({ title: 'Canon EOS 80D', url: 'https://www.trademe.co.nz/a/marketplace/listing/123', price: 250, currency: 'NZD', condition: 'used' });
    vi.mocked(generateContent).mockResolvedValueOnce({ text: JSON.stringify(vision) } as any).mockResolvedValueOnce({ candidates: [{ content: { parts: [{ text: record }] }, groundingMetadata: { groundingChunks: [{ web: { uri: 'https://www.trademe.co.nz/a/marketplace/listing/123' } }], groundingSupports: [{ segment: { startIndex: 0, endIndex: record.length }, groundingChunkIndices: [0] }] } }] } as any);
    const response = await handleAnalysisRequest(request());
    const result = await readAnalysisResponse(response, () => {});
    expect(result.item_name).toBe('Canon EOS 80D');
    expect(result.resale_price_nz).toBe(250);
    expect(result.product.resale_price_nz).toBe(250);
    expect(result.market?.recommended_price).toBe(250);
    expect(result.meta.request_id).toBe(result.id);
  });
  it('streams real stages and preserves identification when grounding fails', async () => {
    vi.mocked(generateContent).mockResolvedValueOnce({ text: JSON.stringify(vision) } as any).mockRejectedValueOnce({ status: 429 });
    const stages: string[] = [];
    const result = await readAnalysisResponse(await handleAnalysisRequest(request(true)), stage => stages.push(stage));
    expect(stages).toEqual(['identifying', 'grounding']);
    expect(result.status).toBe('identified');
    expect(result.resale_price_nz).toBeNull();
    expect(result.meta.warnings?.join(' ')).toContain('quota');
  });
  it('does not search or invent a price for an unidentified image', async () => {
    vi.mocked(generateContent).mockResolvedValueOnce({ text: JSON.stringify({ ...vision, item: null, item_name: null, confidence: .1 }) } as any);
    const result = await analyzeAppraisal({ image });
    expect(result.status).toBe('unidentified');
    expect(result.market).toBeNull();
    expect(generateContent).toHaveBeenCalledTimes(1);
  });
  it.each([400, 401, 403, 404, 429, 503])('returns an actionable provider error for %s', async status => {
    vi.mocked(generateContent).mockRejectedValue({ status });
    const response = await handleAnalysisRequest(request());
    const body = await response.json();
    expect(response.status).toBe(status === 429 ? 429 : 503);
    expect(body.ok).toBe(false);
    expect(body.error.code).toBe(status === 429 ? 'AI_RATE_LIMITED' : status === 503 ? 'AI_SERVICE_UNAVAILABLE' : 'AI_CONFIGURATION_ERROR');
  });
  it('returns structured 400 for malformed JSON and 405 for GET', async () => {
    expect((await handleAnalysisRequest(request(false, '{bad'))).status).toBe(400);
    const response = await handleAnalysisRequest(new Request('http://localhost/api/analyze'));
    expect(response.status).toBe(405);
    expect(response.headers.get('allow')).toBe('POST');
  });
  it('surfaces missing keys to both JSON and streaming clients', async () => {
    vi.stubEnv('GEMINI_API_KEY', '');
    expect((await handleAnalysisRequest(request())).status).toBe(503);
    await expect(readAnalysisResponse(await handleAnalysisRequest(request(true)), () => {})).rejects.toThrow('not configured');
  });
  it('rejects malformed and empty model responses without returning a success', async () => {
    vi.mocked(generateContent).mockResolvedValueOnce({ text: 'not JSON' } as any);
    expect((await handleAnalysisRequest(request())).status).toBe(502);
    vi.mocked(generateContent).mockResolvedValueOnce({ text: '' } as any);
    expect((await handleAnalysisRequest(request())).status).toBe(502);
  });
  it('rejects incomplete JSON and interrupted streams in the client', async () => {
    await expect(readAnalysisResponse(Response.json({ ok: true }), () => {})).rejects.toThrow('incomplete');
    await expect(readAnalysisResponse(new Response('{"type":"progress","stage":"identifying"}\n', { headers: { 'Content-Type': 'application/x-ndjson' } }), () => {})).rejects.toThrow('interrupted');
  });
  it('reads progress across arbitrary UTF-8 stream chunk boundaries', async () => {
    const bytes = new TextEncoder().encode('{"type":"progress","stage":"grounding"}\n{"type":"error","error":{"message":"Réessayez 📷"}}\n');
    const stream = new ReadableStream({ start(controller) { for (const byte of bytes) controller.enqueue(new Uint8Array([byte])); controller.close(); } });
    const stages: string[] = [];
    await expect(readAnalysisResponse(new Response(stream, { headers: { 'Content-Type': 'application/x-ndjson' } }), s => stages.push(s))).rejects.toThrow('Réessayez 📷');
    expect(stages).toEqual(['grounding']);
  });
});
