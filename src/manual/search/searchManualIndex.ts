import { createManualSearchExcerpt } from "@/manual/search/createManualSearchExcerpt"
import { getManualSearchTerms } from "@/manual/search/getManualSearchTerms"
import { getManualSearchTokens } from "@/manual/search/getManualSearchTokens"
import { hasManualSearchPhrase } from "@/manual/search/hasManualSearchPhrase"
import { normalizeManualSearchText } from "@/manual/search/normalizeManualSearchText"
import type { ManualSearchIndexEntry, ManualSearchResult } from "@/manual/search/types"

/** Match, rank, and deduplicate topic-level results from a local manual index. */
export function searchManualIndex(
  /** Prebuilt topic search documents */
  index: ManualSearchIndexEntry[],
  /** Reader-entered query */
  query: string,
): ManualSearchResult[] {
  const normalizedQuery = normalizeManualSearchText(query)
  const terms = getManualSearchTerms(query)
  if (!normalizedQuery || terms.length === 0) return []

  const ranked = index
    .filter(entry => terms.every(term => entry.normalizedTokens.includes(term)))
    .map((entry, sourcePosition) => {
      const titleTokens = getManualSearchTokens(entry.topicTitle).map(token => token.normalized)
      const titleTermCount = terms.filter(term => titleTokens.includes(term)).length
      const occurrences = terms.reduce(
        (total, term) =>
          total + Math.min(5, entry.normalizedTokens.filter(token => token === term).length),
        0,
      )
      const score =
        (entry.normalizedTitle === normalizedQuery ? 1_000 : 0) +
        (hasManualSearchPhrase(titleTokens, terms) ? 500 : 0) +
        titleTermCount * 100 +
        (hasManualSearchPhrase(entry.normalizedTokens, terms) ? 50 : 0) +
        occurrences

      return {
        entry,
        sourcePosition,
        score,
      }
    })
    .sort((left, right) => right.score - left.score || left.sourcePosition - right.sourcePosition)

  const seenTopicIds = new Set<string>()
  const results: ManualSearchResult[] = []

  for (const { entry } of ranked) {
    if (seenTopicIds.has(entry.topicId)) continue
    seenTopicIds.add(entry.topicId)
    results.push({
      sectionId: entry.sectionId,
      sectionTitle: entry.sectionTitle,
      sectionNumber: entry.sectionNumber,
      topicId: entry.topicId,
      topicTitle: entry.topicTitle,
      topicNumber: entry.topicNumber,
      href: entry.href,
      excerpt: createManualSearchExcerpt(entry.segments, query),
    })
  }

  return results
}
