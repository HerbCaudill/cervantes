import type { Card, StateMap } from "@/types"

/**
 * Return the cards that are due for review now, ordered by how overdue they are
 * (most overdue first). A card with no saved state is treated as due.
 */
export function getDueCards(
  /** All cards in the deck */
  cards: Card[],
  /** Scheduling state for each card, keyed by card id */
  states: StateMap,
  /** The moment to evaluate due-ness against (defaults to now) */
  now: Date = new Date(),
): Card[] {
  const isDue = (card: Card) => {
    const state = states[card.id]
    if (!state) return true
    return new Date(state.due).getTime() <= now.getTime()
  }

  const dueDate = (card: Card) => states[card.id]?.due ?? ""

  return cards.filter(isDue).sort((a, b) => dueDate(a).localeCompare(dueDate(b)))
}
