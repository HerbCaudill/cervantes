import { INITIAL_EASE } from "@/constants"
import type { ReviewState } from "@/types"

/** Build the default SM-2 state for a question that has never been reviewed. */
export function createInitialState(
  /** id of the question the state belongs to */
  questionId: string,
  /** ISO date the question first becomes due (defaults to now, so it's due immediately) */
  due: string = new Date().toISOString(),
): ReviewState {
  return {
    questionId,
    repetitions: 0,
    easeFactor: INITIAL_EASE,
    interval: 0,
    due,
  }
}
