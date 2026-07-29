import type { Manual } from "@/manual/types"
import { getManualSectionProgress } from "@/reader/getManualSectionProgress"
import type { ReaderState } from "@/reader/types"

/** Automatic manual-reading summary shown on the resting practice screen. */
export function ManualProgress({ manual, readerState }: Props) {
  return (
    <section aria-labelledby="reading-heading">
      <h2 id="reading-heading" className="section-label border-rule-hard border-b pb-2">
        Lectura del manual
      </h2>
      <div>
        {manual.sections.map((section, index) => {
          const progress = getManualSectionProgress(section, readerState)

          return (
            <div key={section.id} className="relative flex min-h-11 items-center justify-between">
              <span className="font-serif text-sm">Tarea {index + 1}</span>
              <span className="text-faint font-mono text-[11px]">{progress} %</span>
              <span className="bg-rule absolute inset-x-0 bottom-0 h-px" />
              <span
                className="bg-ink absolute bottom-0 left-0 h-px"
                style={{ width: `${progress}%` }}
              />
            </div>
          )
        })}
      </div>
    </section>
  )
}

interface Props {
  /** Current structured manual */
  manual: Manual
  /** Current local reading progress */
  readerState: ReaderState
}
