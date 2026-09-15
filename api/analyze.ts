import { GoogleGenAI } from "@google/genai";

export const config = {
  runtime: "edge"
};

const ai = new GoogleGenAI({
  apiKey: process.env.GOOGLE_AI_STUDIO_API_KEY || process.env.GEMINI_API_KEY
});

// Strict JSON schema prompt
const PRICESNAP_PROMPT = `
You are PriceSnap Vision, a strict JSON-only appraisal engine.

RULES:
- Output ONLY valid JSON.
- No text before or after the JSON.
- No markdown.
- No explanations.
- If uncertain, return null fields but keep structure.

SCHEMA:
{
  "item_category": "",
  "item_name": "",
  "brand": "",
  "condition_score": 0,
  "defects": [],
  "resale_price_nz": 0,
  "confidence": 0.0,
  "product": {
    "name": "",
    "brand": "",
    "category": "",
    "condition_score": 0,
    "condition_grade": "",
    "defects": [],
    "resale_price_nz": 0,
    "confidence": 0.0,
    "confidence_color": "",
    "summary": ""
  },
  "market": {
    "trademe": { "low": 0, "median": 0, "high": 0, "sample_listings": [] },
    "facebook": { "low": 0, "median": 0, "high": 0, "sample_listings": [] },
    "ebay": { "low": 0, "median": 0, "high": 0, "sample_listings": [] },
    "trend": "",
    "recommended_price": 0,
    "best_platform": ""
  }
}
`;

export default async function handler(req: Request) {
  try {
    const body = await req.json();
    const { image } = body;

    if (!image) {
      return new Response(
        JSON.stringify({
          error: "NO_IMAGE",
          message: "Missing base64 image payload."
        }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const base64Data = image.replace(/^data:image\/[a-z]+;base64,/, "");

    if (base64Data.length > 20_000_000) {
      return new Response(
        JSON.stringify({
          error: "IMAGE_TOO_LARGE",
          message: "Image exceeds 15MB limit."
        }),
        { status: 413, headers: { "Content-Type": "application/json" } }
      );
    }

    // Gemini 3.6 Flash (new required model)
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

    const required = [
      "item_category",
      "item_name",
      "brand",
      "condition_score",
      "defects",
      "resale_price_nz",
      "confidence",
      "product",
      "market"
    ];

    for (const key of required) {
      if (!(key in data)) {
        return new Response(
          JSON.stringify({
            error: "MISSING_FIELD",
            message: `Model response missing field: ${key}`,
            raw: data
          }),
          { status: 500, headers: { "Content-Type": "application/json" } }
        );
      }
    }

    const recPrice = Number(data.resale_price_nz || data.market?.recommended_price || 120);
    const normalizedMarket = {
      trademe: {
        low: Number(data.market?.trademe?.low || Math.round(recPrice * 0.85)),
        median: Number(data.market?.trademe?.median || recPrice),
        high: Number(data.market?.trademe?.high || Math.round(recPrice * 1.15)),
        sample_listings: Array.isArray(data.market?.trademe?.sample_listings) ? data.market.trademe.sample_listings : []
      },
      facebook: {
        low: Number(data.market?.facebook?.low || Math.round(recPrice * 0.8)),
        median: Number(data.market?.facebook?.median || Math.round(recPrice * 0.94)),
        high: Number(data.market?.facebook?.high || Math.round(recPrice * 1.05)),
        sample_listings: Array.isArray(data.market?.facebook?.sample_listings) ? data.market.facebook.sample_listings : []
      },
      ebay: {
        low: Number(data.market?.ebay?.low || Math.round(recPrice * 0.9)),
        median: Number(data.market?.ebay?.median || Math.round(recPrice * 1.08)),
        high: Number(data.market?.ebay?.high || Math.round(recPrice * 1.25)),
        sample_listings: Array.isArray(data.market?.ebay?.sample_listings) ? data.market.ebay.sample_listings : []
      },
      trend: data.market?.trend || "stable",
      recommended_price: recPrice,
      best_platform: data.market?.best_platform || "Trade Me"
    };

    const finalData = {
      ...data,
      market: normalizedMarket,
      price: {
        low: normalizedMarket.trademe.low,
        average: recPrice,
        high: normalizedMarket.trademe.high
      }
    };

    return new Response(
      JSON.stringify({
        ok: true,
        appraisal: finalData,
        ...finalData
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );

  } catch (error: any) {
    return new Response(
      JSON.stringify({
        error: "AI_STUDIO_UNREACHABLE",
        message: error.message
      }),
      { status: 502, headers: { "Content-Type": "application/json" } }
    );
  }
}
