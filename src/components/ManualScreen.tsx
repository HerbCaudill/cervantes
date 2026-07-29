import { ManualIndex } from "@/components/ManualIndex"
import { ManualNotFound } from "@/components/ManualNotFound"
import { ManualSearch } from "@/components/ManualSearch"
import { ManualTopicShell } from "@/components/ManualTopicShell"
import { findManualTopicBySlug } from "@/manual/findManualTopicBySlug"
import type { Manual } from "@/manual/types"
import type { AppRoute } from "@/navigation/types"
import type { ReaderState } from "@/reader/types"

/** Resolve a manual route against structured content and render its route shell. */
export function ManualScreen({ manual, route, readerState, resumePath }: Props) {
  if (route.type === "manual-index") {
    return <ManualIndex manual={manual} readerState={readerState} resumePath={resumePath} />
  }
  if (route.type === "manual-search") return <ManualSearch manual={manual} query={route.query} />
  if (route.type === "not-found" || route.type === "practice") return <ManualNotFound />

  const section = manual.sections.find(candidate => candidate.id === route.sectionId)
  if (!section) return <ManualNotFound />

  const sectionNumber = manual.sections.indexOf(section) + 1
  const topic = findManualTopicBySlug(section, route.topicSlug)
  if (!topic) return <ManualNotFound />

  return (
    <ManualTopicShell
      manual={manual}
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
  /** Current local reader state */
  readerState: ReaderState
  /** Route for the most recently opened valid topic */
  resumePath: string | null
}
