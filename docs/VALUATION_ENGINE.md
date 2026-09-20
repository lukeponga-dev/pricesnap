# Valuation engine — 1.1.0

Entrypoint: `runValuationEngine(image, options)` in `src/lib/valuation-engine/index.ts`.

## Evidence pipeline

1. Validate base64 JPEG/PNG/WebP data and magic bytes. Maximum decoded image size is 3,000,000 bytes; full image decoding remains with the image model.
2. Request schema-constrained identification using the configured Gemini model. Require a non-empty item name and numeric condition/certainty. Identification certainty below 0.6 returns `IDENTIFICATION_UNCERTAIN`; no catalogue is substituted.
3. Build queries for Trade Me, publicly indexed Facebook Marketplace, NZ product/Google Shopping discovery and eBay. Search is model-directed; suggested queries are not a guarantee that every platform is searched.
4. Request priced used comparables for the identified model and visible condition using `googleSearch`.
5. Parse the JSON listing array. Malformed output is an error, not an empty market. Require finite positive numeric price, explicit `NZD`, `asking` or `sold` price type and an explicit used/pre-owned/second-hand condition.
6. Require a provider grounding-support segment covering each listing's numeric price, linked to a provider grounding chunk. Retain the matching source URL or unique supporting provider redirect; ambiguous citations are excluded. A generated URL alone never establishes evidence.
7. Score title overlap with the identified item. Require brand and identified numeric model tokens, exclude mismatching accessory/variant terms, and require at least 50% title-token overlap. This remains a lexical heuristic; semantic mismatches can still occur.
8. Deduplicate URLs and same-platform/title-prefix/price signatures. Exclude non-NZD currencies; there is no static FX conversion or bare-dollar assumption.
9. For four or more observations, flag prices outside a robust median/MAD envelope. Outliers are removed from both the price calculation and returned usable sources.
10. Calculate the relevance/platform-weighted median. Existing platform weights: Trade Me 1.35, Facebook 1.15, eBay 0.75, other retailers 0.85. These are product heuristics, not fitted coefficients.

Comparable condition is requested in the search prompt. The price is **not discounted again** using the old generic condition multiplier. There is no calibrated per-condition resale adjustment in this MVP.

## Price output

The weighted median is the canonical `valuation.estimatedValue`. `recommendedResalePrice`, `balancedPrice`, `market.recommended_price`, `pricing_guide.balanced_price` and `resale_price_nz` agree when the status is `success`.

The range covers observed retained extremes and a ±15% strategy envelope around the median. Quick sale is 85% and higher ask is 115% of the estimate. These are suggested asking strategies, not statistical confidence intervals or promised sale outcomes. Platform summaries include only observed usable comparables. No trend is inferred from a single search; `market.trend` is `unknown`.

If there are no usable comparables, status is `insufficient_evidence`, all canonical valuation prices and pricing-guide values are null, confidence is zero, and `market.platforms` is empty. Legacy fixed platform fields may contain zero placeholders with empty source arrays; they are not estimates and must not be displayed. Always branch on status and read `valuation` in new clients.

## Confidence

Score combines identification (35%), sample size (30%), price spread (20%) and source reliability (15%). It is capped by identification confidence and:

| Evidence | Maximum score |
|---|---:|
| None | 0% |
| One usable comparable | 55% |
| Two or three | 75% |
| One marketplace, any count | 75% |
| Multiple marketplaces with at least four | 85% |

Thresholds: high ≥82%, moderate ≥60%, otherwise low. Reasons explain sparse evidence, asking-price use and heuristic status. The score is **not** a probability that a future sale will achieve this price.

## Limits to validate with live data

Grounding links model claims to search sources; it does not independently verify a completed sale, page freshness, authenticity or product functionality. Strict citation requirements may reject useful listings when the model omits price-level supports. Source title/platform and condition still depend partly on model extraction. Marketplace login walls and indexing gaps limit coverage. No login bypass or authenticated scraping is implemented.

Model and provider quotas are deployment settings. Google Search integration follows the [Gemini grounding documentation](https://ai.google.dev/gemini-api/docs/google-search); model availability should be checked against [Google's model catalogue](https://ai.google.dev/gemini-api/docs/models). Provider pricing and terms apply independently of the absence of marketplace API subscriptions.
