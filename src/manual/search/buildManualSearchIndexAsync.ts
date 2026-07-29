import { MANUAL_SEARCH_TASK_BUDGET_MS } from "@/manual/constants"
import { buildManualSearchIndexEntry } from "@/manual/search/buildManualSearchIndexEntry"
import type { ManualSearchIndexEntry } from "@/manual/search/types"
import { yieldToManualSearch } from "@/manual/search/yieldToManualSearch"
import type { Manual } from "@/manual/types"

/** Build the local search index in bounded phases that yield between main-thread tasks. */
export async function buildManualSearchIndexAsync(
  /** Complete structured manual */
  manual: Manual,
): Promise<ManualSearchIndexEntry[]> {
  await yieldToManualSearch()
  const entries: ManualSearchIndexEntry[] = []
  let workStartedAt = performance.now()

  for (const [sectionIndex, section] of manual.sections.entries()) {
    for (const [topicIndex, topic] of section.topics.entries()) {
      entries.push(buildManualSearchIndexEntry(section, sectionIndex, topic, topicIndex))
      if (performance.now() - workStartedAt >= MANUAL_SEARCH_TASK_BUDGET_MS) {
        await yieldToManualSearch()
        workStartedAt = performance.now()
      }
    }
  }

  return entries
}
