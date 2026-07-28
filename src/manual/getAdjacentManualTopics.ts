import type { Manual, ManualSection, ManualTopic } from "@/manual/types"

/** Find the source-order neighbors of a topic, including across task boundaries. */
export function getAdjacentManualTopics(
  /** Complete manual containing the topic */
  manual: Manual,
  /** Stable topic ID whose neighbors are requested */
  topicId: string,
): AdjacentManualTopics {
  const locations = manual.sections.flatMap(section =>
    section.topics.map(topic => ({ section, topic })),
  )
  const topicIndex = locations.findIndex(location => location.topic.id === topicId)

  if (topicIndex === -1) return { previous: null, next: null }

  return {
    previous: locations[topicIndex - 1] ?? null,
    next: locations[topicIndex + 1] ?? null,
  }
}

/** A topic paired with its parent task for route construction. */
export interface ManualTopicLocation {
  /** Parent manual task */
  section: ManualSection
  /** Topic at this location */
  topic: ManualTopic
}

/** Source-order neighbors around one manual topic. */
export interface AdjacentManualTopics {
  /** Topic immediately before the requested topic */
  previous: ManualTopicLocation | null
  /** Topic immediately after the requested topic */
  next: ManualTopicLocation | null
}
