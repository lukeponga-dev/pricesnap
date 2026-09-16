import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { analyzeAppraisal, appraisalErrorResponse } from "./src/server/appraisal";

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT || 3000);

  app.use(express.json({ limit: "20mb" }));

  const handlePriceSnap = async (req: express.Request, res: express.Response) => {
    try {
      const result = await analyzeAppraisal(req.body);
      return res.status(200).json(result);
    } catch (error) {
      console.error("PriceSnap Pipeline Error:", error);
      const failure = appraisalErrorResponse(error);
      return res.status(failure.status).json(failure.body);
    }
  };

  app.post("/api/analyze", handlePriceSnap);
  app.post("/api/pricesnap", handlePriceSnap);

  app.get("/api/ping", (_req, res) => {
    res.status(200).json({
      status: "ok",
      service: "pricesnap-backend",
      timestamp: Date.now()
    });
  });

  app.get("/api/health", (_req, res) => {
    res.status(200).json({
      status: "healthy",
      service: "pricesnap-backend",
      hasApiKey: !!(process.env.GOOGLE_AI_STUDIO_API_KEY || process.env.GEMINI_API_KEY),
      timestamp: Date.now()
    });
  });

  app.get("/api/version", (_req, res) => {
    res.status(200).json({
      version: "1.1.0",
      service: "pricesnap-backend",
      runtime: "node"
    });
  });

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`PriceSnap server running on http://localhost:${PORT}`);
  });
}

startServer();
