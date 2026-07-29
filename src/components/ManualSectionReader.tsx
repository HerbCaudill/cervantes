import { IconArrowLeft, IconArrowRight } from "@tabler/icons-react"
import { ManualTopicSection } from "@/components/ManualTopicSection"
import { getManualTopicHref } from "@/manual/getManualTopicHref"
import type { Manual, ManualSection } from "@/manual/types"
import { AppLink } from "@/navigation/AppLink"
import { getManualSectionProgress } from "@/reader/getManualSectionProgress"
import type { ReaderState } from "@/reader/types"

/** Continuous source-order reader for one complete manual tarea. */
export function ManualSectionReader({ manual, section, sectionNumber, readerState }: Props) {
  const progress = getManualSectionProgress(section, readerState)
  const previousSection = manual.sections[sectionNumber - 2]
  const nextSection = manual.sections[sectionNumber]

  return (
    <article className="flex min-w-0 flex-col" data-reader-section={section.id}>
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
        <span className="text-red pb-1 font-sans text-[11px] font-medium tracking-[0.08em]">
          Tarea {sectionNumber}
        </span>
        <h1 className="border-rule-hard border-b pb-[0.85rem] font-serif text-[25px] leading-[1.12] font-bold text-balance">
          {section.title}
        </h1>
        <nav
          aria-label={`Temas de la Tarea ${sectionNumber}`}
          className="border-rule-hard border-b py-[0.2rem]"
        >
          <ol>
            {section.topics.map((topic, topicIndex) => (
              <li key={topic.id}>
                <AppLink
                  href={getManualTopicHref(section, topic)}
                  className="grid grid-cols-[2.5rem_1fr] items-center gap-[0.6rem] py-[0.2rem]"
                >
                  <span className="text-soft font-mono text-[10px] tabular-nums">
                    {String(topicIndex + 1).padStart(2, "0")}
                  </span>
                  <span className="font-serif text-xs">{topic.title}</span>
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
        <nav
          aria-label="Tareas anterior y siguiente"
          className="border-rule-hard mt-[1.4rem] grid grid-cols-2 border-t pt-[0.85rem]"
        >
          {previousSection ?
            <AppLink
              href={`/manual/${previousSection.id}`}
              ariaLabel={`Tarea anterior: Tarea ${sectionNumber - 1}, ${previousSection.title}`}
              className="text-soft flex min-w-0 flex-col items-start gap-0.5 pr-2"
            >
              <span className="text-red flex items-center gap-1 font-sans text-[10px] tracking-[0.08em] uppercase">
                <IconArrowLeft aria-hidden="true" size={14} stroke={1.5} />
                Anterior
              </span>
              <span className="font-serif text-sm leading-tight">Tarea {sectionNumber - 1}</span>
              <span className="text-faint font-sans text-[10px] leading-tight">
                {previousSection.title}
              </span>
            </AppLink>
          : <span aria-hidden="true" />}
          {nextSection ?
            <AppLink
              href={`/manual/${nextSection.id}`}
              ariaLabel={`Tarea siguiente: Tarea ${sectionNumber + 1}, ${nextSection.title}`}
              className="text-soft flex min-w-0 flex-col items-end gap-0.5 pl-2 text-right"
            >
              <span className="text-red flex items-center gap-1 font-sans text-[10px] tracking-[0.08em] uppercase">
                Siguiente
                <IconArrowRight aria-hidden="true" size={14} stroke={1.5} />
              </span>
              <span className="font-serif text-sm leading-tight">Tarea {sectionNumber + 1}</span>
              <span className="text-faint font-sans text-[10px] leading-tight">
                {nextSection.title}
              </span>
            </AppLink>
          : null}
        </nav>
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
