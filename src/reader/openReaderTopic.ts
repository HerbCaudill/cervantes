import type { ReaderState } from "@/reader/types"

/** Remember the latest semantic topic without changing its saved measurements. */
export function openReaderTopic(
  /** Existing reader state */
  state: ReaderState,
  /** Stable semantic topic ID */
  topicId: string,
): ReaderState {
  if (state.lastTopicId === topicId) return state
  return { ...state, lastTopicId: topicId }
}
