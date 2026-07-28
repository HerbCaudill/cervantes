import type { Question, SectionStats, StateMap } from "@/types"

/** Count due and bank questions in each section. */
export function getSectionStats(
  /** All questions in the bank */
  questions: Question[],
  /** Scheduling state keyed by question id */
  states: StateMap,
  /** Moment used to decide which questions are due */
  now: Date = new Date(),
): SectionStats[] {
  const bySection = new Map<string, SectionStats>()

  for (const question of questions) {
    const state = states[question.id]
    const existing = bySection.get(question.section) ?? {
      section: question.section,
      due: 0,
      bank: 0,
    }
    bySection.set(question.section, {
      ...existing,
      due: existing.due + (!state || new Date(state.due).getTime() <= now.getTime() ? 1 : 0),
      bank: existing.bank + 1,
    })
  }

  return [...bySection.values()]
}
