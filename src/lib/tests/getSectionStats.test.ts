import { describe, expect, it } from "vitest"
import { getSectionStats } from "@/lib/getSectionStats"
import type { Question, StateMap } from "@/types"

const now = new Date("2026-07-28T12:00:00.000Z")

describe("getSectionStats", () => {
  it("counts due, bank, and learned questions by section", () => {
    const questions = [
      question("due", "one"),
      question("future", "one"),
      question("learned", "two"),
      question("new", "two"),
    ]
    const states: StateMap = {
      due: state("due", 3, "2026-07-28T11:00:00.000Z"),
      future: state("future", 2, "2026-07-29T12:00:00.000Z"),
      learned: state("learned", 21, "2026-08-18T12:00:00.000Z"),
    }

    expect(getSectionStats(questions, states, now)).toEqual([
      { section: "one", due: 1, bank: 2, learned: 0 },
      { section: "two", due: 1, bank: 2, learned: 1 },
    ])
  })

  it("treats questions without saved state as due", () => {
    expect(getSectionStats([question("new", "one")], {}, now)[0]?.due).toBe(1)
  })
})

/** Build a minimal question for section-stat tests. */
function question(id: string, section: string): Question {
  return {
    id,
    section,
    type: "true-false",
    prompt: id,
    options: ["Verdadero", "Falso"],
    answerIndex: 0,
  }
}

/** Build a scheduling state for section-stat tests. */
function state(questionId: string, interval: number, due: string) {
  return { questionId, repetitions: 1, easeFactor: 2.5, interval, due }
}
