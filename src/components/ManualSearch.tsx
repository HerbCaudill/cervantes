import { useEffect, useMemo, useState } from "react"
import { ManualSearchHighlight } from "@/components/ManualSearchHighlight"
import { getManualSearchIndexAsync } from "@/manual/search/getManualSearchIndexAsync"
import { peekManualSearchIndex } from "@/manual/search/peekManualSearchIndex"
import { searchManualIndex } from "@/manual/search/searchManualIndex"
import type { ManualSearchIndexEntry } from "@/manual/search/types"
import type { Manual } from "@/manual/types"
import { AppLink } from "@/navigation/AppLink"

/** Local full-text search contained within the Manual destination. */
export function ManualSearch({ manual, query }: Props) {
  const [indexState, setIndexState] = useState<ManualSearchIndexState>(() => ({
    manual,
    index: peekManualSearchIndex(manual),
  }))
  const index = indexState.manual === manual ? indexState.index : peekManualSearchIndex(manual)
  const results = useMemo(() => (index ? searchManualIndex(index, query) : []), [index, query])
  const normalizedQuery = query.trim().replace(/\s+/g, " ")

  useEffect(() => {
    let acceptsResult = true
    const cachedIndex = peekManualSearchIndex(manual)
    if (cachedIndex) {
      setIndexState(currentState =>
        currentState.manual === manual && currentState.index === cachedIndex ?
          currentState
        : { manual, index: cachedIndex },
      )
      return
    }

    void getManualSearchIndexAsync(manual).then(builtIndex => {
      if (acceptsResult) setIndexState({ manual, index: builtIndex })
    })

    return () => {
      acceptsResult = false
    }
  }, [manual])

  return (
    <div className="flex flex-col px-[0.9rem] py-[0.85rem]">
      {normalizedQuery ?
        <>
          <p role="status" aria-live="polite" className="sr-only">
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
      : null}
    </div>
  )
}

interface Props {
  /** Complete structured manual used to build the local index */
  manual: Manual
  /** Query decoded from the current search route */
  query: string
}

interface ManualSearchIndexState {
  /** Manual identity associated with this state */
  manual: Manual
  /** Completed index, or null while the first build is running */
  index: ManualSearchIndexEntry[] | null
}
