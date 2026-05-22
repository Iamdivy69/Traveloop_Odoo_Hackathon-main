/**
 * Budget estimation constants used across trip.service.ts and stopActivity.service.ts.
 * Centralised here so both engines always stay in sync.
 */
export const BUDGET = {
  /** Fraction of city cost_index applied to accommodation per night. */
  ACCOMMODATION_RATE: 0.45,
  /** Fraction of city cost_index applied to meals per night. */
  MEALS_RATE: 0.3,
  /** Flat USD transport estimate per leg (i.e. per stop-to-stop journey). */
  TRANSPORT_PER_LEG_USD: 80,
} as const;
