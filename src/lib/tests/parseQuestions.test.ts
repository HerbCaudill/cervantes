import { describe, it, expect } from "vitest"
import { TRUE_FALSE_OPTIONS } from "@/constants"
import { parseQuestions } from "@/lib/parseQuestions"

describe("parseQuestions", () => {
  it("normalizes a true/false question, defaulting its options", () => {
    const [q] = parseQuestions([
      { id: "tf", section: "geography", type: "true-false", prompt: "P", answer: true },
    ])
    expect(q.options).toEqual(TRUE_FALSE_OPTIONS)
    expect(q.answerIndex).toBe(0)
  })

  it("maps a false true/false answer to the second option", () => {
    const [q] = parseQuestions([
      { id: "tf", section: "geography", type: "true-false", prompt: "P", answer: false },
    ])
    expect(q.answerIndex).toBe(1)
  })

  it("keeps multiple-choice options and the answer index", () => {
    const [q] = parseQuestions([
      {
        id: "mc",
        section: "culture-history",
        type: "multiple-choice",
        prompt: "P",
        options: ["a", "b", "c"],
        answer: 2,
      },
    ])
    expect(q.options).toEqual(["a", "b", "c"])
    expect(q.answerIndex).toBe(2)
  })

  it("skips malformed entries but keeps the valid ones", () => {
    const result = parseQuestions([
      { id: "ok", section: "geography", type: "true-false", prompt: "P", answer: true },
      { id: "bad-answer", section: "geography", type: "true-false", prompt: "P", answer: "yes" },
      {
        id: "bad-index",
        section: "x",
        type: "multiple-choice",
        prompt: "P",
        options: ["a"],
        answer: 5,
      },
      { nope: true },
    ])
    expect(result.map(q => q.id)).toEqual(["ok"])
  })

  it("returns an empty array for non-array input", () => {
    expect(parseQuestions({})).toEqual([])
    expect(parseQuestions(null)).toEqual([])
  })
})
