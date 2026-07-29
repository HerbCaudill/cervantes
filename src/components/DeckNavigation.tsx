import { IconSearch } from "@tabler/icons-react"
import { cn } from "@/lib/utils"
import { AppLink } from "@/navigation/AppLink"

/** Top-level destinations and manual search. */
export function DeckNavigation({ activeDestination }: Props) {
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
      <AppLink
        href="/manual/buscar"
        ariaLabel="Buscar en el manual"
        className="text-soft ml-auto flex min-h-11 min-w-11 items-center justify-center"
      >
        <IconSearch aria-hidden="true" size={20} stroke={1.6} />
      </AppLink>
    </nav>
  )
}

interface Props {
  /** Top-level destination represented by the current route */
  activeDestination: "practice" | "manual"
}
