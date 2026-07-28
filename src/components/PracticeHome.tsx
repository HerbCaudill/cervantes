import { ManualProgress } from "@/components/ManualProgress"
import { SectionStatsTable } from "@/components/SectionStatsTable"
import type { Manual } from "@/manual/types"
import type { ReaderState } from "@/reader/types"
import type { SectionStats } from "@/types"

/** Resting practice screen shown before a session and after its queue empties. */
export function PracticeHome({ stats, dueCount, manual, readerState, resumePath, onStart }: Props) {
  const questionLabel = dueCount === 1 ? "pregunta" : "preguntas"

  return (
    <div className="flex flex-1 flex-col">
      <div className="flex flex-col gap-[0.85rem] px-[0.9rem] py-[0.85rem]">
        <SectionStatsTable stats={stats} />
        <ManualProgress manual={manual} readerState={readerState} resumePath={resumePath} />
      </div>
      <button
        type="button"
        disabled={dueCount === 0}
        onClick={onStart}
        className="bg-ink text-paper sticky bottom-0 z-10 mt-auto min-h-14 w-full px-[0.9rem] font-sans text-xs font-bold tracking-[0.1em] uppercase disabled:cursor-not-allowed disabled:opacity-50"
      >
        {dueCount > 0 ?
          `Empezar repaso · ${dueCount} ${questionLabel}`
        : "No hay preguntas pendientes"}
      </button>
    </div>
  )
}

interface Props {
  /** Bank status grouped by section */
  stats: SectionStats[]
  /** Questions currently available to start */
  dueCount: number
  /** Structured manual summarized in the reading section */
  manual: Manual
  /** Current local manual-reading progress */
  readerState: ReaderState
  /** Route for continuing the most recently opened topic */
  resumePath: string | null
  /** Start a session from the current due queue */
  onStart: () => void
}
