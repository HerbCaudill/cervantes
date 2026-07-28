import { normalizeManualSearchText } from "@/manual/search/normalizeManualSearchText"
import type { ManualSearchToken } from "@/manual/search/types"

/** Spanish-aware Unicode segmenter used for both indexing and displayed matches. */
const SPANISH_WORD_SEGMENTER = new Intl.Segmenter("es", {
  granularity: "word",
})

/** Split source text into normalized whole-word tokens with original-text offsets. */
export function getManualSearchTokens(
  /** Original source or query text */
  text: string,
): ManualSearchToken[] {
  return [...SPANISH_WORD_SEGMENTER.segment(text)].flatMap(segment => {
    if (!segment.isWordLike) return []

    return normalizeManualSearchText(segment.segment)
      .split(" ")
      .filter(Boolean)
      .map(normalized => ({
        normalized,
        start: segment.index,
        end: segment.index + segment.segment.length,
      }))
  })
}
