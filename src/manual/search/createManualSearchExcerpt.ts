import { getManualSearchTerms } from "@/manual/search/getManualSearchTerms"
import { getManualSearchMatchRanges } from "@/manual/search/getManualSearchMatchRanges"
import { getManualSearchTokens } from "@/manual/search/getManualSearchTokens"
import { hasManualSearchPhrase } from "@/manual/search/hasManualSearchPhrase"

/** Select and shorten the original source fragment with the strongest query match. */
export function createManualSearchExcerpt(
  /** Original searchable fragments for one topic */
  segments: string[],
  /** Reader-entered query */
  query: string,
): string {
  const terms = getManualSearchTerms(query)
  if (terms.length === 0) return ""

  const selected =
    segments
      .map((segment, index) => {
        const tokens = getManualSearchTokens(segment).map(token => token.normalized)
        const termCount = terms.filter(term => tokens.includes(term)).length
        const score = (hasManualSearchPhrase(tokens, terms) ? 100 : 0) + termCount

        return { segment, score, index }
      })
      .filter(candidate => candidate.score > 0)
      .sort((left, right) => right.score - left.score || left.index - right.index)[0] ?? null

  if (!selected) return ""
  if (selected.segment.length <= 160) return selected.segment

  const firstMatch = getManualSearchMatchRanges(selected.segment, query)[0]?.start ?? 0
  let start = Math.max(0, firstMatch - 55)
  let end = Math.min(selected.segment.length, start + 160)

  if (start > 0) {
    const nextSpace = selected.segment.indexOf(" ", start)
    if (nextSpace >= 0 && nextSpace < firstMatch) start = nextSpace + 1
  }
  if (end < selected.segment.length) {
    const previousSpace = selected.segment.lastIndexOf(" ", end)
    if (previousSpace > firstMatch) end = previousSpace
  }

  return `${start > 0 ? "…" : ""}${selected.segment.slice(start, end).trim()}${
    end < selected.segment.length ? "…" : ""
  }`
}
