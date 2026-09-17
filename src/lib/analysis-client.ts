import { SuccessResponseSchema } from '../server/schema';
import type { AnalysisState, ScanResult } from '../types';

export async function readAnalysisResponse(response: Response, onProgress: (stage: AnalysisState) => void): Promise<ScanResult> {
  if (!response.ok) {
    const data = await response.json().catch(() => null);
    throw new Error(data?.error?.message || (response.status === 413 ? 'The photo is too large. Try a smaller image.' : `Analysis service failed (${response.status}). Please try again.`));
  }
  if (!response.headers.get('content-type')?.includes('application/x-ndjson')) {
    const value = await response.json();
    if (value?.ok === false) throw new Error(value.error?.message || 'Analysis failed.');
    const result = SuccessResponseSchema.safeParse(value);
    if (!result.success) throw new Error('The analysis service returned an incomplete result. Please try again.');
    return result.data;
  }
  if (!response.body) throw new Error('The analysis response was empty.');
  const reader = response.body.getReader(), decoder = new TextDecoder();
  let pending = '', result: ScanResult | undefined;
  const consume = (line: string) => {
    if (!line.trim()) return;
    const event = JSON.parse(line);
    if (event.type === 'progress' && ['identifying', 'grounding'].includes(event.stage)) onProgress(event.stage);
    if (event.type === 'error') throw new Error(event.error?.message || 'Analysis failed.');
    if (event.type === 'result') result = SuccessResponseSchema.parse(event.data);
  };
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      pending += decoder.decode(value, { stream: true });
      const lines = pending.split('\n');
      pending = lines.pop() || '';
      lines.forEach(consume);
    }
    consume(pending + decoder.decode());
  } finally { await reader.cancel(); reader.releaseLock(); }
  if (!result) throw new Error('Analysis was interrupted. Please try again.');
  return result;
}

// Keep base64 JSON comfortably below typical serverless request limits.
export async function prepareImage(dataUrl: string): Promise<string> {
  if (!/^data:image\/(jpeg|png|webp);base64,/.test(dataUrl)) throw new Error('Please upload a JPEG, PNG or WebP photo.');
  const image = new Image();
  image.src = dataUrl;
  try { await image.decode(); } catch { throw new Error('The photo could not be opened. Please choose another image.'); }
  const scale = Math.min(1, 1600 / Math.max(image.naturalWidth, image.naturalHeight));
  const canvas = document.createElement('canvas');
  canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
  canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));
  const context = canvas.getContext('2d');
  if (!context) throw new Error('Your browser could not prepare this photo.');
  context.fillStyle = '#ffffff';
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.drawImage(image, 0, 0, canvas.width, canvas.height);
  const prepared = canvas.toDataURL('image/jpeg', .85);
  if (prepared.length > 4_000_000) throw new Error('The photo is too large. Please crop it closer to the item.');
  return prepared;
}
