import { SectionStatsTable } from "@/components/SectionStatsTable"
import type { SectionStats } from "@/types"

/** Resting practice screen shown before a session and after its queue empties. */
export function PracticeHome({ stats, dueCount, onStart }: Props) {
  return (
    <div className="flex flex-1 flex-col">
      <div className="flex flex-1 items-center justify-center px-[0.9rem]">
        <button
          type="button"
          disabled={dueCount === 0}
          onClick={onStart}
          className="bg-ink text-paper min-h-14 px-8 font-sans text-xs font-bold tracking-[0.1em] uppercase disabled:cursor-not-allowed disabled:opacity-50"
        >
          {dueCount > 0 ? "Empezar repaso" : "No hay preguntas pendientes"}
        </button>
      </div>
      <div className="px-[0.9rem] pb-[0.85rem]">
        <SectionStatsTable stats={stats} />
      </div>
    </div>
  )
}

interface Props {
  /** Bank status grouped by section */
  stats: SectionStats[]
  /** Questions currently available to start */
  dueCount: number
  /** Start a session from the current due queue */
  onStart: () => void
}
