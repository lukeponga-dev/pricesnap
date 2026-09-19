# PriceSnap CI/CD Pipeline Documentation

This project uses **GitHub Actions** for continuous integration (CI) and continuous delivery (CD) workflows. The pipelines guarantee code reliability, strict TypeScript type checking, deterministic production bundling, and containerized deployment.

---

## 1. Continuous Integration (`.github/workflows/ci.yml`)

The CI workflow triggers automatically on:
- Every push to `main` or `master`
- Every pull request targeting `main` or `master`

### Jobs & Steps

```
[ Checkout Code ] 
       │
[ Setup Node.js Matrix: 20.x, 22.x ]
       │
[ Install Dependencies: npm ci ]
       │
[ Lint & Typecheck: npm run lint (tsc --noEmit) ]
       │
[ Production Build: npm run build ]
       │  ├─► Vite Client Bundler (dist/index.html & assets)
       │  └─► esbuild Server Compiler (dist/server.cjs)
       ▼
[ Verify Build Artifacts ]
       (Ensures dist/index.html and dist/server.cjs exist)
```

### Local Simulation
Run the same checks locally before pushing:
```bash
# 1. Typecheck and linting
npm run lint

# 2. Build compilation
npm run build

# 3. Test runner
npm test
```

---

## 2. Continuous Delivery & Deployment (`.github/workflows/deploy.yml`)

The deployment workflow builds a production Docker image and deploys it to **Google Cloud Run**.

### Trigger Conditions
- Push to `main`
- Manual execution via GitHub `workflow_dispatch` button

### Required Repository Secrets

| Secret Name | Description |
|---|---|
| `GCP_PROJECT_ID` | Google Cloud project identifier |
| `GCP_SA_KEY` | Service Account JSON credentials with Cloud Run & Artifact Registry Admin roles |
| `GEMINI_API_KEY` | Google Gemini API key used for server-side item appraisal |

### Deployment Lifecycle
1. **Source Checkout & Dependencies**: Runs clean install and verified build.
2. **GCP Authentication**: Authenticates with Google Cloud via `google-github-actions/auth`.
3. **Container Build**: Builds the multi-stage `Dockerfile` with optimized Alpine base.
4. **Registry Push**: Pushes image to Google Container Registry / Artifact Registry (`gcr.io/$PROJECT_ID/pricesnap:$COMMIT_SHA`).
5. **Cloud Run Deployment**: Deploys container to Cloud Run on port 3000 with unauthenticated public access and secret injection.

---

## 3. Container Pipeline (`Dockerfile`)

The containerized pipeline utilizes a 2-stage Docker build:
- **Stage 1 (Builder)**: Installs devDependencies, compiles client via Vite, bundles `server.ts` into CommonJS (`dist/server.cjs`).
- **Stage 2 (Runner)**: Uses minimal `node:22-alpine`, installs only production dependencies (`npm ci --omit=dev`), runs as an unprivileged `node` user, and starts the server on port 3000.
