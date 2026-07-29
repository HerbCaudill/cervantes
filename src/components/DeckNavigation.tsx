import { cn } from "@/lib/utils"
import { AppLink } from "@/navigation/AppLink"

/** Top-level destinations and contextual session action. */
export function DeckNavigation({ activeDestination, inSession, onExit }: Props) {
  return (
    <nav
      aria-label="Principal"
      className="border-rule flex min-h-11 items-stretch border-b px-[0.9rem] font-sans"
    >
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
    </nav>
  )
}

interface Props {
  /** Top-level destination represented by the current route */
  activeDestination: "practice" | "manual"
  /** Whether a practice session is currently active */
  inSession: boolean
  /** Leave the active practice session */
  onExit: () => void
}
