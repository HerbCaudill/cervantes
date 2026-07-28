import { useEffect, useMemo, useRef, useState } from "react"
import type { FormEvent } from "react"
import { ManualSearchHighlight } from "@/components/ManualSearchHighlight"
import { getManualSearchIndex } from "@/manual/search/getManualSearchIndex"
import { searchManualIndex } from "@/manual/search/searchManualIndex"
import type { ManualSearchIndexEntry } from "@/manual/search/types"
import type { Manual } from "@/manual/types"
import { AppLink } from "@/navigation/AppLink"
import { navigate } from "@/navigation/navigate"

/** Local full-text search contained within the Manual destination. */
export function ManualSearch({ manual, query }: Props) {
  const [draft, setDraft] = useState(query)
  const [index, setIndex] = useState<ManualSearchIndexEntry[] | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const results = useMemo(() => (index ? searchManualIndex(index, query) : []), [index, query])
  const normalizedQuery = query.trim().replace(/\s+/g, " ")

  useEffect(() => {
    setIndex(getManualSearchIndex(manual))
  }, [manual])

  useEffect(() => {
    setDraft(query)
  }, [query])

  /** Add the submitted query to browser history as a deep-linkable search route. */
  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const submittedQuery = draft.trim().replace(/\s+/g, " ")
    if (!submittedQuery) {
      navigate("/manual/buscar")
      return
    }

    const parameters = new URLSearchParams({ q: submittedQuery })
    navigate(`/manual/buscar?${parameters}`)
  }

  /** Clear both the visible query and its routed result state. */
  const handleClear = () => {
    setDraft("")
    navigate("/manual/buscar")
    window.requestAnimationFrame(() => inputRef.current?.focus())
  }

  return (
    <div className="flex flex-col px-[0.9rem] py-[0.85rem]">
      <AppLink
        href="/manual"
        className="text-soft flex min-h-11 items-center font-sans text-xs tracking-[0.08em] uppercase"
      >
        ← Índice del manual
      </AppLink>
      <h2 className="border-rule-hard border-b py-[0.85rem] font-serif text-[23px] leading-[1.12] font-bold">
        Buscar en el manual
      </h2>
      <form role="search" className="mt-[0.85rem] flex flex-col" onSubmit={handleSubmit}>
        <label className="section-label" htmlFor="manual-search">
          Buscar en el manual
        </label>
        <div className="border-rule-hard mt-2 grid grid-cols-[minmax(0,1fr)_auto] border-y">
          <input
            ref={inputRef}
            id="manual-search"
            type="search"
            value={draft}
            onChange={event => setDraft(event.target.value)}
            placeholder="Escribe una palabra o frase"
            autoComplete="off"
            className="bg-paper text-ink focus-visible:outline-red min-h-11 min-w-0 px-2 font-serif text-[17px] focus-visible:outline-2 focus-visible:-outline-offset-2"
          />
          <button
            type="submit"
            className="bg-ink text-paper min-h-11 px-4 font-sans text-xs tracking-[0.08em] uppercase"
          >
            Buscar
          </button>
        </div>
        {draft || normalizedQuery ?
          <button
            type="button"
            onClick={handleClear}
            className="text-soft min-h-11 self-end px-2 font-sans text-xs tracking-[0.08em] uppercase"
          >
            Limpiar búsqueda
          </button>
        : null}
      </form>
      {normalizedQuery ?
        <>
          <p
            role="status"
            aria-live="polite"
            className="text-soft border-rule-hard border-b pb-[0.85rem] font-sans text-xs"
          >
            {!index ?
              "Preparando búsqueda…"
            : results.length === 0 ?
              `No hay resultados para «${normalizedQuery}».`
            : `${results.length} ${results.length === 1 ? "resultado" : "resultados"}`}
          </p>
          {index && results.length > 0 ?
            <ol aria-label="Resultados de búsqueda">
              {results.map(result => (
                <li key={result.topicId} className="border-rule border-b">
                  <AppLink
                    href={result.href}
                    className="grid min-h-14 grid-cols-[2.5rem_minmax(0,1fr)] gap-[0.6rem] py-[0.85rem]"
                  >
                    <span className="text-red pt-0.5 font-mono text-[10.5px] tabular-nums">
                      T{result.sectionNumber}
                    </span>
                    <span className="min-w-0">
                      <span className="text-soft block font-sans text-[10px] tracking-[0.08em] uppercase">
                        Tema {String(result.topicNumber).padStart(2, "0")} · {result.sectionTitle}
                      </span>
                      <span className="mt-1 block font-serif text-base leading-[1.3] font-bold">
                        <ManualSearchHighlight text={result.topicTitle} query={normalizedQuery} />
                      </span>
                      <span className="text-soft mt-1 block font-serif text-sm leading-[1.45]">
                        <ManualSearchHighlight text={result.excerpt} query={normalizedQuery} />
                      </span>
                    </span>
                  </AppLink>
                </li>
              ))}
            </ol>
          : null}
        </>
      : <p className="text-soft border-rule border-b py-[0.85rem] font-serif text-[17px] leading-[1.5]">
          Busca palabras o frases en todo el manual.
        </p>
      }
    </div>
  )
}

interface Props {
  /** Complete structured manual used to build the local index */
  manual: Manual
  /** Query decoded from the current search route */
  query: string
}
