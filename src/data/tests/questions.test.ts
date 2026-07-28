import { describe, expect, it } from "vitest"
import { questions } from "@/data/questions"

describe("official CCSE question bank", () => {
  it("contains every official 2026 question exactly once", () => {
    const ranges = [
      [1001, 1120],
      [2001, 2036],
      [3001, 3024],
      [4001, 4036],
      [5001, 5084],
    ] as const
    const expectedIds = ranges.flatMap(([first, last]) =>
      Array.from({ length: last - first + 1 }, (_, index) => String(first + index)),
    )

    expect(questions.map(({ id }) => id)).toEqual(expectedIds)
    expect(new Set(questions.map(({ id }) => id)).size).toBe(300)
  })
})
