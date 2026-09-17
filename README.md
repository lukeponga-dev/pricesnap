# PriceSnap

Photo identification and evidence-backed New Zealand secondhand asking-price estimates.

## Run locally

Use Node.js 22+ and the repository's Bun lockfile:

```sh
bun install --frozen-lockfile
cp .env.example .env
# Set GEMINI_API_KEY in .env to your Google AI Studio key.
bun run dev
```

If the tsx launcher cannot create its local IPC socket, use `node --import tsx server.ts`.
The local server loads `.env` automatically. On Vercel set the key in the project's environment settings for every environment you use, including previews. Never expose the key through a VITE_ variable. A placeholder is not a usable key.

`GEMINI_MODEL` configures vision; `GEMINI_GROUNDING_MODEL` configures search (otherwise it uses the vision model). Both default to `gemini-3.5-flash`. Use a model your Google project can access with image input and Google Search support. No eBay/Facebook/Trade Me API credentials or guessed exchange rates are used. Google API usage and search remain subject to your project's quota and pricing.

## Analysis flow

1. The browser prepares a JPEG up to 1600 pixels on its longest side and uploads it to `/api/analyze`.
2. Gemini returns schema-constrained item identification, visible condition and identification confidence. A photo cannot establish working order or hidden specifications.
3. The server checks public Trade Me and eBay pages alongside Google Search for Trade Me, publicly indexed Facebook Marketplace, used/refurbished Google Shopping offers, Cash Converters and other NZ secondhand retailers. Login-only or blocked pages are not bypassed.
4. Only comparable NZD prices are accepted. Direct HTML prices must be attached to their own product/offer. Generated search prices need grounding support covering the price and a citation from Google's metadata. Currency conversion, unsupported prices, wrong variants and accessories are excluded.
5. The displayed estimate is the median of deduplicated, outlier-filtered asking prices; the range is the interquartile range. Thin evidence receives low confidence. This is an evidence heuristic, not a calibrated probability of sale. Condition observations are shown separately without an arbitrary numerical discount.
6. If pricing evidence is unavailable, identification and warnings are still returned, with null price fields. There is no mock appraisal or fabricated fallback price.

The vision phase has a 30-second budget and search a 45-second budget. Only transient provider 5xx errors are retried once within the same phase budget. Quota, key and model configuration errors are surfaced explicitly.

## API compatibility and deployment

`POST /api/analyze` and `POST /api/pricesnap` both accept JSON with `imageBase64` (or the legacy `image`) containing a JPEG/PNG/WebP data URL. Default responses are JSON, including the existing root, `product`, and nested `appraisal` fields. The web client requests `Accept: application/x-ndjson` to receive actual `identifying` and `grounding` events followed by a result or error event. Streaming clients must inspect the terminal event, since HTTP headers have already been sent.

Vercel routes use the default Node.js runtime with a 120-second maximum duration. Error responses carry request IDs. Analysis responses are marked `no-store`. The server validates decoded images up to 15 MB; hosting request limits also apply, so external clients should resize photos before sending them.

Google Search citation links are displayed alongside asking prices. Search suggestions returned by Google are shown in a sandboxed frame. Sources can be stale or unavailable; open a listing before relying on its current availability or condition. No live price is guaranteed for every image.

## Verification

```sh
bun run lint
bun run test
bun run build
```

Tests exercise the HTTP handler, JSON and streaming clients, provider errors, incomplete responses, evidence/citation matching, NZD filtering, model variants, deduplication, and outlier statistics. Provider responses in tests are deterministic fixtures, never production fallback data.

For a live smoke test after configuring a deployment: upload a clear photo of a known secondhand product and its model label; check the identity, NZD price, source links, and price confidence. Also test an unidentified photo and a product with no available comparables. A successful local build or fixture test does not establish live Google account access or marketplace coverage.

References: [Google Search grounding](https://ai.google.dev/gemini-api/docs/google-search), [grounding metadata](https://ai.google.dev/api/generate-content#GroundingMetadata), [Vercel Node.js functions](https://vercel.com/docs/functions/runtimes/node-js).
