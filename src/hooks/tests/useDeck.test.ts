import { act, renderHook } from "@testing-library/react"
import { beforeEach, describe, expect, it } from "vitest"
import { STORAGE_KEY } from "@/constants"
import { questions } from "@/data/questions"
import { useDeck } from "@/hooks/useDeck"

describe("useDeck", () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it("exposes only the practice data and actions consumed by the UI", () => {
    const { result } = renderHook(useDeck)

    expect(Object.keys(result.current)).toEqual([
      "dueQuestions",
      "sectionStats",
      "totalCount",
      "review",
    ])
  })

  it("reschedules, persists, and removes a reviewed question from the due queue", () => {
    const { result } = renderHook(useDeck)
    const first = questions[0]

    act(() => result.current.review(first.id, "good"))

    expect(result.current.dueQuestions).not.toContainEqual(first)
    expect(JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "{}")[first.id]).toMatchObject({
      questionId: first.id,
      repetitions: 1,
      interval: 1,
    })
  })
})
