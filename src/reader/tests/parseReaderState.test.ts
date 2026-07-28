import { describe, expect, it } from "vitest"
import manualDraft from "@/manual/manual.draft.json"
import type { Manual } from "@/manual/types"
import { READER_STATE_VERSION } from "@/reader/constants"
import { parseReaderState } from "@/reader/parseReaderState"

const manual = manualDraft as Manual
const firstTopicId = manual.sections[0].topics[0].id
const secondTopicId = manual.sections[0].topics[1].id

describe("parseReaderState", () => {
  it("starts empty when no reader state has been saved", () => {
    expect(parseReaderState(null, manual)).toEqual({
      version: READER_STATE_VERSION,
      lastTopicId: null,
      topics: {},
    })
  })

  it("loads valid positions and furthest progress for current semantic topics", () => {
    const state = parseReaderState(
      JSON.stringify({
        version: READER_STATE_VERSION,
        lastTopicId: secondTopicId,
        topics: {
          [firstTopicId]: { scrollPosition: 240, maximumProgress: 0.4 },
          [secondTopicId]: { scrollPosition: 75, maximumProgress: 0.25 },
        },
      }),
      manual,
    )

    expect(state).toEqual({
      version: READER_STATE_VERSION,
      lastTopicId: secondTopicId,
      topics: {
        [firstTopicId]: { scrollPosition: 240, maximumProgress: 0.4 },
        [secondTopicId]: { scrollPosition: 75, maximumProgress: 0.25 },
      },
    })
  })

  it.each([
    ["corrupt JSON", "{"],
    [
      "an unsupported version",
      JSON.stringify({
        version: READER_STATE_VERSION + 1,
        lastTopicId: firstTopicId,
        topics: {},
      }),
    ],
    ["an invalid shape", JSON.stringify({ version: READER_STATE_VERSION, topics: [] })],
  ])("starts empty for %s", (_name, raw) => {
    expect(parseReaderState(raw, manual)).toEqual({
      version: READER_STATE_VERSION,
      lastTopicId: null,
      topics: {},
    })
  })

  it("drops deleted topic IDs and safely clears a stale resume target", () => {
    expect(
      parseReaderState(
        JSON.stringify({
          version: READER_STATE_VERSION,
          lastTopicId: "deleted-topic",
          topics: {
            [firstTopicId]: { scrollPosition: 120, maximumProgress: 0.2 },
            "deleted-topic": { scrollPosition: 999, maximumProgress: 1 },
          },
        }),
        manual,
      ),
    ).toEqual({
      version: READER_STATE_VERSION,
      lastTopicId: null,
      topics: {
        [firstTopicId]: { scrollPosition: 120, maximumProgress: 0.2 },
      },
    })
  })

  it("ignores malformed topic entries without losing valid progress", () => {
    expect(
      parseReaderState(
        JSON.stringify({
          version: READER_STATE_VERSION,
          lastTopicId: firstTopicId,
          topics: {
            [firstTopicId]: { scrollPosition: -1, maximumProgress: 2 },
            [secondTopicId]: { scrollPosition: 80, maximumProgress: 0.5 },
          },
        }),
        manual,
      ),
    ).toEqual({
      version: READER_STATE_VERSION,
      lastTopicId: firstTopicId,
      topics: {
        [secondTopicId]: { scrollPosition: 80, maximumProgress: 0.5 },
      },
    })
  })
})
