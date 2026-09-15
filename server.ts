import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";

async function callHfChatCompletion(
  models: string[],
  bodyPayload: any,
  hfToken: string
): Promise<{ content: string; modelUsed: string }> {
  let lastError: any = null;

  for (const model of models) {
    try {
      const res = await fetch("https://router.huggingface.co/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${hfToken}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          ...bodyPayload,
          model
        })
      });

      const data = await res.json();

      if (!res.ok) {
        console.warn(`HF model candidate [${model}] returned ${res.status}:`, data?.error || data);
        lastError = new Error(data?.error?.message || `HF Error (${model}) - Status ${res.status}`);
        continue;
      }

      const content = data?.choices?.[0]?.message?.content;
      if (content) {
        return { content, modelUsed: model };
      }
    } catch (err: any) {
      console.warn(`HF model candidate [${model}] exception:`, err.message);
      lastError = err;
    }
  }

  throw lastError || new Error("All HF model candidates failed.");
}

function parseJsonSafe(rawText: string): any {
  if (!rawText) return {};
  let text = rawText.replace(/<think>[\s\S]*?<\/think>/g, "").trim();
  text = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    text = jsonMatch[0];
  }
  try {
    return JSON.parse(text);
  } catch (e) {
    console.warn("Failed to parse JSON string:", text);
    return {};
  }
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Increase payload limit for images
  app.use(express.json({ limit: "15mb" }));

  const handlePriceSnap = async (req: express.Request, res: express.Response) => {
    try {
      const { imageUrl, imageBase64 } = req.body;
      const targetImage = imageUrl || imageBase64;

      if (!targetImage) {
        return res.status(400).json({ error: "Missing imageUrl" });
      }

      const HF_TOKEN = process.env.HF_TOKEN;
      if (!HF_TOKEN) {
        return res.status(500).json({ error: "HF_TOKEN environment variable is not configured." });
      }

      // ---------------------------------------------------------
      // 1. Vision: Qwen2.5-VL → product + condition
      // ---------------------------------------------------------
      const visionModels = [
        "Qwen/Qwen2.5-VL-7B-Instruct:preferred",
        "Qwen/Qwen2.5-VL-7B-Instruct:novita",
        "Qwen/Qwen2.5-VL-7B-Instruct:together",
        "Qwen/Qwen2.5-VL-7B-Instruct:cheapest",
        "Qwen/Qwen2.5-VL-7B-Instruct:fastest",
        "Qwen/Qwen2.5-VL-7B-Instruct",
        "Qwen/Qwen2.5-VL-72B-Instruct:novita",
        "meta-llama/Llama-3.2-11B-Vision-Instruct:novita",
        "deepseek-ai/DeepSeek-V4.1-Flash:novita"
      ];

      const visionPayload = {
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text:
                  "Analyze this product image and return JSON with fields: " +
                  "name, brand, category, condition_grade, issues, confidence."
              },
              {
                type: "image_url",
                image_url: { url: targetImage }
              }
            ]
          }
        ],
        stream: false
      };

      const { content: productAnalysis } = await callHfChatCompletion(
        visionModels,
        visionPayload,
        HF_TOKEN
      );

      // ---------------------------------------------------------
      // 2. Reasoning: DeepSeek R1-Distill → pricing + marketplace
      // ---------------------------------------------------------
      const reasoningModels = [
        "deepseek-ai/DeepSeek-R1-Distill-Qwen-32B:free",
        "deepseek-ai/DeepSeek-R1-Distill-Qwen-32B:cheapest",
        "deepseek-ai/DeepSeek-R1-Distill-Qwen-7B:free",
        "deepseek-ai/DeepSeek-R1-Distill-Qwen-7B:cheapest",
        "deepseek-ai/DeepSeek-R1-Distill-Qwen-7B:novita",
        "deepseek-ai/DeepSeek-R1-Distill-Qwen-7B:together",
        "deepseek-ai/DeepSeek-R1-Distill-Qwen-7B",
        "deepseek-ai/DeepSeek-R1:novita"
      ];

      const reasoningPayload = {
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text:
                  "Using the following product analysis, generate NZ marketplace pricing for " +
                  "Trade Me, Facebook Marketplace, and eBay. Return JSON with: " +
                  "trademe (with low, median, high, sample_listings), " +
                  "facebook (with low, median, high, sample_listings), " +
                  "ebay (with low, median, high, sample_listings), " +
                  "trend, recommended_price, best_platform."
              },
              {
                type: "text",
                text: productAnalysis
              }
            ]
          }
        ],
        stream: false
      };

      const { content: marketAnalysis } = await callHfChatCompletion(
        reasoningModels,
        reasoningPayload,
        HF_TOKEN
      );

      // ---------------------------------------------------------
      // 3. Merge → Final PriceSnap JSON
      // ---------------------------------------------------------
      const parsedProduct = parseJsonSafe(productAnalysis);
      const parsedMarket = parseJsonSafe(marketAnalysis);

      const confidenceVal = Number(parsedProduct.confidence ?? 0.95);
      const confidence = confidenceVal > 1 ? confidenceVal / 100 : confidenceVal;

      const finalResponse = {
        product: {
          name: parsedProduct.name || "Identified Item",
          brand: parsedProduct.brand || "Unknown Brand",
          category: parsedProduct.category || "General",
          condition_grade: parsedProduct.condition_grade || parsedProduct.grade || "A",
          issues: Array.isArray(parsedProduct.issues) ? parsedProduct.issues : [],
          confidence: confidence,
          confidence_color: confidence >= 0.85 ? "green" : confidence >= 0.6 ? "orange" : "red",
          ...parsedProduct
        },
        condition: {
          grade: parsedProduct.condition_grade || parsedProduct.grade || "A",
          issues: Array.isArray(parsedProduct.issues) ? parsedProduct.issues : [],
          summary: parsedProduct.summary || (parsedProduct.condition_grade ? `Assessed Condition Grade ${parsedProduct.condition_grade}` : "Good condition")
        },
        market: parsedMarket.market || parsedMarket || {
          trademe: { low: 0, median: 0, high: 0, sample_listings: [] },
          facebook: { low: 0, median: 0, high: 0, sample_listings: [] },
          ebay: { low: 0, median: 0, high: 0, sample_listings: [] },
          trend: "stable",
          recommended_price: 0,
          best_platform: "Trade Me"
        },
        id: Math.random().toString(36).substring(2, 9),
        date: new Date().toISOString(),
        meta: {
          timestamp: new Date().toISOString(),
          analysis_id: Math.random().toString(36).substring(2, 9)
        }
      };

      return res.status(200).json(finalResponse);
    } catch (err: any) {
      console.error("Analysis Server Error:", err);
      return res.status(500).json({ error: err.message || "Internal server error" });
    }
  };

  app.post("/api/analyze", handlePriceSnap);
  app.post("/api/pricesnap", handlePriceSnap);

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
