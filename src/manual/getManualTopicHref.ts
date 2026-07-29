import { getManualTopicSlug } from "@/manual/getManualTopicSlug"
import type { ManualSection, ManualTopic } from "@/manual/types"

/** Build the public anchored reader URL for one manual topic. */
export function getManualTopicHref(
  /** Section that owns the topic */
  section: ManualSection,
  /** Topic whose URL is requested */
  topic: ManualTopic,
): string {
  return `/manual/${section.id}#${getManualTopicSlug(section, topic)}`
}
