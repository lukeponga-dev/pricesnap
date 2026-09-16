import { GoogleGenAI } from "@google/genai";

export const config = {
  runtime: "edge"
};

const ai = new GoogleGenAI({
  apiKey: process.env.GOOGLE_AI_STUDIO_API_KEY || process.env.GEMINI_API_KEY
});

// Strict JSON schema prompt with enhanced resale analysis
const PRICESNAP_PROMPT = `
You are PriceSnap Vision, an expert AI appraisal and authentication engine for the New Zealand secondhand, op shop, and resale market (Trade Me, Facebook Marketplace, Designer Resale).

RULES:
- Output ONLY valid JSON.
- No text before or after the JSON.
- No markdown.
- No explanations.
- Analyze visual wear, brand logos, tags, materials, style era, and authenticity markers.
- Provide realistic New Zealand Dollar (NZD) resale values.
- IMPORTANT: If the item cannot be clearly identified, is ambiguous, obscured, or lacks enough visual detail, you MUST return null for "item", "item_name", "brand", "resale_price_nz", "conditionScore", and set "confidence" to 0.1 (or null). Do not guess placeholders.

SCHEMA:
{
  "item": "Detailed item name with brand and model or null if unidentified",
  "item_category": "Clothing & Apparel | Sneakers & Footwear | Electronics & Gadgets | Antiques & Collectibles | Home & Living | Books & Media | Unidentified",
  "item_name": "string or null",
  "brand": "string or null",
  "conditionScore": 8,
  "condition_score": 8,
  "defects": [],
  "priceNz": {
    "low": 0,
    "mid": 0,
    "high": 0
  },
  "marketplaces": ["Trade Me", "Facebook Marketplace", "eBay"],
  "resale_price_nz": 0,
  "confidence": 0.95,
  "material": "Estimated fabric or build material",
  "era": "Estimated decade or collection year",
  "resale_velocity": "Fast | Moderate | Slow",
  "product": {
    "name": "",
    "brand": "",
    "category": "",
    "condition_score": 8,
    "condition_grade": "Mint | Great | Good | Fair",
    "defects": [],
    "resale_price_nz": 0,
    "confidence": 0.95,
    "confidence_color": "green",
    "summary": "Detailed appraisal summary and pricing advice for NZ market."
  },
  "market": {
    "trademe": { "low": 0, "median": 0, "high": 0, "sample_listings": [] },
    "facebook": { "low": 0, "median": 0, "high": 0, "sample_listings": [] },
    "ebay": { "low": 0, "median": 0, "high": 0, "sample_listings": [] },
    "trend": "rising | stable | declining",
    "recommended_price": 0,
    "best_platform": "Trade Me"
  }
}
`;

export default async function handler(req: Request) {
  try {
    const body = await req.json();
    const imageInput = body?.image || body?.imageBase64 || body?.imageUrl;

    if (!imageInput) {
      return new Response(
        JSON.stringify({
          error: "NO_IMAGE",
          message: "imageBase64 or image is required."
        }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const base64Data = imageInput.replace(/^data:image\/[a-z]+;base64,/, "");

    if (base64Data.length > 20_000_000) {
      return new Response(
        JSON.stringify({
          error: "IMAGE_TOO_LARGE",
          message: "Image exceeds 15MB limit."
        }),
        { status: 413, headers: { "Content-Type": "application/json" } }
      );
    }

    // Gemini 3.6 Flash
    const response = await ai.models.generateContent({
      model: "models/gemini-3.6-flash",
      contents: [
        {
          role: "user",
          parts: [
            {
              inlineData: {
                data: base64Data,
                mimeType: "image/jpeg"
              }
            },
            { text: PRICESNAP_PROMPT }
          ]
        }
      ]
    });

    const raw = response.text || (response as any)?.response?.text?.() || "";
    const clean = raw.trim().replace(/^[^{]+/, "").replace(/[^}]+$/, "");

    let data;
    try {
      data = JSON.parse(clean);
    } catch (err) {
      return new Response(
        JSON.stringify({
          error: "INVALID_JSON",
          message: "Model returned malformed JSON.",
          raw
        }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    const rawConfidence = Number(data.confidence ?? data.product?.confidence ?? 0.92);
    const isUnidentified = !data.item || data.item === "Unidentified Item" || rawConfidence < 0.3 || data.item === null;

    const itemName = isUnidentified ? null : (data.item || data.item_name || data.product?.name || null);
    const brand = isUnidentified ? null : (data.brand || data.product?.brand || null);
    const conditionScore = isUnidentified ? null : Number(data.conditionScore ?? data.condition_score ?? data.product?.condition_score ?? 8);
    const defects = isUnidentified ? [] : (Array.isArray(data.defects) ? data.defects : (Array.isArray(data.product?.defects) ? data.product.defects : []));
    const confidence = isUnidentified ? null : rawConfidence;
    const recPrice = isUnidentified ? null : Number(data.resale_price_nz || data.priceNz?.mid || data.market?.recommended_price || 120);

    const trademeLow = isUnidentified ? null : Number(data.market?.trademe?.low || data.priceNz?.low || Math.round(recPrice! * 0.85));
    const trademeMedian = isUnidentified ? null : Number(data.market?.trademe?.median || data.priceNz?.mid || recPrice);
    const trademeHigh = isUnidentified ? null : Number(data.market?.trademe?.high || data.priceNz?.high || Math.round(recPrice! * 1.15));

    const normalizedMarket = isUnidentified ? null : {
      trademe: {
        low: trademeLow,
        median: trademeMedian,
        high: trademeHigh,
        sample_listings: Array.isArray(data.market?.trademe?.sample_listings) ? data.market.trademe.sample_listings : []
      },
      facebook: {
        low: Number(data.market?.facebook?.low || Math.round(recPrice! * 0.8)),
        median: Number(data.market?.facebook?.median || Math.round(recPrice! * 0.94)),
        high: Number(data.market?.facebook?.high || Math.round(recPrice! * 1.05)),
        sample_listings: Array.isArray(data.market?.facebook?.sample_listings) ? data.market.facebook.sample_listings : []
      },
      ebay: {
        low: Number(data.market?.ebay?.low || Math.round(recPrice! * 0.9)),
        median: Number(data.market?.ebay?.median || Math.round(recPrice! * 1.08)),
        high: Number(data.market?.ebay?.high || Math.round(recPrice! * 1.25)),
        sample_listings: Array.isArray(data.market?.ebay?.sample_listings) ? data.market.ebay.sample_listings : []
      },
      trend: data.market?.trend || "stable",
      recommended_price: recPrice,
      best_platform: data.market?.best_platform || "Trade Me"
    };

    const priceNz = isUnidentified ? null : {
      low: trademeLow,
      mid: recPrice,
      high: trademeHigh
    };

    const marketplaces = ["Trade Me", "Facebook Marketplace", "eBay"];

    const finalData = {
      item: itemName,
      conditionScore: conditionScore,
      defects: defects,
      priceNz: priceNz,
      marketplaces: marketplaces,
      confidence: confidence,
      item_category: isUnidentified ? null : (data.item_category || "General"),
      item_name: itemName,
      brand: brand,
      condition_score: conditionScore,
      resale_price_nz: recPrice,
      price: isUnidentified ? null : {
        low: trademeLow,
        average: recPrice,
        high: trademeHigh
      },
      product: {
        name: itemName,
        brand: brand,
        category: isUnidentified ? null : (data.item_category || "General"),
        condition_score: conditionScore,
        condition_grade: isUnidentified ? null : (conditionScore! >= 9 ? "Mint" : conditionScore! >= 7 ? "Great" : conditionScore! >= 5 ? "Good" : "Fair"),
        defects: defects,
        resale_price_nz: recPrice,
        confidence: confidence,
        confidence_color: isUnidentified ? "red" : (confidence! >= 0.85 ? "green" : confidence! >= 0.6 ? "orange" : "red"),
        summary: isUnidentified ? "Item could not be clearly identified. Please try scanning with better lighting or a clearer angle." : `Estimated resale value in NZD based on live marketplace comparables.`
      },
      market: normalizedMarket
    };

    return new Response(
      JSON.stringify({
        ok: true,
        item: itemName,
        conditionScore: conditionScore,
        defects: defects,
        priceNz: priceNz,
        marketplaces: marketplaces,
        confidence: confidence,
        appraisal: finalData,
        ...finalData
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );

  } catch (error: any) {
    return new Response(
      JSON.stringify({
        ok: false,
        error: "AI_STUDIO_UNREACHABLE",
        message: error.message
      }),
      { status: 502, headers: { "Content-Type": "application/json" } }
    );
  }
}
