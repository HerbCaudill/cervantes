import {
  MANUAL_CALLOUT_DEDUPLICATION_MIN_LENGTH,
  MANUAL_SEARCH_TASK_BUDGET_MS,
} from "@/manual/constants"
import { createManualBodyTextIndex } from "@/manual/createManualBodyTextIndex"
import { getManualBodySearchSegments } from "@/manual/getManualBodySearchSegments"
import { buildManualSearchIndexEntry } from "@/manual/search/buildManualSearchIndexEntry"
import type { ManualSearchIndexEntry } from "@/manual/search/types"
import { yieldToManualSearch } from "@/manual/search/yieldToManualSearch"
import type { Manual } from "@/manual/types"

/** Build the local search index in bounded phases that yield between main-thread tasks. */
export async function buildManualSearchIndexAsync(
  /** Complete structured manual */
  manual: Manual,
): Promise<ManualSearchIndexEntry[]> {
  const bodySearchSegments = getManualBodySearchSegments(manual)
  await yieldToManualSearch()
  const bodyTextIndex = createManualBodyTextIndex(
    bodySearchSegments,
    MANUAL_CALLOUT_DEDUPLICATION_MIN_LENGTH,
  )
  await yieldToManualSearch()
  const entries: ManualSearchIndexEntry[] = []
  let workStartedAt = performance.now()

  for (const [sectionIndex, section] of manual.sections.entries()) {
    for (const [topicIndex, topic] of section.topics.entries()) {
      entries.push(
        buildManualSearchIndexEntry(
          manual,
          section,
          sectionIndex,
          topic,
          topicIndex,
          bodyTextIndex,
        ),
      )
      if (performance.now() - workStartedAt >= MANUAL_SEARCH_TASK_BUDGET_MS) {
        await yieldToManualSearch()
        workStartedAt = performance.now()
      }
    }
  }

  return entries
}
