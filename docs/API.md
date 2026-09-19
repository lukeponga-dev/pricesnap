# PriceSnap REST API Reference

The PriceSnap backend provides high-performance endpoints for visual item appraisal, health monitoring, and system diagnostics.

## Base URL
```
http://localhost:3000
```

---

## 1. Item Appraisal Endpoint

### `POST /api/analyze` (Alias: `POST /api/pricesnap`)
Analyzes an item photo and produces an instant valuation, condition rating, defects breakdown, and multi-marketplace price benchmarks.

#### Request Headers
| Header | Value | Description |
|---|---|---|
| `Content-Type` | `application/json` | Required |

#### Request Body
```json
{
  "image": "data:image/jpeg;base64,/9j/4AAQSkZJRg..."
}
```
*Note: Accepts `image`, `imageUrl`, or `imageBase64` keys.*

#### Successful Response (`200 OK`)
```json
{
  "ok": true,
  "id": "x8q2y7z",
  "date": "2026-09-19T05:50:00.000Z",
  "item_category": "Smartphone",
  "item_name": "Apple iPhone 13 128GB",
  "brand": "Apple",
  "condition_score": 8,
  "defects": ["Minor hairline scratches on lower bezel"],
  "resale_price_nz": 680,
  "confidence": 0.94,
  "market": {
    "trademe": {
      "low": 580,
      "median": 680,
      "high": 780,
      "sample_listings": []
    },
    "facebook": {
      "low": 540,
      "median": 640,
      "high": 710,
      "sample_listings": []
    },
    "ebay": {
      "low": 610,
      "median": 730,
      "high": 850,
      "sample_listings": []
    },
    "trend": "stable",
    "recommended_price": 680,
    "best_platform": "Trade Me"
  },
  "product": {
    "name": "Apple iPhone 13 128GB",
    "brand": "Apple",
    "category": "Smartphone",
    "condition_score": 8,
    "condition_grade": "B",
    "defects": ["Minor hairline scratches on lower bezel"],
    "resale_price_nz": 680,
    "confidence": 0.94,
    "confidence_color": "green",
    "summary": "Very good condition (8/10). Issues detected: Minor hairline scratches on lower bezel."
  }
}
```

#### Error Responses
| Status Code | Error Code | Cause |
|---|---|---|
| `400 Bad Request` | `NO_IMAGE` | Request body missing `image` data. |
| `413 Payload Too Large` | `IMAGE_TOO_LARGE` | Base64 image payload exceeds 20MB. |
| `415 Unsupported Media Type` | `UNSUPPORTED_MIME` | Image string is not base64 data URL or HTTP URL. |
| `502 Bad Gateway` | `MODEL_OUTPUT_ERROR` | AI inference failure or unparseable JSON output. |
| `500 Internal Server Error` | `INTERNAL_SERVER_ERROR` | Uncaught server exception. |

---

## 2. Health & Status Endpoints

### `GET /api/health`
Returns service health and Gemini API key status.

#### Response (`200 OK`)
```json
{
  "status": "healthy",
  "service": "pricesnap-backend",
  "hasApiKey": true,
  "timestamp": 1789800000000
}
```

### `GET /api/ping`
Fast heartbeat check for load balancers and orchestrators.

#### Response (`200 OK`)
```json
{
  "status": "ok",
  "service": "pricesnap-backend",
  "timestamp": 1789800000000
}
```

### `GET /api/version`
Returns software release metadata.

#### Response (`200 OK`)
```json
{
  "version": "1.0.0",
  "service": "pricesnap-backend",
  "runtime": "node/edge"
}
```

---

## Example cURL Command

```bash
curl -X POST http://localhost:3000/api/analyze \
  -H "Content-Type: application/json" \
  -d '{"image": "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEASABIAAD..."}'
```
