# PriceSnap 📸 🇳🇿

> **AI item scanner with live market search and appraisal for Trade Me, Facebook Marketplace, and eBay.**

PriceSnap empowers sellers, thrifters, and resellers across New Zealand to snap a photo of any item and instantly receive AI-backed appraisals, condition grading, defect identification, and platform-specific resale estimates in NZD.

---

## 🚀 Key Features

- 📷 **Instant Visual Scanner**: Live camera capture or drag-and-drop file upload with real-time viewfinder framing.
- 🧠 **Multimodal AI Vision**: Powered by Google Gemini 3.6 Flash (`@google/genai`) to identify brand, model, material, vintage era, and condition.
- 💰 **Tri-Market NZD Valuations**: Real-time estimates benchmarked for:
  - **Trade Me** (NZ domestic primary marketplace)
  - **Facebook Marketplace** (Local pickup and fast-sale median)
  - **eBay** (Global collector benchmarks)
- 🔍 **Condition & Defect Detection**: 1–10 condition score, letter grade (A–D), and enumerated defect summaries.
- 🛡️ **Defensive Offline Fallback**: Deterministic New Zealand catalog fallback ensures app resilience even during network timeouts or offline mode.
- 📱 **Progressive Web App (PWA)**: Installable on iOS and Android devices with offline caching and responsive mobile layout.
- 📜 **Scan History & Bookmarking**: Persisted local history of previous appraisals with search and filter capabilities.

---

## 🛠️ Architecture & Tech Stack

| Layer | Technology |
|---|---|
| **Frontend UI** | React 19, TypeScript, Vite, Tailwind CSS v4, `motion` (animations), `lucide-react` |
| **Backend Server** | Node.js, Express, `esbuild` CommonJS bundling |
| **AI Vision Engine** | Google Gemini 3.6 Flash via `@google/genai` |
| **Pipeline & CI/CD** | GitHub Actions (`.github/workflows/ci.yml`, `deploy.yml`), Multi-stage Docker |
| **PWA & Storage** | Service Worker (`vite-plugin-pwa`), LocalStorage state hydration |

---

## 📂 Project Structure

```
├── .github/
│   └── workflows/
│       ├── ci.yml              # CI: Matrix lint, typecheck, build & artifact verification
│       └── deploy.yml          # CD: Docker build & automated Cloud Run deployment
├── docs/
│   ├── ARCHITECTURE.md         # System design, JSON sanitizer, and fallback logic
│   ├── API.md                  # REST API schemas, endpoints, error contracts
│   ├── PIPELINE.md             # CI/CD pipeline reference and local simulation
│   └── DEPLOYMENT.md           # Production deployment guide (Docker, Cloud Run)
├── api/                        # Edge serverless endpoints (analyze.ts, ping.ts)
├── public/                     # Static assets, PWA icons, manifest
├── src/
│   ├── components/             # Reusable UI components (Layout, BottomNav, PriceCard, etc.)
│   ├── screens/                # App screens (HomeScreen, ScannerScreen, ResultScreen, etc.)
│   ├── store.tsx               # Reactive application state store
│   ├── types.ts                # Domain TypeScript contracts
│   └── utils.ts                # Currency formatting and helpers
├── server.ts                   # Express server entry point with Gemini integration & fallback catalog
├── Dockerfile                  # Multi-stage container definition
├── package.json                # Project dependencies and npm scripts
└── README.md                   # Project overview and quickstart
```

---

## ⚡ Getting Started

### Prerequisites

- **Node.js**: Version 20.x or 22.x+
- **npm**: Version 10.x+
- **Google Gemini API Key**: [Get an API key here](https://aistudio.google.com/app/apikey) *(Optional: PriceSnap features a built-in benchmark catalog fallback)*

### 1. Clone & Install Dependencies

```bash
git clone https://github.com/your-username/pricesnap.git
cd pricesnap
npm install
```

### 2. Configure Environment Variables

Copy the example environment file:

```bash
cp .env.example .env
```

Edit `.env` and add your Gemini API key:

```env
GEMINI_API_KEY="your-gemini-api-key-here"
```

### 3. Run in Development Mode

```bash
npm run dev
```

The application dev server starts at **`http://localhost:3000`** with Vite live-reloading.

---

## 🧪 Scripts & Validation

| Command | Action |
|---|---|
| `npm run dev` | Starts Express backend and Vite client in dev mode on port 3000 |
| `npm run lint` | Runs TypeScript compiler verification (`tsc --noEmit`) |
| `npm test` | Runs pipeline lint and typecheck tests |
| `npm run build` | Builds production client (`dist/`) and bundles `dist/server.cjs` |
| `npm start` | Runs production server (`node dist/server.cjs`) |
| `npm run clean` | Cleans previous build outputs |

---

## 📡 API Overview

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/analyze` | Appraises image and returns pricing, condition, and market benchmarks |
| `POST` | `/api/pricesnap` | Alias for `/api/analyze` |
| `GET` | `/api/health` | Service health status and API key check |
| `GET` | `/api/ping` | Fast liveness probe check |
| `GET` | `/api/version` | Backend version and runtime info |

*Detailed request and response schemas are documented in [`docs/API.md`](./docs/API.md).*

---

## 🔄 CI/CD Pipeline

PriceSnap includes production-grade GitHub Actions workflows:

1. **Continuous Integration (`.github/workflows/ci.yml`)**:
   - Runs on all pushes and PRs to `main` and `master`.
   - Matrix testing across Node.js 20.x and 22.x.
   - Enforces `tsc --noEmit` and full production bundling (`npm run build`).
   - Verifies `dist/index.html` and `dist/server.cjs` build integrity.

2. **Continuous Deployment (`.github/workflows/deploy.yml`)**:
   - Automated Docker containerization and deployment to Google Cloud Run.
   - Zero-downtime deployment targeting container port 3000.

*Refer to [`docs/PIPELINE.md`](./docs/PIPELINE.md) for full pipeline configuration details.*

---

## 🐳 Docker Deployment

To build and run PriceSnap inside a self-contained container:

```bash
# Build Docker image
docker build -t pricesnap:latest .

# Run container on port 3000
docker run -p 3000:3000 -e GEMINI_API_KEY="your-gemini-api-key" pricesnap:latest
```

---

## 📚 Detailed Documentation

- 📐 [**System Architecture**](./docs/ARCHITECTURE.md)
- 🔌 [**REST API Reference**](./docs/API.md)
- 🔁 [**CI/CD Pipeline Guide**](./docs/PIPELINE.md)
- 🚀 [**Production Deployment Guide**](./docs/DEPLOYMENT.md)

---

## 📄 License

This project is open-source software licensed under the MIT License.
