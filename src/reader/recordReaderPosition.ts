import type { ReaderState } from "@/reader/types"

/** Record a topic offset while preserving its furthest valid reading progress. */
export function recordReaderPosition(
  /** Existing reader state */
  state: ReaderState,
  /** Stable semantic topic ID */
  topicId: string,
  /** Current vertical document offset */
  scrollPosition: number,
  /** Current fractional reading progress */
  progress: number,
): ReaderState {
  const existing = state.topics[topicId]
  const nextScrollPosition =
    Number.isFinite(scrollPosition) ? Math.max(0, Math.round(scrollPosition)) : 0
  const nextProgress = Number.isFinite(progress) ? Math.min(1, Math.max(0, progress)) : 0

  return {
    ...state,
    topics: {
      ...state.topics,
      [topicId]: {
        scrollPosition: nextScrollPosition,
        maximumProgress: Math.max(existing?.maximumProgress ?? 0, nextProgress),
      },
    },
  }
}
