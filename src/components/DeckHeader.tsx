/** App header: title and a live count of questions due versus the bank total. */
export function DeckHeader({ dueCount, totalCount, inSession, onExit }: Props) {
  return (
    <header className="font-sans">
      <div className="border-ink flex min-h-11 items-center justify-between border-b-2 px-[0.9rem]">
        <h1 className="text-xs font-bold tracking-[0.18em] uppercase">Boletín CCSE</h1>
        <span className="font-mono text-[11px] tabular-nums">
          <span className={dueCount > 0 ? "text-red" : "text-faint"}>{dueCount} pend.</span>
          {" · "}
          {totalCount} banco
        </span>
      </div>
      <div className="border-rule flex min-h-11 items-stretch border-b px-[0.9rem]">
        <button
          type="button"
          aria-current="page"
          className="text-red border-red min-h-11 border-b-2 pr-5 text-xs tracking-[0.11em] uppercase"
        >
          Práctica
        </button>
        <button
          type="button"
          disabled
          className="text-faint min-h-11 px-5 text-xs tracking-[0.11em] uppercase disabled:cursor-not-allowed"
        >
          Manual
        </button>
        {inSession ?
          <button
            type="button"
            onClick={onExit}
            className="text-soft ml-auto min-h-11 pl-5 text-xs tracking-[0.11em] uppercase"
          >
            Salir
          </button>
        : null}
      </div>
    </header>
  )
}

interface Props {
  /** Number of questions currently due for review */
  dueCount: number
  /** Total number of questions in the bank */
  totalCount: number
  /** Whether a practice session is currently active */
  inSession: boolean
  /** Leave the active practice session */
  onExit: () => void
}
