import type { ManualSection } from "@/manual/types"
import type { ReaderState } from "@/reader/types"

/** Derive a whole-number task percentage from furthest progress across its topics. */
export function getManualSectionProgress(
  /** Manual task whose progress should be summarized */
  section: ManualSection,
  /** Current local reader state */
  state: ReaderState,
): number {
  const totalProgress = section.topics.reduce(
    (total, topic) => total + (state.topics[topic.id]?.maximumProgress ?? 0),
    0,
  )

  return Math.round((totalProgress / section.topics.length) * 100)
}
