import { describe, it, expect } from "vitest"
import { getDueCards } from "@/lib/getDueCards"
import type { Card, StateMap } from "@/types"

const card = (id: string): Card => ({
  id,
  front: id,
  back: id,
  category: "vocabulary",
})

const now = new Date("2026-06-21T12:00:00.000Z")
const iso = (offsetDays: number) => new Date(now.getTime() + offsetDays * 86_400_000).toISOString()

const stateFor = (cardId: string, dueOffsetDays: number): StateMap[string] => ({
  cardId,
  repetitions: 1,
  easeFactor: 2.5,
  interval: 1,
  due: iso(dueOffsetDays),
})

describe("getDueCards", () => {
  it("treats cards with no saved state as due", () => {
    const due = getDueCards([card("a")], {}, now)
    expect(due.map(c => c.id)).toEqual(["a"])
  })

  it("excludes cards scheduled in the future", () => {
    const states: StateMap = { a: stateFor("a", 3) }
    expect(getDueCards([card("a")], states, now)).toEqual([])
  })

  it("includes cards due now or in the past", () => {
    const states: StateMap = { a: stateFor("a", 0), b: stateFor("b", -2) }
    const due = getDueCards([card("a"), card("b")], states, now)
    expect(due.map(c => c.id).sort()).toEqual(["a", "b"])
  })

  it("orders the most overdue cards first", () => {
    const states: StateMap = { a: stateFor("a", -1), b: stateFor("b", -5) }
    const due = getDueCards([card("a"), card("b")], states, now)
    expect(due.map(c => c.id)).toEqual(["b", "a"])
  })
})
