import { describe, expect, it } from "vitest"
import manualDraft from "@/manual/manual.draft.json"
import { getAdjacentManualTopics } from "@/manual/getAdjacentManualTopics"
import type { Manual } from "@/manual/types"

describe("getAdjacentManualTopics", () => {
  it("crosses task boundaries in source order", () => {
    const manual = manualDraft as Manual
    const lastTaskOneTopic = manual.sections[0].topics.at(-1)
    const firstTaskTwoTopic = manual.sections[1].topics[0]

    expect(lastTaskOneTopic).toBeDefined()
    const adjacent = getAdjacentManualTopics(manual, lastTaskOneTopic!.id)

    expect(adjacent.next?.topic.id).toBe(firstTaskTwoTopic.id)
    expect(adjacent.next?.section.id).toBe("task-2")
  })

  it("has no previous topic before the first topic and no next topic after the last", () => {
    const manual = manualDraft as Manual
    const firstTopic = manual.sections[0].topics[0]
    const lastTopic = manual.sections.at(-1)!.topics.at(-1)!

    expect(getAdjacentManualTopics(manual, firstTopic.id).previous).toBeNull()
    expect(getAdjacentManualTopics(manual, lastTopic.id).next).toBeNull()
  })
})
