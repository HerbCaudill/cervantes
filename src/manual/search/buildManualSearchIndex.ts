import { getManualBodyTextIndex } from "@/manual/getManualBodyTextIndex"
import { getManualTopicSlug } from "@/manual/getManualTopicSlug"
import { getVisibleManualBlocks } from "@/manual/getVisibleManualBlocks"
import { getManualBlockSearchSegments } from "@/manual/search/getManualBlockSearchSegments"
import { getManualSearchTokens } from "@/manual/search/getManualSearchTokens"
import { normalizeManualSearchText } from "@/manual/search/normalizeManualSearchText"
import type { ManualSearchIndexEntry } from "@/manual/search/types"
import type { Manual } from "@/manual/types"

/** Build one topic-level local search document for every manual topic. */
export function buildManualSearchIndex(
  /** Complete structured manual */
  manual: Manual,
): ManualSearchIndexEntry[] {
  const bodyTextIndex = getManualBodyTextIndex(manual)

  return manual.sections.flatMap((section, sectionIndex) =>
    section.topics.map((topic, topicIndex) => {
      const blocks = getVisibleManualBlocks(manual, topic.blocks, bodyTextIndex)
      const segments = [
        topic.title,
        section.title,
        ...blocks.flatMap(getManualBlockSearchSegments),
      ].filter(text => text.trim().length > 0)

      return {
        sectionId: section.id,
        sectionTitle: section.title,
        sectionNumber: sectionIndex + 1,
        topicId: topic.id,
        topicTitle: topic.title,
        topicNumber: topicIndex + 1,
        href: `/manual/${section.id}/${getManualTopicSlug(section, topic)}`,
        segments,
        normalizedTitle: normalizeManualSearchText(topic.title),
        normalizedTokens: getManualSearchTokens(segments.join(" ")).map(token => token.normalized),
      }
    }),
  )
}
