import { GoogleGenAI, GenerateContentResponse } from '@google/genai';

/**
 * Executes a Gemini API call with exponential backoff for 503 (Unavailable) and 429 (Quota) errors.
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  initialDelayMs: number = 1000
): Promise<T> {
  let lastError: any;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (err: any) {
      lastError = err;
      const statusCode = err?.status || err?.code || 0;
      const isRetryable = statusCode === 503 || statusCode === 429 || 
                          err?.message?.includes('high demand') || 
                          err?.message?.includes('quota');

      if (isRetryable && attempt < maxRetries) {
        const delay = initialDelayMs * Math.pow(2, attempt);
        console.warn(`[Gemini Retry] Attempt ${attempt + 1} failed with ${statusCode}. Retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
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
