import { GenerateContentResponse } from '@google/genai';
import { normalizeIdentifiedProduct } from '../../src/lib/valuation-engine/identification/schema';
import { parseGroundedResponse } from '../../src/lib/valuation-engine/search/groundedSearch';

export const image = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAIAAAD8GO2jAAAACXBIWXMAAAPoAAAD6AG1e1JrAAAAMklEQVRIie3QMQ0AAAjAMCTiXw0SdvG1BpZs9tkIFIuSRcmiZFGyKFmULEoWJYvS+6IDYTPALnS25KcAAAAASUVORK5CYII=';
export const product = normalizeIdentifiedProduct({ item_name: 'Sony WH-1000XM4 headphones', brand: 'Sony', category: 'Audio', condition_score: 8, condition_grade: 'A-', summary: 'Visible light cosmetic wear; functionality unverified.', certaintyScore: 0.94, defects: [] });
export const rows = [240, 260, 280].map((price, index) => ({
  title: `Sony WH-1000XM4 headphones ${index + 1}`, price, currency: 'NZD',
  platform: 'Trade Me', url: `https://www.trademe.co.nz/a/marketplace/listing/${100001 + index}`,
  conditionMentioned: 'Used', priceType: 'asking'
}));

export function providerResponse(listings: any[] = rows, grounded = true): GenerateContentResponse {
  const response = new GenerateContentResponse();
  const text = JSON.stringify(listings, null, 2);
  let cursor = 0;
  response.candidates = [{ content: { parts: [{ text }] }, groundingMetadata: {
    groundingChunks: listings.map(row => ({ web: { uri: row.url, title: row.platform } })),
    groundingSupports: grounded ? listings.map((row, index) => {
      const start = text.indexOf('{', cursor), end = text.indexOf('}', start) + 1; cursor = end;
      return { segment: { startIndex: Buffer.byteLength(text.slice(0, start)), endIndex: Buffer.byteLength(text.slice(0, end)), text: text.slice(start, end) }, groundingChunkIndices: [index] };
    }) : []
  } }];
  return response;
}
export const dependencies = {
  identifyProduct: async () => product,
  groundedSearch: async () => parseGroundedResponse(providerResponse())
};
