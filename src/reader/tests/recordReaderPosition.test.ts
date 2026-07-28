import { describe, expect, it } from "vitest"
import { READER_STATE_VERSION } from "@/reader/constants"
import { recordReaderPosition } from "@/reader/recordReaderPosition"
import type { ReaderState } from "@/reader/types"

describe("recordReaderPosition", () => {
  it("keeps the newest offset and the furthest progress reached", () => {
    const initial: ReaderState = {
      version: READER_STATE_VERSION,
      lastTopicId: "topic-1",
      topics: {
        "topic-1": { scrollPosition: 500, maximumProgress: 0.75 },
      },
    }

    const state = recordReaderPosition(initial, "topic-1", 120, 0.25)

    expect(state.topics["topic-1"]).toEqual({
      scrollPosition: 120,
      maximumProgress: 0.75,
    })
  })

  it("tracks offsets independently for every semantic topic", () => {
    const initial: ReaderState = {
      version: READER_STATE_VERSION,
      lastTopicId: null,
      topics: {},
    }

    const first = recordReaderPosition(initial, "topic-1", 125, 0.2)
    const second = recordReaderPosition(first, "topic-2", 450, 0.8)

    expect(second.topics).toEqual({
      "topic-1": { scrollPosition: 125, maximumProgress: 0.2 },
      "topic-2": { scrollPosition: 450, maximumProgress: 0.8 },
    })
  })

  it("clamps browser measurements to persistable ranges", () => {
    const initial: ReaderState = {
      version: READER_STATE_VERSION,
      lastTopicId: null,
      topics: {},
    }

    expect(recordReaderPosition(initial, "topic-1", -40, 1.4).topics["topic-1"]).toEqual({
      scrollPosition: 0,
      maximumProgress: 1,
    })
  })
})
