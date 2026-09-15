import { GoogleGenAI } from "@google/genai";

export const config = {
  runtime: "edge"
};

function getAiClient(): GoogleGenAI {
  const apiKey = process.env.GOOGLE_AI_STUDIO_API_KEY || process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("Missing GOOGLE_AI_STUDIO_API_KEY or GEMINI_API_KEY environment variable.");
  }
  return new GoogleGenAI({ apiKey });
}

// Strict JSON schema prompt
const PRICESNAP_PROMPT = `
You are PriceSnap Vision, a strict JSON-only appraisal engine for the New Zealand secondhand and resale market.

RULES:
- Output ONLY valid JSON.
- No text before or after the JSON.
- No markdown code blocks (no \`\`\`json).
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
    "trend": "rising",
    "recommended_price": 0,
    "best_platform": "Trade Me"
  }
}
`;

export default async function handler(req: Request): Promise<Response> {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization"
      }
    });
  }

  if (req.method !== "POST") {
    return new Response(
      JSON.stringify({ error: "METHOD_NOT_ALLOWED", message: "Only POST requests are supported." }),
      { status: 405, headers: { "Content-Type": "application/json" } }
    );
  }

  try {
    const body = await req.json().catch(() => ({}));
    const rawImage = body.image || body.imageUrl || body.imageBase64;

    // -------------------------------
    // 1. Ingestion validation
    // -------------------------------
    if (!rawImage || typeof rawImage !== "string") {
      return new Response(
        JSON.stringify({
          error: "NO_IMAGE",
          message: "Missing base64 image payload."
        }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    let mimeType = "image/jpeg";
    let base64Data = rawImage;

    if (rawImage.startsWith("data:")) {
      const mimeMatch = rawImage.match(/^data:([^;]+);base64,(.+)$/);
      if (mimeMatch) {
        mimeType = mimeMatch[1];
        base64Data = mimeMatch[2];
      } else {
        base64Data = rawImage.replace(/^data:image\/[a-z]+;base64,/, "");
      }
    }

    if (base64Data.length > 20_000_000) {
      return new Response(
        JSON.stringify({
          error: "IMAGE_TOO_LARGE",
          message: "Image exceeds 15MB limit."
        }),
        { status: 413, headers: { "Content-Type": "application/json" } }
      );
    }

    // -------------------------------
    // 2. Call Gemma / Gemini Vision
    // -------------------------------
    const ai = getAiClient();
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash", // swap to gemma-2-vision when available
      contents: [
        {
          inlineData: {
            data: base64Data,
            mimeType
          }
        },
        {
          text: PRICESNAP_PROMPT
        }
      ],
      config: {
        responseMimeType: "application/json"
      }
    });

    // -------------------------------
    // 3. Extract raw text safely & sanitize
    // -------------------------------
    const raw = response.text || (response as any)?.response?.text?.() || "";

    // Strip thinking blocks, markdown fences, and isolate outer JSON braces
    let clean = raw.replace(/<think>[\s\S]*?<\/think>/gi, "").trim();
    clean = clean.replace(/```(?:json)?/gi, "").replace(/```/g, "").trim();

    const firstBrace = clean.indexOf("{");
    const lastBrace = clean.lastIndexOf("}");

    if (firstBrace !== -1 && lastBrace !== -1 && lastBrace >= firstBrace) {
      clean = clean.substring(firstBrace, lastBrace + 1).trim();
    } else {
      clean = clean.replace(/^[^{]+/, "").replace(/[^}]+$/, "");
    }

    let data: any;
    try {
      data = JSON.parse(clean);
    } catch (err: any) {
      return new Response(
        JSON.stringify({
          error: "INVALID_JSON",
          message: "Model returned malformed JSON.",
          raw
        }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    // -------------------------------
    // 4. Schema validation
    // -------------------------------
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

    // -------------------------------
    // 5. Final safe response
    // -------------------------------
    return new Response(
      JSON.stringify({
        ok: true,
        appraisal: data,
        ...data
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*"
        }
      }
    );

  } catch (error: any) {
    return new Response(
      JSON.stringify({
        error: "AI_STUDIO_UNREACHABLE",
        message: error.message || "Failed to communicate with AI Studio."
      }),
      { status: 502, headers: { "Content-Type": "application/json" } }
    );
  }
}
