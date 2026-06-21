import { describe, it, expect } from "vitest"
import { FIRST_INTERVAL, MIN_EASE, SECOND_INTERVAL } from "@/constants"
import { createInitialState } from "@/lib/createInitialState"
import { scheduleCard } from "@/lib/scheduleCard"
import { MS_PER_DAY } from "@/constants"

const now = new Date("2026-06-21T12:00:00.000Z")

describe("scheduleCard", () => {
  it("gives a first-time pass the first interval", () => {
    const next = scheduleCard(createInitialState("c"), "good", now)
    expect(next.repetitions).toBe(1)
    expect(next.interval).toBe(FIRST_INTERVAL)
  })

  it("gives a second consecutive pass the second interval", () => {
    let state = scheduleCard(createInitialState("c"), "good", now)
    state = scheduleCard(state, "good", now)
    expect(state.repetitions).toBe(2)
    expect(state.interval).toBe(SECOND_INTERVAL)
  })

  it("scales subsequent intervals by the ease factor", () => {
    let state = scheduleCard(createInitialState("c"), "good", now)
    state = scheduleCard(state, "good", now)
    const easeBefore = state.easeFactor
    const next = scheduleCard(state, "good", now)
    expect(next.interval).toBe(Math.round(SECOND_INTERVAL * easeBefore))
  })

  it("resets the streak to a short interval on a failed review", () => {
    let state = scheduleCard(createInitialState("c"), "good", now)
    state = scheduleCard(state, "good", now)
    const lapsed = scheduleCard(state, "again", now)
    expect(lapsed.repetitions).toBe(0)
    expect(lapsed.interval).toBe(FIRST_INTERVAL)
  })

  it("never lets the ease factor drop below the floor", () => {
    let state = createInitialState("c")
    for (let i = 0; i < 10; i++) state = scheduleCard(state, "again", now)
    expect(state.easeFactor).toBeGreaterThanOrEqual(MIN_EASE)
  })

  it("raises the ease factor for an easy answer and lowers it for a hard one", () => {
    const base = scheduleCard(createInitialState("c"), "good", now)
    const easier = scheduleCard(base, "easy", now)
    const harder = scheduleCard(base, "hard", now)
    expect(easier.easeFactor).toBeGreaterThan(base.easeFactor)
    expect(harder.easeFactor).toBeLessThan(base.easeFactor)
  })

  it("sets the due date interval days into the future", () => {
    const next = scheduleCard(createInitialState("c"), "good", now)
    const expected = now.getTime() + next.interval * MS_PER_DAY
    expect(new Date(next.due).getTime()).toBe(expected)
  })

  it("does not mutate the input state", () => {
    const state = createInitialState("c")
    const snapshot = { ...state }
    scheduleCard(state, "good", now)
    expect(state).toEqual(snapshot)
  })
})
