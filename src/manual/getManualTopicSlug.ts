import type { ManualSection, ManualTopic } from "@/manual/types"

/** Build a semantic, section-unique public slug without exposing internal source-page IDs. */
export function getManualTopicSlug(
  /** Section that owns the topic */
  section: ManualSection,
  /** Topic whose public slug is requested */
  topic: ManualTopic,
): string {
  const topicIndex = section.topics.findIndex(candidate => candidate.id === topic.id)
  if (topicIndex === -1) throw new Error(`Topic "${topic.id}" does not belong to "${section.id}"`)

  const titleSlug =
    topic.title
      .normalize("NFD")
      .replace(/\p{Diacritic}/gu, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "tema"
  const position = String(topicIndex + 1).padStart(2, "0")

  return `${titleSlug}-${position}`
}
