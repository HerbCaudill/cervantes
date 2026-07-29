import { useEffect, useRef, useState } from "react"
import type { FormEvent } from "react"
import { IconSearch } from "@tabler/icons-react"
import { cn } from "@/lib/utils"
import { AppLink } from "@/navigation/AppLink"
import { navigate } from "@/navigation/navigate"

/** Top-level destinations and manual search. */
export function DeckNavigation({ activeDestination, searchQuery }: Props) {
  const [searchDraft, setSearchDraft] = useState(searchQuery ?? "")
  const searchInputRef = useRef<HTMLInputElement>(null)
  const searchIsOpen = searchQuery !== null

  useEffect(() => {
    if (searchQuery === null) return
    setSearchDraft(searchQuery)
    searchInputRef.current?.focus()
  }, [searchQuery])

  /** Route a normalized header query to the manual search screen. */
  const handleSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const submittedQuery = searchDraft.trim().replace(/\s+/g, " ")
    if (!submittedQuery) {
      navigate("/manual/buscar")
      return
    }

    const parameters = new URLSearchParams({ q: submittedQuery })
    navigate(`/manual/buscar?${parameters}`)
  }

  return (
    <nav
      aria-label="Principal"
      className="bg-paper border-rule sticky top-0 z-20 flex min-h-11 items-stretch border-b px-[0.9rem] font-sans"
    >
      <AppLink
        href="/"
        ariaCurrent={activeDestination === "practice" ? "page" : undefined}
        className={cn(
          "flex min-h-11 items-center pr-5 text-xs tracking-[0.11em] uppercase",
          activeDestination === "practice" ? "text-red border-red border-t-[3px]" : "text-faint",
        )}
      >
        Práctica
      </AppLink>
      <AppLink
        href="/manual"
        ariaCurrent={activeDestination === "manual" ? "page" : undefined}
        className={cn(
          "flex min-h-11 items-center px-5 text-xs tracking-[0.11em] uppercase",
          activeDestination === "manual" ? "text-red border-red border-t-[3px]" : "text-faint",
        )}
      >
        Manual
      </AppLink>
      <form
        role="search"
        onSubmit={handleSearch}
        className={cn(
          "grid min-w-11 grid-cols-[minmax(0,1fr)_2.75rem] overflow-hidden transition-[width,flex-grow] duration-200 ease-out",
          searchIsOpen ? "ml-2 flex-1" : "w-11",
        )}
      >
        <span
          className={cn(
            "min-w-0 overflow-hidden transition-opacity duration-150",
            searchIsOpen ? "opacity-100" : "pointer-events-none opacity-0",
          )}
        >
          {searchIsOpen ?
            <input
              ref={searchInputRef}
              type="search"
              value={searchDraft}
              onChange={event => setSearchDraft(event.target.value)}
              aria-label="Buscar en el manual"
              placeholder="Buscar…"
              autoComplete="off"
              className="bg-paper text-ink focus-visible:outline-red h-full min-h-11 w-full min-w-0 px-2 font-serif text-base focus-visible:outline-2 focus-visible:-outline-offset-2"
            />
          : null}
        </span>
        {searchIsOpen ?
          <button
            type="submit"
            aria-label="Buscar"
            className="text-soft flex min-h-11 min-w-11 items-center justify-center"
          >
            <IconSearch aria-hidden="true" size={20} stroke={1.6} />
          </button>
        : <AppLink
            href="/manual/buscar"
            ariaLabel="Buscar en el manual"
            className="text-soft flex min-h-11 min-w-11 items-center justify-center"
          >
            <IconSearch aria-hidden="true" size={20} stroke={1.6} />
          </AppLink>
        }
      </form>
    </nav>
  )
}

interface Props {
  /** Top-level destination represented by the current route */
  activeDestination: "practice" | "manual"
  /** Routed manual search query, or null while the search field is closed */
  searchQuery: string | null
}
