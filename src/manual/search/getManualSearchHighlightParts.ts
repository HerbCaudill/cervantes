import { getManualSearchTerms } from "@/manual/search/getManualSearchTerms"
import type { ManualSearchHighlightPart } from "@/manual/search/types"

/** Partition original text into safe plain-text query matches and surrounding fragments. */
export function getManualSearchHighlightParts(
  /** Original source text */
  text: string,
  /** Reader-entered query */
  query: string,
): ManualSearchHighlightPart[] {
  const terms = getManualSearchTerms(query)
  if (terms.length === 0 || text.length === 0) return [{ text, highlighted: false }]

  let normalizedText = ""
  const originalIndices: number[] = []
  let originalIndex = 0

  for (const character of text) {
    const normalizedCharacter = character
      .normalize("NFD")
      .replace(/\p{Diacritic}/gu, "")
      .toLocaleLowerCase("es")
      .replace(/[^\p{Letter}\p{Number}]/gu, " ")

    for (const normalizedCodePoint of normalizedCharacter) {
      normalizedText += normalizedCodePoint
      originalIndices.push(originalIndex)
    }
    originalIndex += character.length
  }

  const ranges = terms
    .flatMap(term => {
      const matches: { start: number; end: number }[] = []
      let offset = 0
      while (offset < normalizedText.length) {
        const start = normalizedText.indexOf(term, offset)
        if (start < 0) break
        const endIndex = start + term.length - 1
        const originalStart = originalIndices[start]
        const originalEndIndex = originalIndices[endIndex]
        if (originalStart !== undefined && originalEndIndex !== undefined) {
          matches.push({
            start: originalStart,
            end: originalEndIndex + (text.codePointAt(originalEndIndex)! > 0xffff ? 2 : 1),
          })
        }
        offset = start + term.length
      }
      return matches
    })
    .sort((left, right) => left.start - right.start || left.end - right.end)

  const mergedRanges = ranges.reduce<{ start: number; end: number }[]>((merged, range) => {
    const previous = merged.at(-1)
    if (previous && range.start <= previous.end) {
      previous.end = Math.max(previous.end, range.end)
      return merged
    }
    return [...merged, { ...range }]
  }, [])

  if (mergedRanges.length === 0) return [{ text, highlighted: false }]

  const parts: ManualSearchHighlightPart[] = []
  let cursor = 0
  for (const range of mergedRanges) {
    if (range.start > cursor) {
      parts.push({ text: text.slice(cursor, range.start), highlighted: false })
    }
    parts.push({ text: text.slice(range.start, range.end), highlighted: true })
    cursor = range.end
  }
  if (cursor < text.length) parts.push({ text: text.slice(cursor), highlighted: false })

  return parts
}
