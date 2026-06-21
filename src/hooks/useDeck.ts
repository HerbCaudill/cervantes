import { useCallback, useState } from "react"
import { questions } from "@/data/questions"
import { createInitialState } from "@/lib/createInitialState"
import { getDueQuestions } from "@/lib/getDueQuestions"
import { loadStates } from "@/lib/loadStates"
import { saveStates } from "@/lib/saveStates"
import { scheduleCard } from "@/lib/scheduleCard"
import type { Grade } from "@/types"

/**
 * Manage the deck's scheduling state: load it from storage, expose the questions
 * due for review, and record a grade for a question (rescheduling and persisting
 * it via SM-2).
 */
export function useDeck() {
  const [states, setStates] = useState(loadStates)

  /** Record a review of a question, reschedule it via SM-2, and persist the result. */
  const review = useCallback((questionId: string, grade: Grade) => {
    setStates(prev => {
      const current = prev[questionId] ?? createInitialState(questionId)
      const next = { ...prev, [questionId]: scheduleCard(current, grade) }
      saveStates(next)
      return next
    })
  }, [])

  return {
    states,
    dueQuestions: getDueQuestions(questions, states),
    totalCount: questions.length,
    review,
  }
}
