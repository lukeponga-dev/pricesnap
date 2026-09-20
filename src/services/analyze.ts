import type { ScanResult, ValuationStage } from '../types';

export async function analyzeImage(image: string, signal: AbortSignal, progress: (stage: ValuationStage) => void): Promise<ScanResult> {
  const response = await fetch('/api/analyze', {
    method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/x-ndjson' },
    body: JSON.stringify({ image }), signal
  });
  const validate = (data: any): ScanResult => {
    const result = data?.appraisal ?? data;
    if (!result || !['success', 'insufficient_evidence'].includes(result.status) || !result.product || !result.evidence || !result.valuation ||
        (result.status === 'success' && !(Number.isFinite(result.valuation.estimatedValue) && result.valuation.estimatedValue > 0))) {
      throw new Error('The server returned an incomplete valuation. Please try again.');
    }
    return result;
  };
  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(body.message || `Analysis unavailable (HTTP ${response.status}). Please try again.`);
  }
  if (!response.headers.get('content-type')?.includes('application/x-ndjson')) return validate(await response.json());
  const reader = response.body?.getReader();
  if (!reader) throw new Error('The server did not return a response.');
  const decoder = new TextDecoder();
  let buffer = '', result: ScanResult | undefined;
  const consume = (line: string) => {
    if (!line.trim()) return;
    const event = JSON.parse(line);
    if (event.type === 'progress' && ['identifying', 'searching', 'calculating'].includes(event.stage)) progress(event.stage);
    if (event.type === 'error') throw new Error(event.message || 'Analysis failed.');
    if (event.type === 'result') result = validate(event.data);
  };
  try {
    while (true) {
      const { done, value } = await reader.read();
      buffer += decoder.decode(value, { stream: !done });
      const lines = buffer.split('\n'); buffer = lines.pop() || '';
      for (const line of lines) consume(line);
      if (done) { consume(buffer); break; }
    }
  } finally { await reader.cancel().catch(() => {}); reader.releaseLock(); }
  if (!result) throw new Error('The scan connection ended before a result arrived. Please retry.');
  return result;
}
