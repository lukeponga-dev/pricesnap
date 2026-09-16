import { GoogleGenAI } from "@google/genai";

export class AppraisalError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number,
    public details?: unknown
  ) {
    super(message);
    this.name = "AppraisalError";
  }
}

export const MAX_IMAGE_DATA_LENGTH = 20_000_000;
export const GEMINI_MODEL = "models/gemini-3.6-flash";

const PRICESNAP_PROMPT = `
You are PriceSnap Vision, an AI appraisal engine for the New Zealand secondhand and resale market.

RULES:
- Output ONLY valid JSON.
- No text before or after the JSON.
- No markdown.
- No explanations.
- Analyze only what can reasonably be inferred from the supplied image.
- Prices are AI estimates, not live marketplace listings.
- If the item cannot be clearly identified, is ambiguous, obscured, or lacks enough visual detail, return null for item, item_name, brand, resale_price_nz and condition_score, and set confidence to 0.1 or null. Do not invent an identity.

SCHEMA:
{
  "item": "Detailed item name with brand/model or null",
  "item_category": "string or null",
  "item_name": "string or null",
  "brand": "string or null",
  "condition_score": 0,
  "defects": [],
  "resale_price_nz": 0,
  "confidence": 0.0,
  "market": {
    "trademe": { "low": 0, "median": 0, "high": 0, "sample_listings": [] },
    "facebook": { "low": 0, "median": 0, "high": 0, "sample_listings": [] },
    "ebay": { "low": 0, "median": 0, "high": 0, "sample_listings": [] },
    "trend": "rising | stable | falling",
    "recommended_price": 0,
    "best_platform": "Trade Me | Facebook Marketplace | eBay"
  }
}
`;

function parseImageInput(body: any) {
  const imageInput = body?.imageBase64 || body?.image;

  if (!imageInput || typeof imageInput !== "string" || !imageInput.trim()) {
    throw new AppraisalError("imageBase64 or image is required.", "NO_IMAGE", 400);
  }

  if (imageInput.length > MAX_IMAGE_DATA_LENGTH) {
    throw new AppraisalError("Image exceeds the 20MB encoded payload limit.", "IMAGE_TOO_LARGE", 413);
  }

  const match = imageInput.match(/^data:(image\/(?:jpeg|jpg|png|webp));base64,(.+)$/s);
  if (!match) {
    throw new AppraisalError(
      "Unsupported image format. Send a JPEG, PNG, or WebP base64 data URL.",
      "UNSUPPORTED_IMAGE",
      415
    );
  }

  return {
    mimeType: match[1] === "image/jpg" ? "image/jpeg" : match[1],
    base64Data: match[2]
  };
}

export function sanitizeAndParseJson(raw: string): any {
  if (!raw || typeof raw !== "string") {
    throw new AppraisalError("Empty response from appraisal model.", "EMPTY_MODEL_RESPONSE", 502);
  }

  let clean = raw.replace(/<think>[\s\S]*?<\/think>/gi, "").trim();
  clean = clean.replace(/```(?:json)?/gi, "").replace(/```/g, "").trim();

  const firstBrace = clean.indexOf("{");
  const lastBrace = clean.lastIndexOf("}");
  if (firstBrace < 0 || lastBrace < firstBrace) {
    throw new AppraisalError("Model response did not contain a JSON object.", "INVALID_MODEL_JSON", 502);
  }

  try {
    return JSON.parse(clean.slice(firstBrace, lastBrace + 1));
  } catch {
    throw new AppraisalError("Model returned malformed JSON.", "INVALID_MODEL_JSON", 502);
  }
}

function finiteNumber(value: unknown): number | null {
  if (value === null || value === undefined || value === "") return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

function normalizeConfidence(value: unknown): number | null {
  let confidence = finiteNumber(value);
  if (confidence === null) return null;
  if (confidence > 1 && confidence <= 100) confidence /= 100;
  return Math.max(0, Math.min(1, confidence));
}

function conditionGrade(score: number | null) {
  if (score === null) return null;
  if (score >= 9) return "Mint";
  if (score >= 7) return "Great";
  if (score >= 5) return "Good";
  return "Fair";
}

function normalizePlatform(platform: any) {
  return {
    low: finiteNumber(platform?.low),
    median: finiteNumber(platform?.median),
    high: finiteNumber(platform?.high),
    sample_listings: Array.isArray(platform?.sample_listings) ? platform.sample_listings : []
  };
}

export function normalizeAppraisal(data: any) {
  const confidence = normalizeConfidence(data?.confidence ?? data?.product?.confidence);
  const rawName = data?.item ?? data?.item_name ?? data?.product?.name ?? null;
  const unidentified = !rawName || (confidence !== null && confidence < 0.3);

  if (unidentified) {
    return {
      status: "unidentified" as const,
      item: null,
      item_category: null,
      item_name: null,
      brand: null,
      conditionScore: null,
      condition_score: null,
      defects: [],
      resale_price_nz: null,
      confidence,
      priceNz: null,
      price: null,
      marketplaces: ["Trade Me", "Facebook Marketplace", "eBay"],
      market: null,
      product: {
        name: null,
        brand: null,
        category: null,
        condition_score: null,
        condition_grade: null,
        defects: [],
        resale_price_nz: null,
        confidence,
        confidence_color: "red",
        summary: "Item could not be clearly identified. Try better lighting or a clearer angle."
      }
    };
  }

  const itemName = String(rawName);
  const brand = data?.brand ?? data?.product?.brand ?? null;
  const category = data?.item_category ?? data?.product?.category ?? "General";
  const rawScore = finiteNumber(data?.condition_score ?? data?.conditionScore ?? data?.product?.condition_score);
  const score = rawScore === null ? null : Math.max(1, Math.min(10, rawScore));
  const defects = Array.isArray(data?.defects)
    ? data.defects
    : Array.isArray(data?.product?.defects)
      ? data.product.defects
      : [];
  const recPrice = finiteNumber(data?.resale_price_nz ?? data?.market?.recommended_price);
  const market = {
    trademe: normalizePlatform(data?.market?.trademe),
    facebook: normalizePlatform(data?.market?.facebook),
    ebay: normalizePlatform(data?.market?.ebay),
    trend: data?.market?.trend ?? null,
    recommended_price: recPrice,
    best_platform: data?.market?.best_platform ?? null
  };

  return {
    status: "identified" as const,
    item: itemName,
    item_category: category,
    item_name: itemName,
    brand,
    conditionScore: score,
    condition_score: score,
    defects,
    resale_price_nz: recPrice,
    confidence,
    priceNz: recPrice === null ? null : {
      low: market.trademe.low,
      mid: recPrice,
      high: market.trademe.high
    },
    price: recPrice === null ? null : {
      low: market.trademe.low,
      average: recPrice,
      high: market.trademe.high
    },
    marketplaces: ["Trade Me", "Facebook Marketplace", "eBay"],
    market,
    product: {
      name: itemName,
      brand,
      category,
      condition_score: score,
      condition_grade: conditionGrade(score),
      defects,
      resale_price_nz: recPrice,
      confidence,
      confidence_color: confidence === null ? "orange" : confidence >= 0.85 ? "green" : confidence >= 0.6 ? "orange" : "red",
      summary: "AI-estimated NZ resale appraisal. Marketplace figures are estimates unless supported by retrieved listing evidence."
    }
  };
}

export async function analyzeAppraisal(body: any) {
  const { base64Data, mimeType } = parseImageInput(body);
  const apiKey = process.env.GOOGLE_AI_STUDIO_API_KEY || process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw new AppraisalError("Gemini API key is not configured.", "AI_NOT_CONFIGURED", 503);
  }

  const ai = new GoogleGenAI({ apiKey });
  let response: any;
  try {
    response = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: [{
        role: "user",
        parts: [
          { inlineData: { data: base64Data, mimeType } },
          { text: PRICESNAP_PROMPT }
        ]
      }]
    });
  } catch (error: any) {
    throw new AppraisalError(error?.message || "Appraisal model request failed.", "AI_STUDIO_UNREACHABLE", 502);
  }

  const parsed = sanitizeAndParseJson(response.text || response?.response?.text?.() || "");
  const appraisal = normalizeAppraisal(parsed);
  const analysisId = crypto.randomUUID();
  const timestamp = new Date().toISOString();

  return {
    ok: true,
    id: analysisId,
    date: timestamp,
    ...appraisal,
    appraisal,
    meta: {
      timestamp,
      analysis_id: analysisId,
      model: GEMINI_MODEL
    }
  };
}

export function appraisalErrorResponse(error: unknown) {
  const err = error instanceof AppraisalError
    ? error
    : new AppraisalError("An unexpected appraisal error occurred.", "INTERNAL_SERVER_ERROR", 500);

  return {
    status: err.statusCode,
    body: {
      ok: false,
      error: err.code,
      message: err.message,
      details: err.details
    }
  };
}
