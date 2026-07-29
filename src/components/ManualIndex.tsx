import { AppLink } from "@/navigation/AppLink"
import { getManualTopicHref } from "@/manual/getManualTopicHref"
import type { Manual } from "@/manual/types"
import { getManualSectionProgress } from "@/reader/getManualSectionProgress"
import type { ReaderState } from "@/reader/types"

/** Manual landing page with direct routes to all five tasks and every extracted topic. */
export function ManualIndex({ manual, readerState, resumePath }: Props) {
  return (
    <div className="flex flex-col px-[0.9rem] py-[0.85rem]">
      <div className="border-rule-hard flex min-h-11 items-center border-b">
        <h2 className="font-serif text-[23px] leading-[1.12] font-bold text-balance">
          Manual CCSE
        </h2>
      </div>
      {resumePath ?
        <AppLink
          href={resumePath}
          restoreScroll
          className="text-soft border-rule-hard flex min-h-11 items-center justify-between border-b font-sans text-xs tracking-[0.08em] uppercase"
        >
          <span>Seguir leyendo</span>
          <span aria-hidden="true">→</span>
        </AppLink>
      : null}
      <nav aria-label="Índice completo del manual">
        <ol>
          {manual.sections.map((section, index) => {
            const progress = getManualSectionProgress(section, readerState)

            return (
              <li key={section.id} className="border-rule border-b">
                <details open>
                  <summary className="grid min-h-14 cursor-pointer list-none grid-cols-[2.5rem_1fr_auto] items-center gap-[0.6rem] [&::-webkit-details-marker]:hidden">
                    <span className="text-red font-mono text-[10.5px] tabular-nums">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <span className="font-serif text-base">{section.title}</span>
                    <span className="flex flex-col items-end gap-0.5">
                      <span className="text-soft font-mono text-[10px]">{progress} %</span>
                      <span className="text-soft font-sans text-[10px] tracking-[0.08em] uppercase">
                        {section.topics.length} temas
                      </span>
                    </span>
                  </summary>
                  <span className="bg-rule relative block h-px w-full">
                    <span
                      className="bg-ink absolute inset-y-0 left-0"
                      style={{ width: `${progress}%` }}
                    />
                  </span>
                  <ol className="ml-[3.1rem]">
                    {section.topics.map((topic, topicIndex) => (
                      <li key={topic.id} className="border-rule border-b last:border-b-0">
                        <AppLink
                          href={getManualTopicHref(section, topic)}
                          className="grid min-h-11 grid-cols-[2.5rem_1fr] items-center gap-[0.6rem] py-1"
                        >
                          <span className="text-soft font-mono text-[10px] tabular-nums">
                            {String(topicIndex + 1).padStart(2, "0")}
                          </span>
                          <span className="font-serif text-sm">{topic.title}</span>
                        </AppLink>
                      </li>
                    ))}
                  </ol>
                </details>
              </li>
            )
          })}
        </ol>
      </nav>
    </div>
  )
}

interface Props {
  /** Structured manual whose section metadata supplies the route index */
  manual: Manual
  /** Current local reader state */
  readerState: ReaderState
  /** Route for the most recently opened valid topic */
  resumePath: string | null
}
