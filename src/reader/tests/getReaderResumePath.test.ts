import { describe, expect, it } from "vitest"
import manualDraft from "@/manual/manual.draft.json"
import { getManualTopicSlug } from "@/manual/getManualTopicSlug"
import type { Manual } from "@/manual/types"
import { READER_STATE_VERSION } from "@/reader/constants"
import { getReaderResumePath } from "@/reader/getReaderResumePath"
import type { ReaderState } from "@/reader/types"

const manual = manualDraft as Manual
const section = manual.sections[1]
const topic = section.topics[2]

describe("getReaderResumePath", () => {
  it("builds a route from the saved semantic topic instead of storing a URL", () => {
    const state: ReaderState = {
      version: READER_STATE_VERSION,
      lastTopicId: topic.id,
      topics: {
        [topic.id]: { scrollPosition: 300, maximumProgress: 0.6 },
      },
    }

    expect(getReaderResumePath(manual, state)).toBe(
      `/manual/${section.id}#${getManualTopicSlug(section, topic)}`,
    )
  })

  it("does not offer a resume route for a missing topic", () => {
    const state: ReaderState = {
      version: READER_STATE_VERSION,
      lastTopicId: "deleted-topic",
      topics: {},
    }

    expect(getReaderResumePath(manual, state)).toBeNull()
  })
})
