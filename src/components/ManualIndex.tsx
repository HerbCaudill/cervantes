import { AppLink } from "@/navigation/AppLink"
import type { Manual } from "@/manual/types"

/** Manual landing page with routes to every official task and local search. */
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
      <ol>
        {manual.sections.map((section, index) => (
          <li key={section.id} className="border-rule border-b">
            <AppLink
              href={`/manual/${section.id}`}
              className="grid min-h-14 grid-cols-[2.5rem_1fr_auto] items-center gap-[0.6rem]"
            >
              <span className="text-red font-mono text-[10.5px] tabular-nums">
                {String(index + 1).padStart(2, "0")}
              </span>
              <span className="font-serif text-base">{section.title}</span>
              <span className="text-soft font-sans text-xs tracking-[0.08em] uppercase">
                Tarea {index + 1}
              </span>
            </AppLink>
          </li>
        ))}
      </ol>
    </div>
  )
}

interface Props {
  /** Structured manual whose section metadata supplies the route index */
  manual: Manual
}
