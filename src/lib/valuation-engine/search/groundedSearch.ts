// =========================================================
// Step 2 & 3: Grounded Search with Live Market Evidence
// =========================================================

import { GoogleGenAI } from '@google/genai';
import { IdentifiedProduct, RawEvidenceListing } from '../types';

export interface GroundedSearchResult {
  rawListings: RawEvidenceListing[];
  groundingSources: Array<{ title: string; url: string }>;
  searchSummary?: string;
}

export async function groundedSearch(
  product: IdentifiedProduct,
  queries: string[]
): Promise<GroundedSearchResult> {
  const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_AI_STUDIO_API_KEY;
  if (!apiKey) return emptyResult('No Gemini API key configured.');

  try {
    const ai = new GoogleGenAI({ apiKey });
    const queryList = queries.length ? queries.join('\n- ') : `${product.brand} ${product.name} used NZ`;
    const prompt = `
Find current, publicly discoverable second-hand market evidence for "${product.brand} ${product.name}".
Prioritize New Zealand results, especially Trade Me and Facebook Marketplace, then eBay and reputable second-hand retailers.
Search using these queries:
- ${queryList}

Return ONLY listings you can support from search results. Never invent a listing, URL, price, sale status, or marketplace.
Do not infer a price when the source does not expose one. Active asking prices are not sold prices.
Return a JSON array:
[
  {
    "title": "...",
    "price": 340,
    "currency": "NZD",
    "platform": "Trade Me",
    "url": "https://...",
    "conditionMentioned": "Used"
  }
]
If no trustworthy priced comparables are found, return [].
`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: { tools: [{ googleSearch: {} }] }
    });

    const text = response.text || '';
    const sources: Array<{ title: string; url: string }> = [];
    const metadata = (response.candidates?.[0] as any)?.groundingMetadata;
    if (metadata?.groundingChunks) {
      for (const chunk of metadata.groundingChunks) {
        if (chunk.web?.uri) sources.push({ title: chunk.web.title || 'Market Source', url: chunk.web.uri });
      }
    }

    return {
      rawListings: parseJsonListings(text),
      groundingSources: sources,
      searchSummary: text.slice(0, 300)
    };
  } catch (err: any) {
    console.warn('[ValuationEngine:groundedSearch] Search unavailable:', err?.message || err);
    return emptyResult('Grounded search unavailable.');
  }
}

function emptyResult(searchSummary: string): GroundedSearchResult {
  return { rawListings: [], groundingSources: [], searchSummary };
}

function parseJsonListings(rawText: string): RawEvidenceListing[] {
  try {
    const jsonMatch = rawText.match(/\[\s*\{[\s\S]*\}\s*\]|\[\s*\]/);
    if (!jsonMatch) return [];
    const parsed = JSON.parse(jsonMatch[0]);
    if (!Array.isArray(parsed)) return [];

    return parsed.flatMap((item: any, i: number) => {
      const price = Number(item?.price);
      const url = typeof item?.url === 'string' ? item.url.trim() : '';
      const title = typeof item?.title === 'string' ? item.title.trim() : '';
      if (!Number.isFinite(price) || price <= 0 || !title || !/^https?:\/\//i.test(url)) return [];
      return [{
        id: `src-${i + 1}`,
        title,
        price,
        currency: String(item.currency || 'NZD').toUpperCase(),
        platform: String(item.platform || 'Other NZ Retailer'),
        url,
        conditionMentioned: item.conditionMentioned || item.condition || undefined
      }];
    });
  } catch {
    return [];
  }
}
