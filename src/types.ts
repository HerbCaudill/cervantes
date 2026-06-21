/** A study category used to group and label cards in the deck. */
export type Category = "vocabulary" | "verbs" | "expressions" | "grammar"

/** The four self-assessment grades a user can give after recalling a card. */
export type Grade = "again" | "hard" | "good" | "easy"

/** A single flash card: a Spanish prompt and its answer. */
export interface Card {
  /** Stable unique id, kept across edits so review history is preserved */
  id: string
  /** The Spanish prompt shown on the front of the card */
  front: string
  /** The answer (translation or definition) shown on the back */
  back: string
  /** Optional example sentence shown with the answer for context */
  example?: string
  /** Grouping used for labelling and (future) filtering */
  category: Category
}

/** The SM-2 spaced-repetition scheduling state for a single card. */
export interface CardState {
  /** id of the card this state belongs to */
  cardId: string
  /** Number of consecutive successful reviews */
  repetitions: number
  /** Ease factor controlling how fast intervals grow (min 1.3) */
  easeFactor: number
  /** Current interval in days until the next review */
  interval: number
  /** ISO date string for when the card is next due */
  due: string
}

/** Map of card id to its scheduling state, as persisted to storage. */
export type StateMap = Record<string, CardState>
