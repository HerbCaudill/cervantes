import { describe, it, expect } from "vitest"
import { getDueQuestions } from "@/lib/getDueQuestions"
import type { Question, ReviewState, StateMap } from "@/types"

const question = (id: string): Question => ({
  id,
  section: "geography",
  type: "true-false",
  prompt: id,
  options: ["Verdadero", "Falso"],
  answerIndex: 0,
})

const now = new Date("2026-06-21T12:00:00.000Z")
const iso = (offsetDays: number) => new Date(now.getTime() + offsetDays * 86_400_000).toISOString()

const stateFor = (questionId: string, dueOffsetDays: number): ReviewState => ({
  questionId,
  repetitions: 1,
  easeFactor: 2.5,
  interval: 1,
  due: iso(dueOffsetDays),
})

describe("getDueQuestions", () => {
  it("treats questions with no saved state as due", () => {
    const due = getDueQuestions([question("a")], {}, now)
    expect(due.map(q => q.id)).toEqual(["a"])
  })

  it("excludes questions scheduled in the future", () => {
    const states: StateMap = { a: stateFor("a", 3) }
    expect(getDueQuestions([question("a")], states, now)).toEqual([])
  })

  it("includes questions due now or in the past", () => {
    const states: StateMap = { a: stateFor("a", 0), b: stateFor("b", -2) }
    const due = getDueQuestions([question("a"), question("b")], states, now)
    expect(due.map(q => q.id).sort()).toEqual(["a", "b"])
  })

  it("orders the most overdue questions first", () => {
    const states: StateMap = { a: stateFor("a", -1), b: stateFor("b", -5) }
    const due = getDueQuestions([question("a"), question("b")], states, now)
    expect(due.map(q => q.id)).toEqual(["b", "a"])
  })
})
