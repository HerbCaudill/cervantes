import { afterEach, describe, expect, it, vi } from "vitest"
import { shuffleQuestions } from "@/lib/shuffleQuestions"
import type { Question } from "@/types"

describe("shuffleQuestions", () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it("reorders questions using random positions", () => {
    vi.spyOn(Math, "random").mockReturnValue(0)

    expect(shuffleQuestions(QUESTIONS).map(question => question.id)).toEqual(["q2", "q3", "q1"])
  })

  it("leaves the original question order unchanged", () => {
    vi.spyOn(Math, "random").mockReturnValue(0)

    shuffleQuestions(QUESTIONS)

    expect(QUESTIONS.map(question => question.id)).toEqual(["q1", "q2", "q3"])
  })
})

/** Three representative questions for testing queue shuffling. */
const QUESTIONS: Question[] = ["q1", "q2", "q3"].map(id => ({
  id,
  section: "1",
  type: "true-false",
  prompt: id,
  options: ["Verdadero", "Falso"],
  answerIndex: 0,
}))
