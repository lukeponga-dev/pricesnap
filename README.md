# 📸 PriceSnap

PriceSnap is a high-fidelity, full-stack, AI-powered secondhand item scanner specifically tailored for the New Zealand (NZ) market. By utilizing computer vision and live-search grounding, it allows users to take a photo of any secondhand item, instantly identify it, and receive an evidence-backed NZD resale price estimate grounded in real-time listings from platforms like Trade Me, Facebook Marketplace, and eBay.

---

## ✨ Key Features

- **🤖 AI Vision Identification**: Powered by `gemini-3.8-flash` to instantly identify items, assess visible conditions, list potential defects, and establish a confidence rating from a simple photo.
- **🌐 Real-Time Google Search Grounding**: Dynamically queries live marketplace listings from Trade Me, eBay, Cash Converters, and publicly indexed Facebook Marketplace.
- **📊 Statistical Valuation Engine**: Calculates a robust resale estimate using the median of deduplicated, outlier-filtered used/refurbished asking prices, complete with an interquartile range (IQR) to show price dispersion.
- **📱 Progressive Web App (PWA)**: Built with offline support, local app caching, a customizable Service Worker, and a local history log for quick retrieval of past appraisals.
- **🎨 Elite UI/UX Design**: Clean, high-contrast, modern interface utilizing cohesive light modes, rich negative space, and smooth micro-animations powered by Framer Motion.
- **📈 Integrated Pitch Deck**: A fully interactive, beautifully designed slide-deck view built directly into the application, mapping out the product vision, market size (NZ secondhand), and SaaS monetisation strategy.

---

## 🏗️ Technical Architecture

### System Flow
```
[ User Photo / Upload ]
          │
          ▼
[ POST /api/analyze (NDJSON Stream) ]
          │
          ├───► 🔮 Stage 1: AI Vision (Gemini 3.8-Flash)
          │                 ├─ Image Analysis & Attribute Parsing
          │                 └─ Output Schema: Name, Brand, Category, Defects
          │
          ├───► 🔍 Stage 2: Evidence Grounding (Google Search Grounding)
          │                 ├─ Real-Time NZ Marketplace Query
          │                 └─ Citation Retrieval & Verified NZD Offers
          │
          └───► 📊 Stage 3: Statistical Filtering
                            ├─ Outlier Detection (Interquartile Range)
                            └─ Median Price Estimation & Dispersion Calculation
          │
          ▼
[ Clean, Streaming Micro-Updates to Frontend UI ]
```

---

## 🚀 Getting Started

### Prerequisites
- **Node.js**: Version 22.0.0 or higher
- **Bun**: Fast JavaScript package manager & runner

### Local Installation & Run

1. **Clone the repository and navigate to the project root:**
   ```bash
   cd pricesnap
   ```

2. **Install dependencies using the Bun lockfile:**
   ```bash
   bun install --frozen-lockfile
   ```

3. **Configure Environment Variables:**
   Create a `.env` file from the provided example:
   ```bash
   cp .env.example .env
   ```
   Open `.env` and set your Google AI Studio credentials:
   ```env
   GEMINI_API_KEY="your-google-ai-studio-api-key"
   ```

4. **Start the Development Server:**
   ```bash
   bun run dev
   ```
   The local Express + Vite dev server will boot and run on **`http://localhost:3000`**.

> **Note on launchers:** If the `tsx` launcher fails to bind to its local IPC socket in your environment, run the app using: `node --import tsx server.ts`.

---

## ⚙️ Configuration & Grounding Logic

### Environment Tuning
- `GEMINI_MODEL`: Defines the vision and appraisal model (defaults to `gemini-3.8-flash`).
- `GEMINI_GROUNDING_MODEL`: Configures the model used for search grounding (defaults to `gemini-3.8-flash`).
- Set your keys as server secrets. **Never** prefix your Gemini API keys with `VITE_` as that exposes them to client-side code.

### Grounding & Appraisal Constraints
1. **Source Filtering**: The appraisal server searches public listings from Trade Me, eBay, Facebook Marketplace (publicly indexed), Cash Converters, and other reputable New Zealand secondhand retailers. It strictly respects login-walls and paywalls.
2. **Currency Integrity**: Only verified NZD prices are considered. Any non-NZD values or failed conversions are excluded to prevent cross-border distortion.
3. **Outlier Filtering**: Estimates are calculated mathematically using the median of deduplicated listing prices. Low-confidence categories or highly dispersed ranges represent thin evidence, which is communicated explicitly rather than hiding behind a fabricated average.

---

## 🧪 Testing & Verification

The suite includes tests exercising the full request-response lifecycle, streaming NDJSON client pipelines, statistical math, NZD currency filters, and model override configs.

Run the test runner, linter, and compilation:
```bash
# Run unit and integration tests (Vitest)
bun run test

# Run code style & type checks
bun run lint

# Compile and build the production bundle
bun run build
```

---

## 🌐 API Reference

### `POST /api/analyze` / `POST /api/pricesnap`

Accepts a JSON payload containing base64-encoded image data, returning a streaming NDJSON (newline-delimited JSON) feed of progress and results.

#### Request Body
```json
{
  "image": "data:image/jpeg;base64,/9j/4AAQSk..."
}
```

#### NDJSON Response Stream Events
```json
{"event": "identifying"}
{"event": "identified", "data": { "name": "Sony WH-1000XM4", "brand": "Sony", "condition_score": 8 }}
{"event": "grounding"}
{"event": "result", "data": { "item": "Sony WH-1000XM4", "resale_price_nz": 250, "market": { "low": 180, "high": 290 } }}
```

---

## 🛠️ Built With

- **Frontend**: [React](https://react.dev/), [Vite](https://vitejs.dev/), [Tailwind CSS](https://tailwindcss.com/), [Framer Motion](https://www.framer.com/motion/)
- **Backend**: [Express](https://expressjs.com/), [TypeScript](https://www.typescriptlang.org/)
- **AI Platform**: [@google/genai SDK](https://github.com/google/generative-ai-js) (Gemini 3.8-Flash with Google Search Grounding)
- **Tooling**: [Bun](https://bun.sh/), [Vitest](https://vitest.dev/)
