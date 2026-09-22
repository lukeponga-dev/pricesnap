import { GoogleGenAI } from '@google/genai';

/**
 * Checks if an error indicates that the Gemini API quota/rate limit is reached.
 * For quota exhaustion, immediate retries will fail and waste resources.
 */
export function isQuotaExhaustedError(err: any): boolean {
  const msg = (err?.message || String(err || '')).toLowerCase();
  const status = err?.status || err?.code || 0;
  return (
    status === 429 ||
    msg.includes('quota') ||
    msg.includes('resource_exhausted') ||
    msg.includes('rate-limit') ||
    msg.includes('rate limit')
  );
}

/**
 * Executes a Gemini API call with exponential backoff for transient 503 (high demand) errors.
 * Fails fast on 429 (quota exhaustion) to prevent spamming failed requests and allow instant fallback.
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  maxRetries: number = 2,
  initialDelayMs: number = 800
): Promise<T> {
  let lastError: any;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (err: any) {
      lastError = err;

      // Fail fast on quota limit so the pipeline immediately uses verified market comparables
      if (isQuotaExhaustedError(err)) {
        console.info('[ValuationEngine:Gemini] API quota reached. Transitioning to benchmark engine.');
        throw err;
      }

      const statusCode = err?.status || err?.code || 0;
      const isTransient = statusCode === 503 || err?.message?.includes('high demand');

      if (isTransient && attempt < maxRetries) {
        const delay = initialDelayMs * Math.pow(2, attempt);
        console.info(`[ValuationEngine:Gemini] Transient service load (attempt ${attempt + 1}/${maxRetries}). Retrying in ${delay}ms...`);
        await new Promise((resolve) => setTimeout(resolve, delay));
        continue;
      }

      throw err;
    }
  }

  throw lastError;
}

/**
 * Initialized GoogleGenAI instance with recommended headers
 */
export function getGeminiClient() {
  const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_AI_STUDIO_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not configured on the server.');
  }

  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build'
      }
    }
  });
}

