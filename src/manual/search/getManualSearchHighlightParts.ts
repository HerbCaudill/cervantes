import { getManualSearchMatchRanges } from "@/manual/search/getManualSearchMatchRanges"
import type { ManualSearchHighlightPart } from "@/manual/search/types"

/** Partition original text into safe plain-text query matches and surrounding fragments. */
export function getManualSearchHighlightParts(
  /** Original source text */
  text: string,
  /** Reader-entered query */
  query: string,
): ManualSearchHighlightPart[] {
  const ranges = getManualSearchMatchRanges(text, query)
  if (ranges.length === 0) return [{ text, highlighted: false }]

  const parts: ManualSearchHighlightPart[] = []
  let cursor = 0
  for (const range of ranges) {
    if (range.start > cursor) {
      parts.push({ text: text.slice(cursor, range.start), highlighted: false })
    }
    parts.push({ text: text.slice(range.start, range.end), highlighted: true })
    cursor = range.end
  }
  if (cursor < text.length) parts.push({ text: text.slice(cursor), highlighted: false })

  return parts
}
