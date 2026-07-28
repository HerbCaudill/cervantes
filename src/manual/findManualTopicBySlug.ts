import { getManualTopicSlug } from "@/manual/getManualTopicSlug"
import type { ManualSection, ManualTopic } from "@/manual/types"

/** Resolve one public topic slug within its parent section. */
export function findManualTopicBySlug(
  /** Section selected by the public route */
  section: ManualSection,
  /** Semantic public topic slug */
  topicSlug: string,
): ManualTopic | undefined {
  return section.topics.find(topic => getManualTopicSlug(section, topic) === topicSlug)
}
