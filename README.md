# PriceSnap valuation MVP

PriceSnap identifies a photographed second-hand item with Google Gemini, searches publicly indexed comparables using Google Search grounding, and calculates an NZD resale estimate on the server. The React web client and JSON API share one valuation engine.

A successful valuation includes an explicit price, range, heuristic evidence confidence, and source links. Missing credentials, provider failures and ambiguous identification are errors. A successful search without usable comparables returns `insufficient_evidence` with **null canonical price fields**, never a made-up item or price.

## Run locally

Requires Node.js 22 and npm. No marketplace API subscriptions are required. Gemini access and Google Search grounding remain subject to your Google project's availability, quota and pricing; this is not a promise of unlimited free requests.

```bash
npm ci
cp .env.example .env
# Set GEMINI_API_KEY in .env; never commit it.
npm run dev
```

Open http://localhost:3000. The server loads `.env` and reads `GEMINI_API_KEY` (or `GOOGLE_AI_STUDIO_API_KEY`). `GEMINI_MODEL` defaults to `gemini-3.8-flash`; choose a model with image input and Google Search support available in your project.

```bash
npm run check       # TypeScript, engine/API/SDK tests, production build
npx playwright install --with-deps chromium
npm run test:e2e    # Mobile and desktop UI tests against a test-only provider fixture server
npm start          # Production Express server after building
```

## MVP workflow

1. Capture one item or upload JPEG, PNG or WebP. The browser resizes uploads to at most 1600 pixels on the longest side.
2. Follow server-reported identification, search and calculation stages. Cancel, or retry an unsuccessful scan.
3. Review the NZD estimate and linked comparables, or a clear insufficient-evidence message.
4. Save a result locally, reopen it from History, or clear saved results. Original photos are not saved.

The MVP prices only explicit NZD used comparables. New retail prices, ambiguous currencies, accessories, obvious model variants, duplicate rows and statistical outliers are excluded. Public Facebook results can be sparse; there is no authenticated Facebook scraping. Google Shopping is a discovery query, not a separate pricing feed.

## Technical documentation

- [Architecture and data flow](docs/ARCHITECTURE.md)
- [Valuation engine and known limitations](docs/VALUATION_ENGINE.md)
- [API contract and errors](docs/API.md)
- [Deployment and configuration](docs/DEPLOYMENT.md)
- [CI and release pipeline](docs/PIPELINE.md)
- [Review findings and verification](docs/VERIFICATION.md)

## Scope and limitations

This is an estimate from search-supported listings, not an appraisal guarantee or a sold-price database. Asking prices can differ from actual sale prices. Source content may be stale or unavailable. Photo condition assessment does not establish functionality, authenticity or hidden specifications. Confidence is a bounded heuristic, not a calibrated probability.

No accounts, cloud history, payment flow or durable background jobs are implemented. The Android repository is separate; its UI must handle the canonical API status and nullable prices. Keep a hosted MVP access-restricted and configure provider quotas while validating real scans. This branch does not deploy or change production visibility.
