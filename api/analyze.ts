import { runValuationEngine } from "../src/lib/valuation-engine";

export const config = {
  runtime: "nodejs"
};

const JSON_HEADERS = { "Content-Type": "application/json" };

export default async function handler(req: Request) {
  if (req.method !== "POST") {
    return new Response(
      JSON.stringify({ ok: false, error: "METHOD_NOT_ALLOWED", message: "Use POST /api/analyze." }),
      { status: 405, headers: { ...JSON_HEADERS, Allow: "POST" } }
    );
  }

  try {
    const body = await req.json();
    const imageInput = body?.image || body?.imageBase64 || body?.imageUrl || body?.data;

    if (!imageInput || typeof imageInput !== "string" || imageInput.trim().length === 0) {
      return new Response(
        JSON.stringify({ ok: false, error: "NO_IMAGE", message: "A base64 image or data URL is required." }),
        { status: 400, headers: JSON_HEADERS }
      );
    }

    const base64Data = imageInput.replace(/^data:image\/[a-zA-Z0-9.+-]+;base64,/, "");
    if (base64Data.length > 20_000_000) {
      return new Response(
        JSON.stringify({ ok: false, error: "IMAGE_TOO_LARGE", message: "Image exceeds the upload limit." }),
        { status: 413, headers: JSON_HEADERS }
      );
    }

    const result = await runValuationEngine(imageInput);
    return new Response(
      JSON.stringify({ ok: true, ...result, appraisal: result }),
      { status: 200, headers: JSON_HEADERS }
    );
  } catch (error: any) {
    console.error("[PriceSnap API Error]", error);
    return new Response(
      JSON.stringify({
        ok: false,
        status: "error",
        error: "ANALYSIS_FAILED",
        message: error?.message || "Unable to analyze this item."
      }),
      { status: 500, headers: JSON_HEADERS }
    );
  }
}
