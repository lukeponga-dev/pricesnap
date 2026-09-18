import { GoogleGenAI, type GenerateContentParameters } from '@google/genai';

export const DEFAULT_GEMINI_MODEL = 'gemini-3.8-flash';
export const geminiModel = () => {
  const m = process.env.GEMINI_MODEL?.trim();
  return (m && /^(gemini|veo|lyria)-/i.test(m)) ? m : DEFAULT_GEMINI_MODEL;
};
export const groundingModel = () => {
  const m = process.env.GEMINI_GROUNDING_MODEL?.trim();
  return (m && /^(gemini|veo|lyria)-/i.test(m)) ? m : geminiModel();
};
export const geminiKey = () => [process.env.GOOGLE_AI_STUDIO_API_KEY, process.env.GEMINI_API_KEY]
  .map(key => key?.trim()).find(key => key && !key.startsWith('MY_'));

export function providerStatus(error: unknown): number {
  const value = error as { status?: number; code?: number };
  return Number(value?.status ?? value?.code) || 0;
}

// Bound the whole phase, including its one retry. Never retry configuration or quota errors.
export async function generateContent(params: GenerateContentParameters, timeoutMs: number) {
  const ai = new GoogleGenAI({ apiKey: geminiKey(), httpOptions: { retryOptions: { attempts: 1 } } });
  const signal = AbortSignal.timeout(timeoutMs);
  for (let attempt = 0; ; attempt++) {
    try {
      return await ai.models.generateContent({ ...params, config: { ...params.config, abortSignal: signal } });
    } catch (error) {
      if (signal.aborted || attempt > 0 || ![500, 502, 503, 504].includes(providerStatus(error))) throw error;
    }
  }
}
