export class ValuationError extends Error {
  constructor(public code: string, message: string, public status = 502) {
    super(message);
    this.name = 'ValuationError';
  }
}

export function publicError(error: unknown): ValuationError {
  if (error instanceof ValuationError) return error;
  const status = Number((error as { status?: number })?.status);
  const name = (error as Error)?.name;
  if (name === 'AbortError' || name === 'TimeoutError' || status === 504) {
    return new ValuationError('ANALYSIS_TIMEOUT', 'Analysis timed out. Please try again.', 504);
  }
  if (status === 429) return new ValuationError('PROVIDER_RATE_LIMIT', 'The AI service is busy or its quota is exhausted. Please try later.', 429);
  return new ValuationError('ANALYSIS_FAILED', 'The AI service could not complete this scan. Please try again.', 502);
}
