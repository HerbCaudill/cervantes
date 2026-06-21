import { INITIAL_EASE } from "@/constants"
import type { CardState } from "@/types"

/** Build the default SM-2 state for a card that has never been reviewed. */
export function createInitialState(
  /** id of the card the state belongs to */
  cardId: string,
  /** ISO date the card first becomes due (defaults to now, so it's due immediately) */
  due: string = new Date().toISOString(),
): CardState {
  return {
    cardId,
    repetitions: 0,
    easeFactor: INITIAL_EASE,
    interval: 0,
    due,
  }
}
