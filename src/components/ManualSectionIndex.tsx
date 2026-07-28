import type { ManualSection } from "@/manual/types"
import { getManualTopicSlug } from "@/manual/getManualTopicSlug"
import { AppLink } from "@/navigation/AppLink"
import { getManualSectionProgress } from "@/reader/getManualSectionProgress"
import type { ReaderState } from "@/reader/types"

/** Task index with a stable route for each manual topic. */
export function ManualSectionIndex({ section, sectionNumber, readerState }: Props) {
  const progress = getManualSectionProgress(section, readerState)

  return (
    <div className="flex flex-col px-[0.9rem] py-[0.85rem]">
      <AppLink
        href="/manual"
        className="text-soft flex min-h-11 items-center font-sans text-xs tracking-[0.08em] uppercase"
      >
        ← Índice del manual
      </AppLink>
      <p className="section-label border-rule-hard flex justify-between border-b pb-2">
        <span>Tarea {sectionNumber}</span>
        <span className="font-mono tracking-normal">{progress} % leído</span>
      </p>
      <h2 className="border-rule-hard border-b py-[0.85rem] font-serif text-[23px] leading-[1.12] font-bold text-balance">
        {section.title}
      </h2>
      <nav aria-label={`Temas de la tarea ${sectionNumber}`}>
        <ol>
          {section.topics.map((topic, index) => (
            <li key={topic.id} className="border-rule border-b">
              <AppLink
                href={`/manual/${section.id}/${getManualTopicSlug(section, topic)}`}
                restoreScroll
                className="grid min-h-14 grid-cols-[2.5rem_1fr] items-center gap-[0.6rem]"
              >
                <span className="text-red font-mono text-[10.5px] tabular-nums">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span className="font-serif text-base">{topic.title}</span>
              </AppLink>
            </li>
          ))}
        </ol>
      </nav>
    </div>
  )
}

interface Props {
  /** Manual task shown by this index */
  section: ManualSection
  /** One-based task number */
  sectionNumber: number
  /** Current local reader state */
  readerState: ReaderState
}
