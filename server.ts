import 'dotenv/config';
import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { AppraisalError, appraisalErrorResponse } from "./src/server/appraisal";
import { handleAnalysisRequest } from "./src/server/http";

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT || 3000);

  app.use(express.json({ limit: "20mb" }));

  const handlePriceSnap = async (req: express.Request, res: express.Response) => {
    const response = await handleAnalysisRequest(new Request('http://localhost/api/analyze', {
      method: 'POST', headers: { 'Content-Type': 'application/json', Accept: req.get('Accept') || 'application/json' },
      body: JSON.stringify(req.body),
    }));
    res.status(response.status);
    response.headers.forEach((value, key) => res.setHeader(key, value));
    if (response.body) {
      const reader = response.body.getReader();
      const onClose = () => { void reader.cancel().catch(() => {}); };
      res.on('close', onClose);
      try {
        while (!res.destroyed) {
          const { done, value } = await reader.read();
          if (done) break;
          res.write(value);
        }
      } finally { res.off('close', onClose); reader.releaseLock(); }
    }
    res.end();
  };

  app.post("/api/analyze", handlePriceSnap);
  app.post("/api/pricesnap", handlePriceSnap);
  app.use((error: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    const failure = appraisalErrorResponse(new AppraisalError(
      error.type === 'entity.too.large' ? 'Image request is too large.' : 'Request body must contain valid JSON.',
      error.type === 'entity.too.large' ? 'IMAGE_TOO_LARGE' : 'INVALID_JSON',
      error.type === 'entity.too.large' ? 413 : 400,
    ));
    res.status(failure.status).json(failure.body);
  });

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
