// =========================================================
// Step 8/9: Apply Condition Adjustment Multiplier
// =========================================================

import { ConditionGrade } from '../types';
import { CONDITION_MULTIPLIERS } from '../config';

export function applyConditionAdjustment(
  baseMarketPrice: number,
  conditionGrade: ConditionGrade,
  conditionScore?: number
): number {
  let multiplier = CONDITION_MULTIPLIERS[conditionGrade] || 1.0;

  // Fine-tune with exact condition score if provided
  if (typeof conditionScore === 'number' && !isNaN(conditionScore)) {
    const clampedScore = Math.max(1, Math.min(10, conditionScore));
    // Blend condition score baseline
    const scoreFactor = 0.4 + (clampedScore / 10) * 0.65;
    multiplier = (multiplier * 0.6) + (scoreFactor * 0.4);
  }

  const adjusted = Math.round(baseMarketPrice * multiplier);
  return Math.max(5, adjusted);
}
