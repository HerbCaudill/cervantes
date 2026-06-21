import { useCallback, useState } from "react"
import { cards } from "@/data/cards"
import { createInitialState } from "@/lib/createInitialState"
import { getDueCards } from "@/lib/getDueCards"
import { loadStates } from "@/lib/loadStates"
import { saveStates } from "@/lib/saveStates"
import { scheduleCard } from "@/lib/scheduleCard"
import type { Grade } from "@/types"

/**
 * Manage the deck's scheduling state: load it from storage, expose the cards due
 * for review, and record a grade for a card (rescheduling and persisting it).
 */
export function useDeck() {
  const [states, setStates] = useState(loadStates)

  /** Record a review of a card, reschedule it via SM-2, and persist the result. */
  const review = useCallback((cardId: string, grade: Grade) => {
    setStates(prev => {
      const current = prev[cardId] ?? createInitialState(cardId)
      const next = { ...prev, [cardId]: scheduleCard(current, grade) }
      saveStates(next)
      return next
    })
  }, [])

  return {
    states,
    dueCards: getDueCards(cards, states),
    totalCount: cards.length,
    review,
  }
}
