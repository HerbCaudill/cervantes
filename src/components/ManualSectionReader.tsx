import { ManualTopicSection } from "@/components/ManualTopicSection"
import { getManualTopicHref } from "@/manual/getManualTopicHref"
import type { Manual, ManualSection } from "@/manual/types"
import { AppLink } from "@/navigation/AppLink"
import { getManualSectionProgress } from "@/reader/getManualSectionProgress"
import type { ReaderState } from "@/reader/types"

/** Continuous source-order reader for one complete manual tarea. */
export function ManualSectionReader({ manual, section, sectionNumber, readerState }: Props) {
  const progress = getManualSectionProgress(section, readerState)

  return (
    <article className="flex min-w-0 flex-col" data-reader-section={section.id}>
      <div className="border-rule-hard flex min-h-11 items-center justify-between border-b px-[0.9rem]">
        <AppLink
          href="/manual"
          className="text-soft flex min-h-11 items-center font-sans text-xs tracking-[0.08em] uppercase"
        >
          ← Índice del manual
        </AppLink>
        <span className="shrink-0 pl-2 font-mono text-[10.5px] tabular-nums">
          Tarea {sectionNumber}
        </span>
      </div>
      <div
        className="bg-rule h-px w-full"
        role="progressbar"
        aria-label={`Progreso de la Tarea ${sectionNumber}`}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={progress}
      >
        <span className="bg-red block h-px" style={{ width: `${progress}%` }} />
      </div>
      <div className="flex flex-col px-[0.9rem] py-[0.85rem]">
        <h1 className="border-rule-hard border-b pb-[0.85rem] font-serif text-[25px] leading-[1.12] font-bold text-balance">
          {section.title}
        </h1>
        <nav
          aria-label={`Temas de la Tarea ${sectionNumber}`}
          className="border-rule-hard border-b py-[0.5rem]"
        >
          <ol>
            {section.topics.map((topic, topicIndex) => (
              <li key={topic.id}>
                <AppLink
                  href={getManualTopicHref(section, topic)}
                  className="grid min-h-11 grid-cols-[2.5rem_1fr] items-center gap-[0.6rem]"
                >
                  <span className="text-soft font-mono text-[10px] tabular-nums">
                    {String(topicIndex + 1).padStart(2, "0")}
                  </span>
                  <span className="font-serif text-sm">{topic.title}</span>
                </AppLink>
              </li>
            ))}
          </ol>
        </nav>
        <div className="flex flex-col gap-[1.4rem] pt-[1.4rem]">
          {section.topics.map((topic, topicIndex) => (
            <ManualTopicSection
              key={topic.id}
              assets={manual.assets}
              section={section}
              topic={topic}
              topicNumber={topicIndex + 1}
            />
          ))}
        </div>
      </div>
    </article>
  )
}

interface Props {
  /** Complete manual supplying shared assets */
  manual: Manual
  /** Tarea rendered as one document */
  section: ManualSection
  /** One-based tarea position */
  sectionNumber: number
  /** Current local reader state */
  readerState: ReaderState
}
