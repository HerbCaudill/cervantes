import { describe, expect, it } from "vitest"
import { getForecast } from "@/lib/getForecast"
import type { Question, StateMap } from "@/types"

const now = new Date("2026-07-28T12:00:00.000Z")

describe("getForecast", () => {
  it("returns seven calendar days and assigns overdue cards to today", () => {
    const questions = [
      question("new"),
      question("overdue"),
      question("today"),
      question("tomorrow"),
      question("later"),
    ]
    const states: StateMap = {
      overdue: state("overdue", "2026-07-20T12:00:00.000Z"),
      today: state("today", "2026-07-28T20:00:00.000Z"),
      tomorrow: state("tomorrow", "2026-07-29T08:00:00.000Z"),
      later: state("later", "2026-08-08T08:00:00.000Z"),
    }

    const forecast = getForecast(questions, states, now)

    expect(forecast).toHaveLength(7)
    expect(forecast.map(day => day.date)).toEqual([
      "2026-07-28",
      "2026-07-29",
      "2026-07-30",
      "2026-07-31",
      "2026-08-01",
      "2026-08-02",
      "2026-08-03",
    ])
    expect(forecast.map(day => day.due)).toEqual([3, 1, 0, 0, 0, 0, 0])
  })
})

/** Build a minimal question for forecast tests. */
function question(id: string): Question {
  return {
    id,
    section: "one",
    type: "true-false",
    prompt: id,
    options: ["Verdadero", "Falso"],
    answerIndex: 0,
  }
}

/** Build a scheduling state for forecast tests. */
function state(questionId: string, due: string) {
  return { questionId, repetitions: 1, easeFactor: 2.5, interval: 1, due }
}
