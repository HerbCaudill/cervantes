import { ManualIndex } from "@/components/ManualIndex"
import { ManualNotFound } from "@/components/ManualNotFound"
import { ManualSearch } from "@/components/ManualSearch"
import { ManualSectionIndex } from "@/components/ManualSectionIndex"
import { ManualTopicShell } from "@/components/ManualTopicShell"
import type { Manual } from "@/manual/types"
import type { AppRoute } from "@/navigation/types"

/** Resolve a manual route against structured content and render its route shell. */
export function ManualScreen({ manual, route }: Props) {
  if (route.type === "manual-index") return <ManualIndex manual={manual} />
  if (route.type === "manual-search") return <ManualSearch />
  if (route.type === "not-found" || route.type === "practice") return <ManualNotFound />

  const section = manual.sections.find(candidate => candidate.id === route.sectionId)
  if (!section) return <ManualNotFound />

  const sectionNumber = manual.sections.indexOf(section) + 1
  if (route.type === "manual-section") {
    return <ManualSectionIndex section={section} sectionNumber={sectionNumber} />
  }

  const topic = section.topics.find(candidate => candidate.id === route.topicId)
  if (!topic) return <ManualNotFound />

  return (
    <ManualTopicShell
      section={section}
      topic={topic}
      sectionNumber={sectionNumber}
      topicNumber={section.topics.indexOf(topic) + 1}
    />
  )
}

interface Props {
  /** Structured manual used to resolve stable section and topic IDs */
  manual: Manual
  /** Current manual route */
  route: AppRoute
}
