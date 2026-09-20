import { Type } from '@google/genai';
import { IdentifiedProduct } from '../types';
import { createProvider, modelName } from '../provider';
import { ValuationError } from '../errors';
import { parseImage } from '../image';
import { IDENTIFICATION_SYSTEM_INSTRUCTION, normalizeIdentifiedProduct } from './schema';

export async function identifyProduct(imageInput: Buffer | string, signal?: AbortSignal): Promise<IdentifiedProduct> {
  const image = parseImage(Buffer.isBuffer(imageInput) ? imageInput.toString('base64') : imageInput);
  const response = await createProvider().models.generateContent({
    model: modelName(),
    contents: [{ role: 'user', parts: [
      { inlineData: image },
      { text: 'Identify the single main resale item and its visible cosmetic condition. If the image is unclear or not a product, use low certainty. Do not infer functioning, battery health or hidden specifications.' }
    ] }],
    config: {
      abortSignal: signal,
      systemInstruction: IDENTIFICATION_SYSTEM_INSTRUCTION,
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          item_name: { type: Type.STRING }, brand: { type: Type.STRING },
          category: { type: Type.STRING }, modelVariant: { type: Type.STRING },
          condition_score: { type: Type.INTEGER }, condition_grade: { type: Type.STRING },
          defects: { type: Type.ARRAY, items: { type: Type.STRING } },
          summary: { type: Type.STRING }, certaintyScore: { type: Type.NUMBER },
          suggestedQueries: { type: Type.ARRAY, items: { type: Type.STRING } }
        },
        required: ['item_name', 'brand', 'category', 'condition_score', 'condition_grade', 'defects', 'summary', 'certaintyScore']
      }
    }
  });
  let raw: any;
  try { raw = JSON.parse(response.text || ''); }
  catch { throw new ValuationError('INVALID_AI_RESPONSE', 'The AI returned an unreadable identification. Please try again.'); }
  if (!raw || typeof raw.item_name !== 'string' || !raw.item_name.trim() ||
      typeof raw.certaintyScore !== 'number' || !Number.isFinite(raw.certaintyScore) ||
      typeof raw.condition_score !== 'number' || !Number.isFinite(raw.condition_score)) {
    throw new ValuationError('INVALID_AI_RESPONSE', 'The AI did not return a complete identification. Please try again.');
  }
  const product = normalizeIdentifiedProduct(raw);
  if (product.certaintyScore < 0.6) {
    throw new ValuationError('IDENTIFICATION_UNCERTAIN', 'The item could not be identified confidently. Try a clearer photo showing its model label.', 422);
  }
  return product;
}
