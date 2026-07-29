import { getManualTopicHref } from "@/manual/getManualTopicHref"
import { getManualBlockSearchSegments } from "@/manual/search/getManualBlockSearchSegments"
import { getManualSearchTokens } from "@/manual/search/getManualSearchTokens"
import { normalizeManualSearchText } from "@/manual/search/normalizeManualSearchText"
import type { ManualSearchIndexEntry } from "@/manual/search/types"
import type { ManualSection, ManualTopic } from "@/manual/types"

/** Build one topic-level local search document from a projected manual topic. */
export function buildManualSearchIndexEntry(
  /** Section that owns the topic */
  section: ManualSection,
  /** Zero-based section position */
  sectionIndex: number,
  /** Topic being indexed */
  topic: ManualTopic,
  /** Zero-based topic position */
  topicIndex: number,
): ManualSearchIndexEntry {
  const segments = [
    topic.title,
    section.title,
    ...topic.blocks.flatMap(getManualBlockSearchSegments),
  ].filter(text => text.trim().length > 0)

  return {
    sectionId: section.id,
    sectionTitle: section.title,
    sectionNumber: sectionIndex + 1,
    topicId: topic.id,
    topicTitle: topic.title,
    topicNumber: topicIndex + 1,
    href: getManualTopicHref(section, topic),
    segments,
    normalizedTitle: normalizeManualSearchText(topic.title),
    normalizedTokens: getManualSearchTokens(segments.join(" ")).map(token => token.normalized),
  }
}
