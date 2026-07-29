import { getManualBodyTextIndex } from "@/manual/getManualBodyTextIndex"
import { buildManualSearchIndexEntry } from "@/manual/search/buildManualSearchIndexEntry"
import type { ManualSearchIndexEntry } from "@/manual/search/types"
import type { Manual } from "@/manual/types"

/** Build one topic-level local search document for every manual topic. */
export function buildManualSearchIndex(
  /** Complete structured manual */
  manual: Manual,
): ManualSearchIndexEntry[] {
  const bodyTextIndex = getManualBodyTextIndex(manual)

  return manual.sections.flatMap((section, sectionIndex) =>
    section.topics.map((topic, topicIndex) =>
      buildManualSearchIndexEntry(manual, section, sectionIndex, topic, topicIndex, bodyTextIndex),
    ),
  )
}
