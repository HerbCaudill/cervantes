import type { Question, StateMap } from "@/types"

/**
 * Return the questions that are due for review now, ordered by how overdue they
 * are (most overdue first). A question with no saved state is treated as due.
 */
export function getDueQuestions(
  /** All questions in the deck */
  questions: Question[],
  /** Scheduling state for each question, keyed by question id */
  states: StateMap,
  /** The moment to evaluate due-ness against (defaults to now) */
  now: Date = new Date(),
): Question[] {
  const isDue = (question: Question) => {
    const state = states[question.id]
    if (!state) return true
    return new Date(state.due).getTime() <= now.getTime()
  }

  const dueDate = (question: Question) => states[question.id]?.due ?? ""

  return questions.filter(isDue).sort((a, b) => dueDate(a).localeCompare(dueDate(b)))
}
