# PriceSnap System Architecture

## Overview

**PriceSnap** is an AI-powered visual appraisal and valuation engine tailored for the New Zealand secondhand and resale marketplace (Trade Me, Facebook Marketplace, and eBay). It couples multimodal vision analysis via Google Gemini (`models/gemini-3.6-flash`) with a deterministic benchmark fallback catalog, robust JSON sanitization, and defensive data normalization.

---

## High-Level Architecture Diagram

```
[ Client Browser / PWA ]
       │
       │ (Base64 JPEG/PNG, max 20MB)
       ▼
[ Express Server (server.ts / dist/server.cjs) ]
       │
       ├─► 1. Ingestion Validation (format, size, null checks)
       │
       ├─► 2. Gemini 3.6 Flash Engine (`@google/genai`)
       │      └─► Timeout Guard (9s) & Error Boundary
       │
       ├─► [Fallback Catalog] (deterministic NZ benchmark appraisal if offline)
       │
       ├─► 3. JSON Sanitizer (removes markdown fences, extracts outermost `{}`)
       │
       ├─► 4. Schema Validator & Normalizer (protects UI against undefined properties)
       │
       └─► 5. Response Pipeline (returns normalized PriceSnapResult)
```

---

## Core Components

### 1. Ingestion Validation
- Endpoint: `POST /api/analyze` and `POST /api/pricesnap`.
- Enforces an explicit 20MB body limit (`express.json({ limit: "20mb" })`).
- Validates data URI prefixes (`data:image/...`) or external HTTPS URLs.
- Throws typed `IngestionError` with HTTP status 400 or 413 on violations.

### 2. Multimodal AI Valuation Engine
- Uses `@google/genai` with model `models/gemini-3.6-flash`.
- Injects a strict JSON-only appraisal prompt configured for the New Zealand resale ecosystem.
- Wraps API calls in `Promise.race` with a 9-second timeout limit to prevent hanging client connections.

### 3. Resilient JSON Sanitization (`sanitizeAndParseJson`)
Large language models occasionally prefix outputs with markdown fences (e.g. ````json````) or `<think>` reasoning tags. The sanitizer:
1. Strips all `<think>` tags and reasoning blocks.
2. Removes markdown fences (` ```json ` and ` ``` `).
3. Locates outermost `{` and `}` delimiters and extracts the raw JSON substring.
4. Parses safely with `JSON.parse()`, throwing `ModelOutputError` on malformed payloads.

### 4. Deterministic Catalog Fallback
When running offline, without an API key, or during network interruptions, PriceSnap gracefully falls back to a curated benchmark catalog (`CATALOG` in `server.ts`).
- Derives a consistent pseudo-random hash from the image bytes (`simpleHash`).
- Maps the hash to benchmarked New Zealand items (e.g. Apple iPhone 13, Sony WH-1000XM5, Nintendo Switch OLED, RM Williams Comfort Craftsman Boots, etc.).
- Guarantees that the UI never displays broken states or unhandled exceptions.

### 5. Schema Normalization (`validateAndNormalizeAppraisal`)
Guarantees consistent object contracts for the frontend:
- Clamps condition scores within `[1, 10]`.
- Maps numerical scores to grades (`A`, `B`, `C`, `D`).
- Generates platform price breakdowns for Trade Me, Facebook Marketplace, and eBay.
- Computes trend indicators (`rising`, `stable`, `falling`) and optimal resale platform recommendations.

---

## Frontend Architecture

- **Framework**: React 19 + TypeScript + Vite.
- **Styling**: Tailwind CSS v4 with custom dark aesthetic (`navy-950`, high-contrast emerald & amber accents).
- **Navigation & State**: Centralized reactive state store (`src/store.tsx`) managing scan history, active scan, active screen (`home`, `scanner`, `analyzing`, `result`, `history`, `settings`), and camera stream state.
- **Animations**: Fluid layout and state transitions powered by `motion` (`motion/react`).
- **PWA & Offline Readiness**: Service worker configuration with manifest and install prompts (`PWAInstallButton.tsx`).
