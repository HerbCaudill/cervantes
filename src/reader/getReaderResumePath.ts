import { getManualTopicHref } from "@/manual/getManualTopicHref"
import type { Manual } from "@/manual/types"
import type { ReaderState } from "@/reader/types"

/** Resolve the latest semantic reader topic to its current public route. */
export function getReaderResumePath(
  /** Current manual */
  manual: Manual,
  /** Current local reader state */
  state: ReaderState,
): string | null {
  if (!state.lastTopicId) return null

  for (const section of manual.sections) {
    const topic = section.topics.find(candidate => candidate.id === state.lastTopicId)
    if (topic) return getManualTopicHref(section, topic)
  }

  return null
}
