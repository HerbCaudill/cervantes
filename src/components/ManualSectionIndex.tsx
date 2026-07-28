import type { ManualSection } from "@/manual/types"
import { AppLink } from "@/navigation/AppLink"

/** Task index with a stable route for each manual topic. */
export function ManualSectionIndex({ section, sectionNumber }: Props) {
  return (
    <div className="flex flex-col px-[0.9rem] py-[0.85rem]">
      <AppLink
        href="/manual"
        className="text-soft flex min-h-11 items-center font-sans text-xs tracking-[0.08em] uppercase"
      >
        ← Índice del manual
      </AppLink>
      <p className="section-label border-rule-hard border-b pb-2">Tarea {sectionNumber}</p>
      <h2 className="border-rule-hard border-b py-[0.85rem] font-serif text-[23px] leading-[1.12] font-bold text-balance">
        {section.title}
      </h2>
      <ol>
        {section.topics.map((topic, index) => (
          <li key={topic.id} className="border-rule border-b">
            <AppLink
              href={`/manual/${section.id}/${topic.id}`}
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
    </div>
  )
}

interface Props {
  /** Manual task shown by this index */
  section: ManualSection
  /** One-based task number */
  sectionNumber: number
}
