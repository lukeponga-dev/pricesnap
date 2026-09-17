import { z } from 'zod';

export const ListingSchema = z.object({
  source: z.string().min(1),
  title: z.string(),
  url: z.string().url(),
  priceNzd: z.number().positive(),
  condition: z.string().nullable().default(null),
  retrievedAt: z.string().datetime(),
});

export const PlatformMarketSchema = z.object({
  low: z.number().nonnegative().nullable(),
  median: z.number().nonnegative().nullable(),
  high: z.number().nonnegative().nullable(),
  sample_listings: z.array(ListingSchema),
  evidence_count: z.number().int().nonnegative(),
});

export const MarketConfidenceSchema = z.object({
  score: z.number().min(0).max(1),
  label: z.enum(['none', 'low', 'medium', 'high']),
  evidence_count: z.number().int().nonnegative(),
  source_count: z.number().int().nonnegative(),
  price_spread: z.number().nonnegative().nullable(),
});

export const MarketSchema = z.object({
  trademe: PlatformMarketSchema.nullable(),
  facebook: PlatformMarketSchema.nullable(),
  ebay: PlatformMarketSchema.nullable(),
  trend: z.enum(['rising', 'stable', 'falling']).nullable(),
  recommended_price: z.number().nonnegative().nullable(),
  price_low: z.number().nonnegative().nullable().optional(),
  price_high: z.number().nonnegative().nullable().optional(),
  best_platform: z.string().nullable(),
  grounded: z.boolean(),
  warnings: z.array(z.string()).optional(),
  price_basis: z.literal('asking_prices').optional(),
  search_entry_point: z.string().nullable().optional(),
  confidence: MarketConfidenceSchema.optional(),
  evidence_sources: z.record(z.string(), z.number().int().nonnegative()).optional(),
  sample_listings: z.array(ListingSchema).optional(),
  rejected_evidence_count: z.number().int().nonnegative().optional(),
});

export const ProductSchema = z.object({
  name: z.string().nullable(),
  brand: z.string().nullable(),
  category: z.string().nullable(),
  condition_score: z.number().min(1).max(10).nullable(),
  condition_grade: z.string().nullable(),
  defects: z.array(z.string()),
  resale_price_nz: z.number().nonnegative().nullable(),
  confidence: z.number().min(0).max(1).nullable(),
  confidence_color: z.enum(['green', 'orange', 'red']),
  summary: z.string(),
});

export const AppraisalSchema = z.object({
  status: z.enum(['identified', 'unidentified']),
  item: z.string().nullable(),
  item_category: z.string().nullable(),
  item_name: z.string().nullable(),
  brand: z.string().nullable(),
  conditionScore: z.number().min(1).max(10).nullable(),
  condition_score: z.number().min(1).max(10).nullable(),
  defects: z.array(z.string()),
  resale_price_nz: z.number().nonnegative().nullable(),
  confidence: z.number().min(0).max(1).nullable(),
  market: MarketSchema.nullable(),
  product: ProductSchema,
});

export const SuccessResponseSchema = AppraisalSchema.extend({
  ok: z.literal(true),
  id: z.string().uuid(),
  date: z.string().datetime(),
  appraisal: AppraisalSchema,
  meta: z.object({
    warnings: z.array(z.string()).optional(),
    timestamp: z.string().datetime(),
    analysis_id: z.string().uuid(),
    request_id: z.string().uuid(),
    model: z.string(),
    duration_ms: z.number().int().nonnegative(),
    grounding_duration_ms: z.number().int().nonnegative(),
  }),
});

export const ErrorResponseSchema = z.object({
  ok: z.literal(false),
  error: z.object({ code: z.string(), message: z.string(), request_id: z.string().uuid(), details: z.unknown().optional() }),
  meta: z.object({ duration_ms: z.number().int().nonnegative() }),
});

export type Appraisal = z.infer<typeof AppraisalSchema>;
export type SuccessResponse = z.infer<typeof SuccessResponseSchema>;
export type ErrorResponse = z.infer<typeof ErrorResponseSchema>;
export type ListingComparable = z.infer<typeof ListingSchema>;
export type PlatformMarket = z.infer<typeof PlatformMarketSchema>;
