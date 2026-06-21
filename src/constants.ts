import type { Grade } from "@/types"

/** Ease factor assigned to brand-new questions before any reviews (SM-2 default). */
export const INITIAL_EASE = 2.5

/** SM-2 never lets the ease factor drop below this floor. */
export const MIN_EASE = 1.3

/** Interval (days) for a question answered correctly for the first time. */
export const FIRST_INTERVAL = 1

/** Interval (days) for a question answered correctly for the second time. */
export const SECOND_INTERVAL = 6

/** Milliseconds in a day, used to advance due dates. */
export const MS_PER_DAY = 24 * 60 * 60 * 1000

/** Maps each UI grade to an SM-2 quality score (0–5); 3+ counts as a pass. */
export const GRADE_QUALITY: Record<Grade, number> = {
  again: 0,
  hard: 3,
  good: 4,
  easy: 5,
}

/** localStorage key under which all question scheduling states are saved. */
export const STORAGE_KEY = "ccse-flashcards:states"

/** The two options presented for every true/false question. */
export const TRUE_FALSE_OPTIONS: [string, string] = ["Verdadero", "Falso"]

/**
 * Human labels for known CCSE section keys. Sections are free-form strings so
 * the imported bank can use any key; unknown keys fall back to a title-cased
 * version of the key via `formatSection`.
 */
export const SECTION_LABELS: Record<string, string> = {
  "constitution-government": "Gobierno, Constitución y leyes",
  "territorial-organization": "Organización territorial",
  "rights-participation": "Derechos y participación ciudadana",
  geography: "Geografía",
  "culture-history": "Cultura e historia",
  society: "Sociedad y vida cotidiana",
}
