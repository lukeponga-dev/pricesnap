import type { ListingComparable } from './schema';
import { calculateResellerValuation, robustMarketStats } from './valuation';

export async function groundMarket(itemName: string, conditionScore: number | null = null, defects: string[] = []) {
  const started = Date.now();
  const warnings: string[] = [];
  let aiListings: ListingComparable[] = [];

  const apiKey = process.env.GOOGLE_AI_STUDIO_API_KEY || process.env.GEMINI_API_KEY;
  if (apiKey) {
    try {
      const { GoogleGenAI, Type } = await import('@google/genai');
      const ai = new GoogleGenAI({ apiKey, httpOptions: { headers: { 'User-Agent': 'aistudio-build' } } });
      
      const conditionStr = conditionScore !== null ? `Condition score: ${conditionScore}/10.` : 'Condition: Unknown.';
      const defectsStr = defects.length ? ` Known defects: ${defects.join(', ')}.` : '';
      
      const prompt = `Search online using Google Search for the current second-hand / resale value of the following item: "${itemName}".
${conditionStr}${defectsStr}
Find recent listings on resale platforms (eBay, local classifieds, etc.).
Extract an estimated reasonable resale price (in NZD or USD, convert to NZD if possible).
Extract up to 6 sample listings with their title, URL, and estimated price in NZD.
Do not hallucinate URLs. Ensure they come from the search results.`;

      const res = await ai.models.generateContent({
        model: 'gemini-3.5-flash',
        contents: prompt,
        config: {
          tools: [{ googleSearch: {} }],
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              low: { type: Type.NUMBER, nullable: true },
              median: { type: Type.NUMBER, nullable: true },
              high: { type: Type.NUMBER, nullable: true },
              sample_listings: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    title: { type: Type.STRING },
                    url: { type: Type.STRING },
                    priceNzd: { type: Type.NUMBER }
                  },
                  required: ["title", "url", "priceNzd"]
                }
              }
            },
            required: ["sample_listings"]
          }
        }
      });
      
      const data = JSON.parse(res.text || '{}');
      if (Array.isArray(data.sample_listings)) {
        aiListings = data.sample_listings.map((l: any) => ({
          source: 'google_search',
          title: l.title || 'Unknown Listing',
          url: l.url || 'https://google.com',
          priceNzd: Number(l.priceNzd) || 0,
          condition: null,
          retrievedAt: new Date().toISOString()
        })).filter((l: any) => l.priceNzd > 0);
      }
    } catch (e: any) {
      warnings.push(`AI Search Agent: ${e?.message || String(e)}`);
    }
  }

  const allListings = [...aiListings];
  const combinedMarket = robustMarketStats(allListings);
  const valuation = calculateResellerValuation([combinedMarket]);

  return {
    market: {
      trademe: null,
      facebook: null,
      ebay: combinedMarket, // Using generic grounded market
      trend: null,
      recommended_price: valuation.recommendedPrice,
      best_platform: combinedMarket?.median != null ? 'Google Search' : null,
      grounded: valuation.evidenceCount > 0,
    },
    durationMs: Date.now() - started,
    warnings,
  };
}
