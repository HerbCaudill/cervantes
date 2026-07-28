import { createManualSearchExcerpt } from "@/manual/search/createManualSearchExcerpt"
import { getManualSearchTerms } from "@/manual/search/getManualSearchTerms"
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
    .filter(entry => terms.every(term => entry.normalizedText.includes(term)))
    .map((entry, sourcePosition) => {
      const titleTermCount = terms.filter(term => entry.normalizedTitle.includes(term)).length
      const occurrences = terms.reduce((total, term) => {
        let count = 0
        let offset = 0
        while (count < 5) {
          const position = entry.normalizedText.indexOf(term, offset)
          if (position < 0) break
          count += 1
          offset = position + term.length
        }
        return total + count
      }, 0)
      const score =
        (entry.normalizedTitle === normalizedQuery ? 1_000 : 0) +
        (entry.normalizedTitle.includes(normalizedQuery) ? 500 : 0) +
        titleTermCount * 100 +
        (entry.normalizedText.includes(normalizedQuery) ? 50 : 0) +
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
