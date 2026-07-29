import { buildManualSearchIndexEntry } from "@/manual/search/buildManualSearchIndexEntry"
import type { ManualSearchIndexEntry } from "@/manual/search/types"
import type { Manual } from "@/manual/types"

/** Build one topic-level local search document for every manual topic. */
export function buildManualSearchIndex(
  /** Complete structured manual */
  manual: Manual,
): ManualSearchIndexEntry[] {
  return manual.sections.flatMap((section, sectionIndex) =>
    section.topics.map((topic, topicIndex) =>
      buildManualSearchIndexEntry(section, sectionIndex, topic, topicIndex),
    ),
  )
}
