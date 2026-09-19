# PriceSnap Production Deployment Guide

PriceSnap is a full-stack Node.js + React application. The Express server serves both the REST API endpoints (`/api/*`) and the compiled Vite single-page frontend.

---

## 1. Quick Deploy with Docker

### Build Image
```bash
docker build -t pricesnap:latest .
```

### Run Container
```bash
docker run -d \
  --name pricesnap-app \
  -p 3000:3000 \
  -e GEMINI_API_KEY="your-gemini-api-key-here" \
  pricesnap:latest
```

Open `http://localhost:3000` to verify.

---

## 2. Deploying to Google Cloud Run

### Option A: Via gcloud CLI
```bash
# Build and submit container image
gcloud builds submit --tag gcr.io/YOUR_PROJECT_ID/pricesnap

# Deploy to Cloud Run
gcloud run deploy pricesnap \
  --image gcr.io/YOUR_PROJECT_ID/pricesnap \
  --platform managed \
  --region asia-east1 \
  --allow-unauthenticated \
  --port 3000 \
  --set-env-vars GEMINI_API_KEY="your-gemini-api-key-here"
```

### Option B: Via GitHub Actions
Configure the secrets in your repository settings as detailed in [`docs/PIPELINE.md`](./PIPELINE.md), and push to `main` to trigger automated deployment.

---

## 3. Production Environment Variables

| Variable | Description | Required |
|---|---|---|
| `GEMINI_API_KEY` | Gemini API key for visual identification & appraisals | Yes (Fallback catalog used if absent) |
| `GOOGLE_AI_STUDIO_API_KEY` | Secondary alias for `GEMINI_API_KEY` | Optional |
| `PORT` | HTTP listener port (defaults to 3000) | Optional |
| `NODE_ENV` | Environment state (`production` or `development`) | Recommended |

---

## 4. Health Checks and Monitoring

- **Liveness Probe**: `GET /api/ping` returns `{"status": "ok"}`
- **Readiness Probe**: `GET /api/health` returns `{"status": "healthy", "hasApiKey": true}`
- **Version Endpoint**: `GET /api/version` returns runtime and release info
