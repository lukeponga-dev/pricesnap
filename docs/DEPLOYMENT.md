# Deployment and configuration

## Required settings

| Variable | Purpose |
|---|---|
| `GEMINI_API_KEY` | Server Gemini credential; required for live analysis |
| `GOOGLE_AI_STUDIO_API_KEY` | Alternative credential name; used if GEMINI_API_KEY is empty |
| `GEMINI_MODEL` | Defaults to `gemini-3.8-flash`; must support image input and Google Search in your project |
| `PORT` | Express port; defaults to 3000 |
| `NODE_ENV` | `production` when serving the built app |

Never commit secrets or prefix them with `VITE_`. `.env` is loaded by the local Express entrypoint; hosted functions receive environment variables from the host. Changing hosting variables usually requires redeployment.

## Vercel

Use Node.js 22, `npm ci`, `npm run build`, output `dist`. `vercel.json` declares the output and requests 120 seconds for both analysis endpoints. The `api/` directory supplies Node handlers with shared engine code. If your plan cannot accommodate the requested duration, reduce the request deadline and user-facing timeout consistently or use the Express deployment.

Keep deployment protection enabled for a private MVP. No deployment or visibility change is performed by this code change. After deploying, check ping, health and a real photo scan in both JSON and streaming modes. Verify API routes are served as functions rather than SPA HTML. Verify progress is not buffered by an intermediate proxy.

## Express / Docker / Cloud Run

```bash
npm ci
npm run check
npm start
```

The browser build lives in `dist/`; the server bundle lives in `build/server.cjs`. Docker copies both and runs as the `node` user. `PORT` is respected. Do not serve `build/` as static content. The checked-in Cloud Run workflow deploys on main only and requires GCP configuration; it should not be run or merged as a substitute for reviewing the proposed changes.

## Before enabling live access

1. Set a valid Gemini key and confirm model/Google Search access and quota in that project.
2. Keep the MVP private until live-provider tests pass. API key presence alone is not readiness.
3. Test multiple known items and manually inspect linked prices/model matches. Confirm null-price and error states.
4. Set provider spending/quota controls and hosting access/rate controls. This repository does not include distributed rate limiting or user authentication; unrestricted public exposure is outside the validated MVP scope.
5. Check Google processing terms against the actual API/billing setup and hosting log retention. The web privacy screen describes application behaviour and links provider terms.

No marketplace credentials or paid marketplace data feeds are used. Gemini/Search can still incur charges or have limited free quota. Private Facebook listings are not accessible through this engine.

## Troubleshooting

| Symptom | Check |
|---|---|
| Health reports `not_configured` | Set one server API key and restart/redeploy |
| Generic provider failure | Validate key, configured model availability, provider network access |
| HTTP 429 | Google quota/billing limits; avoid repeated automatic retries |
| Identified but no price | Public NZD used comparables, exact model match, price-level citation coverage |
| Upload rejected | JPEG/PNG/WebP, valid encoding/signature, 3 MB decoded limit |
| Browser receives HTML for API | Hosting route/build configuration |
| Scan cancelled but UI changes | Run cancellation E2E regression test |

## Live smoke command

After starting the configured backend, use an authorized real product photo:

```bash
npm run smoke:live -- /path/to/item.jpg
# Or supply your private hosted API origin as the second argument.
```

The command prints item, valuation, confidence and source links without printing the image or key. Exit 0 means a priced result, 2 means provider processing completed but usable evidence was insufficient, and 1 means an error. A passing call demonstrates provider connectivity; inspect the sources and repeat with known items before making accuracy claims.
