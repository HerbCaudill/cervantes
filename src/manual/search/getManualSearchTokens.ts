import { normalizeManualSearchText } from "@/manual/search/normalizeManualSearchText"
import type { ManualSearchToken } from "@/manual/search/types"

/** Spanish-aware Unicode segmenter used for both indexing and displayed matches. */
const SPANISH_WORD_SEGMENTER = new Intl.Segmenter("es", {
  granularity: "word",
})

/** Original Unicode letters, numbers, and combining marks within one word-like segment. */
const UNICODE_TOKEN_PATTERN = /[\p{Letter}\p{Number}\p{Mark}]+/gu

/** Split source text into normalized whole-word tokens with original-text offsets. */
export function getManualSearchTokens(
  /** Original source or query text */
  text: string,
): ManualSearchToken[] {
  return [...SPANISH_WORD_SEGMENTER.segment(text)].flatMap(segment => {
    if (!segment.isWordLike) return []

    return [...segment.segment.matchAll(UNICODE_TOKEN_PATTERN)].flatMap(match => {
      const normalized = normalizeManualSearchText(match[0])
      if (!normalized || match.index === undefined) return []

      return [
        {
          normalized,
          start: segment.index + match.index,
          end: segment.index + match.index + match[0].length,
        },
      ]
    })
  })
}
