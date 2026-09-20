# Review and verification — 20 September 2026

Reviewed repository: `lukeponga-dev/pricesnap`, base commit `5895ec11e46c780c77d60a186fcfddaedeffa67b` (main). Work branch: `codex/valuation-mvp`.

## Diagnosed issues and fixes

| Finding | User-visible consequence | Change |
|---|---|---|
| Identification failure hashed image bytes into a benchmark catalogue | Unrelated item appeared with 94% identity certainty | Removed catalogue fallback; explicit configuration/provider/uncertainty errors |
| Browser fetch errors generated a random local mock appraisal | Broken backend appeared to work | Removed mock module and fallback; retry/cancel/error UI |
| Grounding metadata was collected but not used to validate prices | Plausible generated URLs/prices could enter valuation | Require price-level provider citation support |
| Relevance began at 0.5 with a 0.2 filter threshold | Unrelated products passed by default | Required brand/model checks, overlap threshold, accessory/variant rejection |
| Static exchange rates and implicit NZD defaults | Ambiguous/foreign prices could be misvalued | Explicit NZD-only MVP |
| Synthetic platform spreads and hard-coded rising trend | Unsearched marketplaces appeared supported | Observed summaries only; unknown trend |
| Generic condition discount applied to already-used comparables | Systematic underpricing risk | Use condition-matched used evidence directly; disclose limits |
| Browser sent every image three times | Bloated uploads and gateway-limit failures | One resized image field and aligned validation limits |
| Fake progress reached 100% in 2.8 seconds | UI appeared finished while backend was still working | Actual server stage stream with request cancellation |
| Vercel and Express used different handler contracts | Deployment-specific failures and inconsistent errors | Shared Node handler, alias and health endpoints |
| Saved history existed only in memory and could not reopen results | Save did not survive reload | Versioned browser-local history, reopen and delete |
| Docs described obsolete fallbacks/API shapes | Integrators could implement the wrong contract | Replaced API, architecture, deployment and pipeline docs |
| npm-based deployment expected an absent lockfile | Non-repeatable installs / npm ci failure | Added npm lockfile and test gates |
| Backend build sat in the public static output | Server source bundle could be served as an asset | Separate `build/` server output |

## Verification approach

The tested story is: select photo → prepare image → POST shared API → identify → grounded evidence → deterministic NZD price → result screen → save → reload → reopen → delete. Error and cancellation paths are part of the same story.

Unit/API/SDK tests use controlled provider responses. The SDK transport test exercises the real installed `@google/genai` request construction and response parsing, replacing only HTTP transport. Browser tests use the built production frontend and the real API handler/engine with test-only provider dependencies. There is no production switch to these fixtures.

## Final local results

| Check | Result | Evidence |
|---|---|---|
| TypeScript | Passed | `npm run lint` |
| Engine/API/SDK tests | 20 passed | `npm test` |
| Production build | Passed | Vite `dist/` and esbuild `build/server.cjs` |
| Mobile workflow | 4 passed | Upload/save/reopen/delete; empty evidence; error/retry; cancel |
| Desktop workflow | 4 passed | Same four workflows at 1440×1000 |
| Browser console | Passed in successful workflow | No uncaught page errors captured |
| Result layout | Passed | Cards fit viewport after transition; screenshots inspected |
| Unconfigured real engine | Passed | Health and analyze return 503, never catalogue data |
| Live Google/market data | Not executed | No live Gemini credential available |

Local runtime: Node 24.19.0, Chromium 153.0.8010.0. CI covers Node 20/22; local results do not claim that remote CI has completed. The normal Playwright browser download timed out, so local browser verification used a separately installed npm-packaged Chromium via `PLAYWRIGHT_CHROMIUM_EXECUTABLE`. That runtime is not included in the application dependencies.

Browser test prices are deliberate controlled fixtures, not current Sony headphone market estimates. Final complete browser run: 8 passed in 30.4 seconds. The earlier test-selector ambiguity and too-fast progress fixture were corrected before this run.

## Remaining external checks

No live Gemini key was present in this environment. Therefore this work does **not** claim verified live recognition accuracy, current marketplace coverage, source freshness, or successful hosted Vercel execution. `/api/health` key presence is configuration only, not a provider probe.

Use the [deployment guide](DEPLOYMENT.md) and `npm run smoke:live -- /path/to/item.jpg` with a configured backend. Inspect several known-item scans and compare the item/model, currency, condition, prices and citation links. Test an obscure item that should remain unpriced. Do not weaken citation requirements just to force a price.

The separate Android application was not modified. It must check status and use nullable canonical price fields. Public production release requires live-provider acceptance and appropriate hosting access/quota controls; this change is delivered for review, not merged or deployed automatically by this task.
