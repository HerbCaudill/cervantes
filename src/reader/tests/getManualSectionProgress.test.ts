import { describe, expect, it } from "vitest"
import manualDraft from "@/manual/manual.draft.json"
import type { Manual } from "@/manual/types"
import { READER_STATE_VERSION } from "@/reader/constants"
import { getManualSectionProgress } from "@/reader/getManualSectionProgress"
import type { ReaderState } from "@/reader/types"

const manual = manualDraft as Manual
const section = manual.sections[0]

describe("getManualSectionProgress", () => {
  it("derives a task percentage from each topic's furthest progress", () => {
    const state: ReaderState = {
      version: READER_STATE_VERSION,
      lastTopicId: section.topics[1].id,
      topics: {
        [section.topics[0].id]: { scrollPosition: 0, maximumProgress: 1 },
        [section.topics[1].id]: { scrollPosition: 0, maximumProgress: 0.5 },
      },
    }

    expect(getManualSectionProgress(section, state)).toBe(10)
  })

  it("reports zero for an unread task", () => {
    const state: ReaderState = {
      version: READER_STATE_VERSION,
      lastTopicId: null,
      topics: {},
    }

    expect(getManualSectionProgress(section, state)).toBe(0)
  })
})
