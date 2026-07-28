import type { ManualSection, ManualTopic } from "@/manual/types"
import { AppLink } from "@/navigation/AppLink"

/** Deep-linkable topic shell reserved for the full reader implementation. */
export function ManualTopicShell({ section, topic, sectionNumber, topicNumber }: Props) {
  return (
    <article className="flex flex-col px-[0.9rem] py-[0.85rem]">
      <div className="border-rule-hard flex min-h-11 items-center justify-between border-b">
        <AppLink
          href={`/manual/${section.id}`}
          className="text-soft flex min-h-11 items-center font-sans text-xs tracking-[0.08em] uppercase"
        >
          ← Tarea {sectionNumber}
        </AppLink>
        <span className="font-mono text-[10.5px] tabular-nums">
          T{sectionNumber} · {String(topicNumber).padStart(2, "0")}
        </span>
      </div>
      <h2 className="border-rule-hard py-[0.85rem] font-serif text-[23px] leading-[1.12] font-bold text-balance">
        {topic.title}
      </h2>
      <p className="text-soft border-rule border-y py-[0.85rem] font-serif text-[17px] leading-[1.5]">
        El contenido de este tema estará disponible en el lector del manual.
      </p>
    </article>
  )
}

interface Props {
  /** Parent manual task */
  section: ManualSection
  /** Topic selected by the route */
  topic: ManualTopic
  /** One-based task number */
  sectionNumber: number
  /** One-based topic number */
  topicNumber: number
}
