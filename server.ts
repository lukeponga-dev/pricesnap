import "dotenv/config";
import express, { Request, Response } from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { runValuationEngine, ENGINE_VERSION } from "./src/lib/valuation-engine";

async function startServer() {
  const app = express();
  const PORT = 3000;

  // JSON Body Parser with 50MB limit for high-res camera uploads
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ extended: true, limit: "50mb" }));

  // =========================================================
  // API Routes
  // =========================================================

  /**
   * POST /api/analyze & POST /api/pricesnap
   * Canonical single entry point for all valuation requests (Web & Mobile).
   * Validates request and delegates completely to the Valuation Engine.
   */
  const handleAnalyze = async (req: Request, res: Response) => {
    try {
      const rawImage =
        req.body?.image ||
        req.body?.imageBase64 ||
        req.body?.imageUrl ||
        req.body?.data ||
        "";

      if (!rawImage || typeof rawImage !== "string" || rawImage.trim().length === 0) {
        return res.status(400).json({
          ok: false,
          status: "error",
          error: "INVALID_PAYLOAD",
          message: "A valid base64 image or data URL must be provided in the 'image' field."
        });
      }

      // Execute canonical server-side Valuation Engine
      const result = await runValuationEngine(rawImage);

      // Return canonical result
      return res.status(200).json({
        ok: true,
        ...result,
        appraisal: result
      });
    } catch (err: any) {
      console.error("[PriceSnap API Error]:", err);
      return res.status(500).json({
        ok: false,
        status: "error",
        error: "ANALYSIS_FAILED",
        message: err?.message || "An unexpected error occurred while appraising item."
      });
    }
  };

  app.post("/api/analyze", handleAnalyze);
  app.post("/api/pricesnap", handleAnalyze);

  /**
   * GET /api/ping
   */
  app.get("/api/ping", (_req: Request, res: Response) => {
    res.status(200).json({
      status: "ok",
      service: "pricesnap-api",
      engineVersion: ENGINE_VERSION,
      timestamp: Date.now()
    });
  });

  /**
   * GET /api/health
   */
  app.get("/api/health", (_req: Request, res: Response) => {
    res.status(200).json({
      status: "healthy",
      service: "pricesnap-api",
      engineVersion: ENGINE_VERSION,
      hasApiKey: !!(process.env.GOOGLE_AI_STUDIO_API_KEY || process.env.GEMINI_API_KEY),
      timestamp: Date.now()
    });
  });

  /**
   * GET /api/version
   */
  app.get("/api/version", (_req: Request, res: Response) => {
    res.status(200).json({
      service: "pricesnap-api",
      engineVersion: ENGINE_VERSION,
      runtime: "node/express",
      timestamp: new Date().toISOString()
    });
  });

  // =========================================================
  // Vite Dev Server / Static SPA Fallback
  // =========================================================
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req: Request, res: Response) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`PriceSnap API & Valuation Engine running on http://localhost:${PORT}`);
  });
}

startServer();
