# PriceSnap API — engine 1.1.0

Local base: `http://localhost:3000`. Hosted clients should use their configured backend origin. Browser calls are same-origin. No cross-origin CORS policy or user authentication is supplied by this repository.

## Analyze

`POST /api/analyze` (alias `POST /api/pricesnap`). Header: `Content-Type: application/json`.

```json
{ "image": "data:image/jpeg;base64,..." }
```

Supply a real image, not the abbreviated example. Legacy `imageBase64`, `imageUrl` and `data` keys are accepted, but only as image data, **not external URLs**. Send one field. Supported MIME types: JPEG, PNG and WebP. Maximum decoded image size: 3,000,000 bytes. Express JSON body limit: 4100 KiB; hosted gateway limits also apply.

## JSON response

Without a streaming Accept header, responses are JSON. The canonical result appears at the top level and is repeated under `appraisal` for older clients.

| Field | Meaning |
|---|---|
| `ok` | True if the pipeline completed, including insufficient evidence |
| `status` | `success` or `insufficient_evidence`; failures use `error` |
| `id`, `date` | UUID and ISO timestamp |
| `product` | Identification, visible condition, certainty and suggested queries |
| `valuation` | NZD estimate, range, recommended price and strategy prices |
| `confidence` | Score, percentage, level, reasons and factors |
| `evidence` | Extracted/usable counts and actual retained comparables |
| `grounding` | Provider citation sources and optional search-suggestion HTML |
| `market` | Observed platform summaries; trend is `unknown` |
| `meta` | Engine/model version, ID, timing and pricing basis |
| `warnings` | Evidence and assessment limitations |

`status: success` requires a positive `valuation.estimatedValue`. `status: insufficient_evidence` returns null canonical prices, empty usable sources and zero valuation confidence. It is an HTTP 200 outcome, not a price of zero. Check status before formatting prices. `confidence` is an object, not a number. Android consumers should use nullable numeric price fields.

Example of the **valuation section only** (illustrative, not live market data):

```json
{
  "estimatedValue": 260,
  "lowEstimate": 221,
  "highEstimate": 299,
  "currency": "NZD",
  "recommendedResalePrice": 260,
  "quickSalePrice": 221,
  "balancedPrice": 260,
  "maxProfitPrice": 299
}
```

## Streaming response

Send `Accept: application/x-ndjson` to receive newline-delimited JSON. Stage records report actual server stage starts, not percentage completion.

```jsonl
{"type":"progress","stage":"identifying"}
{"type":"progress","stage":"searching"}
{"type":"progress","stage":"calculating"}
```

A final `{"type":"result","data":{...}}` carries the normal JSON envelope. A final `{"type":"error","ok":false,"status":"error","error":"CODE","message":"..."}` reports failure. After streaming starts, HTTP status remains 200, so clients **must** handle error records. Missing final result/error means a truncated stream and must not become a success. Invalid payloads are rejected before streaming begins.

## Errors

| HTTP status (JSON mode) | Code | Action |
|---|---|---|
| 400 | `INVALID_IMAGE`, `INVALID_JSON` | Correct image/body format |
| 405 | `METHOD_NOT_ALLOWED` | Use POST |
| 413 | `IMAGE_TOO_LARGE` | Resize/recompress image |
| 422 | `IDENTIFICATION_UNCERTAIN` | Photograph a clear model label |
| 429 | `PROVIDER_RATE_LIMIT` | Wait; operator checks quota |
| 503 | `SERVICE_NOT_CONFIGURED` | Operator sets server Gemini key |
| 504 | `ANALYSIS_TIMEOUT` | Retry later |
| 502 | `INVALID_AI_RESPONSE`, `INVALID_SEARCH_RESPONSE`, `ANALYSIS_FAILED` | Retry; operator checks provider/model setup |

Provider raw errors, keys and photo data are not returned. HTTP 429 is not automatically retried because retrying paid/limited provider calls can duplicate work.

## Service endpoints

- `GET /api/ping`: HTTP 200, `status: ok`, `service: pricesnap-api`, `engineVersion`, numeric millisecond `timestamp`. This is liveness, not a provider test.
- `GET /api/health`: HTTP 200 `ready` when a key is present; HTTP 503 `not_configured` otherwise. Includes only `hasApiKey`, never its value. Presence does not prove key validity, quota or model access.
- `GET /api/version`: `service` and `engineVersion`.

All API responses disable caching. Only ping/version are suitable for simple liveness checks; use a real authorized photo to test end-to-end provider readiness.
