import { GoogleGenAI } from '@google/genai';
import { ValuationError } from './errors';

export function modelName(): string {
  return process.env.GEMINI_MODEL?.trim() || 'gemini-3.8-flash';
}

export function hasApiKey(): boolean {
  return Boolean(process.env.GEMINI_API_KEY?.trim() || process.env.GOOGLE_AI_STUDIO_API_KEY?.trim());
}

export function createProvider() {
  const apiKey = process.env.GEMINI_API_KEY?.trim() || process.env.GOOGLE_AI_STUDIO_API_KEY?.trim();
  if (!apiKey) throw new ValuationError('SERVICE_NOT_CONFIGURED', 'Valuation is not configured. The operator needs to set a Gemini API key.', 503);
  return new GoogleGenAI({ apiKey, httpOptions: { timeout: 45000 } });
}
