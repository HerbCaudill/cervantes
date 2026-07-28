import type { Manual } from "@/manual/types"
import { READER_STATE_VERSION } from "@/reader/constants"
import { createEmptyReaderState } from "@/reader/createEmptyReaderState"
import type { ReaderState, ReaderTopicState } from "@/reader/types"

/** Parse, validate, and prune persisted reader state against the current manual. */
export function parseReaderState(
  /** Raw JSON from the reader-specific storage key */
  raw: string | null,
  /** Current manual whose semantic IDs are authoritative */
  manual: Manual,
): ReaderState {
  if (!raw) return createEmptyReaderState()

  try {
    const value = JSON.parse(raw) as Record<string, unknown>
    if (
      !value ||
      typeof value !== "object" ||
      Array.isArray(value) ||
      value.version !== READER_STATE_VERSION ||
      !value.topics ||
      typeof value.topics !== "object" ||
      Array.isArray(value.topics)
    ) {
      return createEmptyReaderState()
    }

    const topicIds = new Set(
      manual.sections.flatMap(section => section.topics.map(topic => topic.id)),
    )
    const topics = Object.entries(value.topics).reduce<Record<string, ReaderTopicState>>(
      (validTopics, [topicId, candidate]) => {
        if (
          !topicIds.has(topicId) ||
          !candidate ||
          typeof candidate !== "object" ||
          Array.isArray(candidate)
        ) {
          return validTopics
        }

        const topicState = candidate as Record<string, unknown>
        if (
          typeof topicState.scrollPosition !== "number" ||
          !Number.isFinite(topicState.scrollPosition) ||
          topicState.scrollPosition < 0 ||
          typeof topicState.maximumProgress !== "number" ||
          !Number.isFinite(topicState.maximumProgress) ||
          topicState.maximumProgress < 0 ||
          topicState.maximumProgress > 1
        ) {
          return validTopics
        }

        return {
          ...validTopics,
          [topicId]: {
            scrollPosition: topicState.scrollPosition,
            maximumProgress: topicState.maximumProgress,
          },
        }
      },
      {},
    )
    const lastTopicId =
      typeof value.lastTopicId === "string" && topicIds.has(value.lastTopicId) ?
        value.lastTopicId
      : null

    return {
      version: READER_STATE_VERSION,
      lastTopicId,
      topics,
    }
  } catch {
    return createEmptyReaderState()
  }
}
