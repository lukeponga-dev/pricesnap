import { ValuationError } from './errors';

// Keeps base64 JSON comfortably below Vercel's request-size ceiling.
export const MAX_IMAGE_BYTES = 3_000_000;

export function parseImage(input: unknown): { data: string; mimeType: string } {
  if (typeof input !== 'string' || !input.trim()) {
    throw new ValuationError('INVALID_IMAGE', 'Upload a JPEG, PNG or WebP image.', 400);
  }
  const match = input.match(/^data:(image\/(?:jpeg|png|webp));base64,([A-Za-z0-9+/=]+)$/);
  const data = match ? match[2] : input;
  if (data.length > Math.ceil(MAX_IMAGE_BYTES / 3) * 4) {
    throw new ValuationError('IMAGE_TOO_LARGE', 'The image must be smaller than 3 MB after compression.', 413);
  }
  if (!data.length || data.length % 4 !== 0 || /[^A-Za-z0-9+/=]/.test(data) || /=[^=]/.test(data) || (data.match(/=/g)?.length || 0) > 2) {
    throw new ValuationError('INVALID_IMAGE', 'The image must contain valid base64 JPEG, PNG or WebP data.', 400);
  }
  const bytes = Buffer.from(data, 'base64');
  let mimeType: string | undefined;
  if (bytes.length > 12 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) mimeType = 'image/jpeg';
  if (bytes.length > 24 && bytes.subarray(0, 8).equals(Buffer.from([137,80,78,71,13,10,26,10]))) mimeType = 'image/png';
  if (bytes.length > 16 && bytes.toString('ascii', 0, 4) === 'RIFF' && bytes.toString('ascii', 8, 12) === 'WEBP') mimeType = 'image/webp';
  if (!mimeType || (match && match[1] !== mimeType)) {
    throw new ValuationError('INVALID_IMAGE', 'Image type does not match its contents. Use JPEG, PNG or WebP.', 400);
  }
  return { data, mimeType };
}
