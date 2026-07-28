import type { ForecastDay, Question, StateMap } from "@/types"

/** Count due questions for today and each of the following six local calendar days. */
export function getForecast(
  /** All questions in the bank */
  questions: Question[],
  /** Scheduling state keyed by question id */
  states: StateMap,
  /** Moment whose local date begins the forecast */
  now: Date = new Date(),
): ForecastDay[] {
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())

  return Array.from({ length: 7 }, (_, dayIndex) => {
    const start = new Date(today)
    start.setDate(today.getDate() + dayIndex)
    const end = new Date(start)
    end.setDate(start.getDate() + 1)
    const due = questions.filter(question => {
      const state = states[question.id]
      if (!state) return dayIndex === 0
      const dueAt = new Date(state.due).getTime()
      return dayIndex === 0 ?
          dueAt < end.getTime()
        : dueAt >= start.getTime() && dueAt < end.getTime()
    }).length
    const year = start.getFullYear()
    const month = String(start.getMonth() + 1).padStart(2, "0")
    const day = String(start.getDate()).padStart(2, "0")

    return { date: `${year}-${month}-${day}`, due }
  })
}
