// =========================================================
// Product Identification Schemas and Normalizers
// =========================================================

import { ConditionGrade, IdentifiedProduct } from '../types';

export const IDENTIFICATION_SYSTEM_INSTRUCTION = `
You are the master vision AI identification engine for PriceSnap, New Zealand's premier secondary marketplace appraisal system.
Your mission is to perform high-precision item recognition and cosmetic grading from images.

Analyze the provided image and extract:
1. item_name: Exact descriptive title including brand, model, variant, and colorway (e.g. 'Sony WH-1000XM4 Wireless Noise Canceling Headphones').
2. brand: The recognized manufacturer or brand name (e.g. 'Sony', 'Nike', 'Apple', 'Nintendo').
3. category: The primary retail category (e.g. 'Audio & Electronics', 'Sneakers & Footwear', 'Gaming Consoles', 'Smartphones').
4. condition_score: Integer from 1 to 10 based on visible physical wear, scratches, scuffs, creasing, and packaging condition. (10 = Brand new in box, 9 = Like new/Mint, 8 = Very good with light cosmetic marks, 7 = Good, 5-6 = Fair/Heavy wear, <5 = Damaged/Parts).
5. condition_grade: One of 'A+', 'A', 'A-', 'B', 'C', 'D'.
6. defects: Array of specific observed cosmetic or mechanical issues/wear (e.g. ['Minor scratch on lower bezel', 'Light sole creasing']). If pristine, return an empty array or positive note.
7. summary: A concise 1-2 sentence professional appraisal summary of the item and its apparent condition.
8. certaintyScore: Float between 0.50 and 0.99 indicating your visual identification certainty.
9. suggestedQueries: Array of 3-4 optimal search queries targeting New Zealand secondary market listings (e.g. ['Sony WH-1000XM4 Trade Me NZ', 'Sony WH-1000XM4 Facebook Marketplace Auckland NZ', 'Sony WH-1000XM4 price New Zealand']).

Return strict, valid JSON matching the requested structure.
`;

export function normalizeIdentifiedProduct(raw: any, fallbackSeed = ''): IdentifiedProduct {
  const name = String(raw?.item_name || raw?.name || raw?.title || 'Identified Secondary Market Item').trim();
  const brand = String(raw?.brand || 'Generic / Unbranded').trim();
  const category = String(raw?.category || raw?.item_category || 'General Merchandise').trim();

  let score = Number(raw?.condition_score ?? raw?.conditionScore ?? 8);
  if (isNaN(score) || score < 1) score = 1;
  if (score > 10) score = 10;
  score = Math.round(score);

  let grade: ConditionGrade = 'A-';
  const rawGrade = String(raw?.condition_grade || raw?.grade || '').toUpperCase();
  if (['A+', 'A', 'A-', 'B', 'C', 'D'].includes(rawGrade)) {
    grade = rawGrade as ConditionGrade;
  } else {
    if (score >= 10) grade = 'A+';
    else if (score >= 9) grade = 'A';
    else if (score >= 8) grade = 'A-';
    else if (score >= 7) grade = 'B';
    else if (score >= 5) grade = 'C';
    else grade = 'D';
  }

  const defects: string[] = Array.isArray(raw?.defects)
    ? raw.defects.map((d: any) => String(d).trim()).filter(Boolean)
    : Array.isArray(raw?.issues)
      ? raw.issues.map((d: any) => String(d).trim()).filter(Boolean)
      : [];

  const summary = String(
    raw?.summary ||
    `Identified as ${name} in Grade ${grade} condition (Score ${score}/10).`
  ).trim();

  let certainty = Number(raw?.certaintyScore ?? raw?.certainty ?? raw?.confidence ?? 0.92);
  if (certainty > 1 && certainty <= 100) certainty /= 100;
  if (isNaN(certainty) || certainty < 0.3) certainty = 0.85;

  const queries: string[] = Array.isArray(raw?.suggestedQueries) && raw.suggestedQueries.length > 0
    ? raw.suggestedQueries.map((q: any) => String(q).trim()).filter(Boolean)
    : [
        `${brand} ${name} Trade Me NZ`,
        `${name} price New Zealand second hand`,
        `${brand} ${name} Facebook marketplace NZ`
      ];

  return {
    name,
    item_name: name,
    brand,
    category,
    item_category: category,
    condition_score: score,
    condition_grade: grade,
    condition: {
      score,
      grade,
      defects,
      issues: defects,
      summary
    },
    defects,
    issues: defects,
    summary,
    certaintyScore: certainty,
    suggestedQueries: queries
  };
}
