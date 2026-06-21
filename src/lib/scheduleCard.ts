import { FIRST_INTERVAL, GRADE_QUALITY, MIN_EASE, MS_PER_DAY, SECOND_INTERVAL } from "@/constants"
import type { CardState, Grade } from "@/types"

/**
 * Apply the SM-2 spaced-repetition algorithm to a card's state, returning a new
 * state with an updated interval, ease factor, and due date. Pure: the input
 * state is not mutated.
 */
export function scheduleCard(
  /** The card's current scheduling state */
  state: CardState,
  /** How well the user recalled the card this review */
  grade: Grade,
  /** The moment the review happened (defaults to now) */
  now: Date = new Date(),
): CardState {
  const quality = GRADE_QUALITY[grade]
  const passed = quality >= 3

  // a failed review resets the streak; a pass extends it
  const repetitions = passed ? state.repetitions + 1 : 0

  // SM-2 fixes the first two successful intervals, then scales by ease factor
  let interval: number
  if (!passed) {
    interval = FIRST_INTERVAL
  } else if (repetitions === 1) {
    interval = FIRST_INTERVAL
  } else if (repetitions === 2) {
    interval = SECOND_INTERVAL
  } else {
    interval = Math.round(state.interval * state.easeFactor)
  }

  // SM-2 ease-factor adjustment, clamped to the minimum
  const easeFactor = Math.max(
    MIN_EASE,
    state.easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02)),
  )

  const due = new Date(now.getTime() + interval * MS_PER_DAY).toISOString()

  return { ...state, repetitions, interval, easeFactor, due }
}
