import { AppLink } from "@/navigation/AppLink"
import { getManualTopicSlug } from "@/manual/getManualTopicSlug"
import type { Manual } from "@/manual/types"

/** Manual landing page with direct routes to all five tasks and every extracted topic. */
export function ManualIndex({ manual }: Props) {
  return (
    <div className="flex flex-col px-[0.9rem] py-[0.85rem]">
      <div className="border-rule-hard flex min-h-11 items-center justify-between border-b">
        <h2 className="font-serif text-[23px] leading-[1.12] font-bold text-balance">
          Manual CCSE
        </h2>
        <AppLink
          href="/manual/buscar"
          className="text-soft flex min-h-11 items-center font-sans text-xs tracking-[0.08em] uppercase"
        >
          Buscar en el manual
        </AppLink>
      </div>
      <nav aria-label="Índice completo del manual">
        <ol>
          {manual.sections.map((section, index) => (
            <li key={section.id} className="border-rule border-b">
              <details open={index === 0}>
                <summary className="grid min-h-14 cursor-pointer list-none grid-cols-[2.5rem_1fr_auto] items-center gap-[0.6rem] [&::-webkit-details-marker]:hidden">
                  <span className="text-red font-mono text-[10.5px] tabular-nums">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span className="font-serif text-base">{section.title}</span>
                  <span className="text-soft font-sans text-[10px] tracking-[0.08em] uppercase">
                    {section.topics.length} temas
                  </span>
                </summary>
                <AppLink
                  href={`/manual/${section.id}`}
                  className="border-rule-hard ml-[3.1rem] flex min-h-11 items-center border-y font-sans text-[10px] tracking-[0.08em] uppercase"
                >
                  Índice de la Tarea {index + 1} →
                </AppLink>
                <ol className="ml-[3.1rem]">
                  {section.topics.map((topic, topicIndex) => (
                    <li key={topic.id} className="border-rule border-b last:border-b-0">
                      <AppLink
                        href={`/manual/${section.id}/${getManualTopicSlug(section, topic)}`}
                        className="grid min-h-11 grid-cols-[2.5rem_1fr] items-center gap-[0.6rem] py-1"
                      >
                        <span className="text-faint font-mono text-[10px] tabular-nums">
                          {String(topicIndex + 1).padStart(2, "0")}
                        </span>
                        <span className="font-serif text-sm">{topic.title}</span>
                      </AppLink>
                    </li>
                  ))}
                </ol>
              </details>
            </li>
          ))}
        </ol>
      </nav>
    </div>
  )
}

interface Props {
  /** Structured manual whose section metadata supplies the route index */
  manual: Manual
}
