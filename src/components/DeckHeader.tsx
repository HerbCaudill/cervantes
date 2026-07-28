import { cn } from "@/lib/utils"
import { AppLink } from "@/navigation/AppLink"

/** App header: title, live counts, top-level destinations, and session action. */
export function DeckHeader({ dueCount, totalCount, activeDestination, inSession, onExit }: Props) {
  return (
    <header className="font-sans">
      <div className="border-ink flex min-h-11 items-center justify-between border-b-2 px-[0.9rem]">
        <h1 className="text-xs font-bold tracking-[0.18em] uppercase">Boletín CCSE</h1>
        <span className="font-mono text-[11px] tabular-nums">
          <span className={dueCount > 0 ? undefined : "text-faint"}>{dueCount} pend.</span>
          {" · "}
          {totalCount} banco
        </span>
      </div>
      <div className="border-rule flex min-h-11 items-stretch border-b px-[0.9rem]">
        <AppLink
          href="/"
          ariaCurrent={activeDestination === "practice" ? "page" : undefined}
          className={cn(
            "flex min-h-11 items-center pr-5 text-xs tracking-[0.11em] uppercase",
            activeDestination === "practice" ? "text-red border-red border-b-2" : "text-faint",
          )}
        >
          Práctica
        </AppLink>
        <AppLink
          href="/manual"
          ariaCurrent={activeDestination === "manual" ? "page" : undefined}
          className={cn(
            "flex min-h-11 items-center px-5 text-xs tracking-[0.11em] uppercase",
            activeDestination === "manual" ? "text-red border-red border-b-2" : "text-faint",
          )}
        >
          Manual
        </AppLink>
        {inSession && activeDestination === "practice" ?
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
  /** Top-level destination represented by the current route */
  activeDestination: "practice" | "manual"
  /** Whether a practice session is currently active */
  inSession: boolean
  /** Leave the active practice session */
  onExit: () => void
}
