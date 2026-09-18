# 📸 PriceSnap

PriceSnap is a high-fidelity, full-stack, AI-powered secondhand item scanner and market price intelligence tool specifically tailored for the New Zealand (NZ) market. By utilizing computer vision and live-search grounding, it allows users to take a photo of any secondhand item, instantly identify it, and receive an evidence-backed NZD resale price estimate grounded in real-time listings from platforms like Trade Me, Facebook Marketplace, and eBay.

---

## ✨ Key Features

- **🤖 AI-Powered Item Scanning**: Powered by the advanced Google Gemini API (`gemini-3.8-flash`) to instantly identify items from any live photo or uploaded image, assess visible conditions, detect potential defects, and establish a confidence rating.
- **📈 Market Price Intelligence**: Automatically analyzes real-time marketplace prices, calculates median asking values, identifies outlier prices using interquartile range (IQR) analysis, and displays the market dispersion to provide clear valuation context.
- **📱 Progressive Web App (PWA)**: Completely offline-capable shell with asset caching, Service Worker support, and a local history database to retrieve past appraisals anytime.
- **🎨 Elite UI/UX Design**: Built with a sleek, responsive dark/light balanced theme using negative space, custom vector iconography, and smooth transitions powered by Framer Motion.
- **📊 Embedded Interactive Pitch Deck**: A beautifully crafted, slide-by-slide business pitch deck integrated directly within the application to present market sizes, user segments, and SaaS monetization plans.

---

## 🛠️ Key Technologies Used

- **Frontend**: [React 18+](https://react.dev/), [Vite](https://vitejs.dev/) (Build tool), [Tailwind CSS](https://tailwindcss.com/) (Styling framework), [Framer Motion](https://www.framer.com/motion/) (Micro-interactions & animations), [Lucide React](https://lucide.dev/) (Iconography)
- **Backend**: [Express](https://expressjs.com/) (Node.js web framework), [TypeScript](https://www.typescriptlang.org/)
- **AI Core**: [@google/genai SDK](https://github.com/google/generative-ai-js) (Official Gemini API client)
- **Grounding**: [Google Search Grounding Service](https://ai.google.dev/)
- **Testing & Tooling**: [Bun](https://bun.sh/) (Runtime & package manager), [Vitest](https://vitest.dev/) (Unit and integration test suite)

---

## 🚀 Installation & Setup Instructions

### Prerequisites
- **Node.js**: Version 22.0.0 or higher
- **Bun**: Fast JavaScript package manager & runner (recommended)

### Local Environment Setup

1. **Clone the repository and navigate to the project root:**
   ```bash
   cd pricesnap
   ```

2. **Install project dependencies:**
   Using Bun:
   ```bash
   bun install --frozen-lockfile
   ```
   Or using npm:
   ```bash
   npm install
   ```

3. **Configure Environment Variables:**
   Duplicate the provided example environment template to create your active `.env` file:
   ```bash
   cp .env.example .env
   ```
   Open the `.env` file and input your Google AI Studio API key:
   ```env
   GEMINI_API_KEY="your-google-ai-studio-api-key"
   ```

4. **Start the Development Server:**
   ```bash
   bun run dev
   ```
   Or using npm:
   ```bash
   npm run dev
   ```
   The local Express + Vite dev server will spin up and bind to **`http://localhost:3000`**.

---

## ⚠️ Google Search Grounding Disclaimer

Please review the following operational parameters regarding PriceSnap's live valuation engine:

- **Public Marketplace Data Only**: The market price intelligence calculations are grounded dynamically in search results returned by the Google Search Grounding Service. These results are limited to publicly indexed web content and listings from platforms like Trade Me, eBay, and open-access Facebook Marketplace postings. It cannot access listings behind private member portals, paywalls, or closed social networking groups.
- **Information Recency & Volatility**: Resale values are subject to rapid marketplace fluctuations, geographical variations, and listing activity. The estimates presented should be treated as starting valuation benchmarks and not as certified legal appraisals, financial valuations, or guaranteed sale quotes.
- **Algorithmic Evaluation**: Identified item details, defects, condition scores, and market comparisons are generated algorithmically using generative AI models. Users should independently inspect and verify item authenticity and local market listing history before engaging in transaction actions.

---

## 🧪 Testing, Linting & Production

PriceSnap includes a comprehensive test suite for validating standard request pipelines, currency handlers, and mathematical filters.

```bash
# Run the unit and integration tests (Vitest)
bun run test

# Run code style & TypeScript linter checks
bun run lint

# Compile and package the application for production deployment
bun run build
```
