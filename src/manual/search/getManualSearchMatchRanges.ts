import { getManualSearchTerms } from "@/manual/search/getManualSearchTerms"
import { getManualSearchTokens } from "@/manual/search/getManualSearchTokens"
import type { ManualSearchMatchRange } from "@/manual/search/types"

/** Locate whole-word query terms in original source text. */
export function getManualSearchMatchRanges(
  /** Original source text */
  text: string,
  /** Reader-entered query */
  query: string,
): ManualSearchMatchRange[] {
  const terms = new Set(getManualSearchTerms(query))
  if (terms.size === 0) return []

  return getManualSearchTokens(text)
    .filter(token => terms.has(token.normalized))
    .map(token => ({ start: token.start, end: token.end }))
}
