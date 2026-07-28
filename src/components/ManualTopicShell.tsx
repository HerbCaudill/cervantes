import { ManualBlockList } from "@/components/ManualBlockList"
import { ManualMarginLayout } from "@/components/ManualMarginLayout"
import { getAdjacentManualTopics } from "@/manual/getAdjacentManualTopics"
import { getVisibleManualBlocks } from "@/manual/getVisibleManualBlocks"
import { getManualMarginNote } from "@/manual/getManualMarginNote"
import { getManualTopicSlug } from "@/manual/getManualTopicSlug"
import type { Manual, ManualSection, ManualTopic } from "@/manual/types"
import { AppLink } from "@/navigation/AppLink"

/** Complete deep-linkable reader page for one official manual topic. */
export function ManualTopicShell({ manual, section, topic, sectionNumber, topicNumber }: Props) {
  const adjacent = getAdjacentManualTopics(manual, topic.id)
  const topics = manual.sections.flatMap(candidate => candidate.topics)
  const topicPosition = topics.findIndex(candidate => candidate.id === topic.id) + 1
  const progress = Math.round((topicPosition / topics.length) * 100)
  const sourceBlocks =
    topic.blocks[0]?.type === "heading" && topic.blocks[0].text === topic.title ?
      topic.blocks.slice(1)
    : topic.blocks
  const blocks = getVisibleManualBlocks(manual, sourceBlocks)

  return (
    <article className="flex min-w-0 flex-col" data-reader-topic={topic.id}>
      <div className="border-rule-hard flex min-h-11 items-center justify-between border-b px-[0.9rem]">
        <AppLink
          href={`/manual/${section.id}`}
          className="text-soft flex min-h-11 items-center font-sans text-xs tracking-[0.08em] uppercase"
        >
          ← Tarea {sectionNumber}
        </AppLink>
        <span
          className="max-w-[55%] truncate text-right font-sans text-[10px] tracking-[0.08em] uppercase"
          title={section.title}
        >
          {section.title}
        </span>
        <span className="shrink-0 pl-2 font-mono text-[10.5px] tabular-nums">
          T{sectionNumber} · {String(topicNumber).padStart(2, "0")}
        </span>
      </div>
      <div
        className="bg-rule h-px w-full"
        role="progressbar"
        aria-label="Progreso en el manual"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={progress}
      >
        <span className="bg-red block h-px" style={{ width: `${progress}%` }} />
      </div>
      <div className="flex flex-col gap-[0.85rem] px-[0.9rem] py-[0.85rem]">
        <ManualMarginLayout note={getManualMarginNote(topic.title)}>
          <h2 className="border-rule-hard border-b pb-[0.85rem] font-serif text-[23px] leading-[1.12] font-bold text-balance">
            {topic.title}
          </h2>
        </ManualMarginLayout>
        <ManualBlockList blocks={blocks} assets={manual.assets} />
        <p className="text-soft border-rule-hard border-t pt-[0.85rem] font-sans text-[11px] leading-[1.4]">
          <a
            href={manual.sourceUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex min-h-11 items-center underline underline-offset-4"
          >
            Fuente oficial · Instituto Cervantes · {manual.edition}
          </a>
        </p>
        <nav
          aria-label="Temas anterior y siguiente"
          className="border-rule-hard grid grid-cols-2 border-y font-sans text-xs"
        >
          {adjacent.previous ?
            <AppLink
              href={`/manual/${adjacent.previous.section.id}/${getManualTopicSlug(
                adjacent.previous.section,
                adjacent.previous.topic,
              )}`}
              className="border-rule flex min-h-14 min-w-0 flex-col justify-center border-r pr-3"
            >
              <span className="text-soft tracking-[0.08em] uppercase">‹ Anterior</span>
              <span className="truncate font-serif text-sm">{adjacent.previous.topic.title}</span>
            </AppLink>
          : <span aria-hidden="true" />}
          {adjacent.next ?
            <AppLink
              href={`/manual/${adjacent.next.section.id}/${getManualTopicSlug(
                adjacent.next.section,
                adjacent.next.topic,
              )}`}
              className="flex min-h-14 min-w-0 flex-col justify-center pl-3 text-right"
            >
              <span className="text-soft tracking-[0.08em] uppercase">Siguiente ›</span>
              <span className="truncate font-serif text-sm">{adjacent.next.topic.title}</span>
            </AppLink>
          : <span aria-hidden="true" />}
        </nav>
      </div>
    </article>
  )
}

interface Props {
  /** Complete manual used for assets and cross-task navigation */
  manual: Manual
  /** Parent manual task */
  section: ManualSection
  /** Topic selected by the route */
  topic: ManualTopic
  /** One-based task number */
  sectionNumber: number
  /** One-based topic number */
  topicNumber: number
}
