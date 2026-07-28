import { MANUAL_CALLOUT_DEDUPLICATION_MIN_LENGTH } from "@/manual/constants"
import { getLongestManualTextOverlap } from "@/manual/getLongestManualTextOverlap"
import { normalizeManualSearchText } from "@/manual/search/normalizeManualSearchText"
import { splitManualTextChunks } from "@/manual/splitManualTextChunks"

/** Derive unique source-order fragments from one partly or wholly repeated callout string. */
export function getVisibleManualCalloutTextFragments(
  /** Verbatim callout text */
  text: string,
  /** Normalized non-callout text segments */
  bodySearchSegments: readonly string[],
): string[] {
  const normalizedText = normalizeManualSearchText(text)
  const substantialOverlap = getLongestManualTextOverlap(
    normalizedText,
    bodySearchSegments,
    MANUAL_CALLOUT_DEDUPLICATION_MIN_LENGTH,
  )
  if (!substantialOverlap) return [text]
  if (substantialOverlap.length === normalizedText.length) return []

  return splitManualTextChunks(text).filter(chunk => {
    const overlap = getLongestManualTextOverlap(
      normalizeManualSearchText(chunk),
      bodySearchSegments,
      MANUAL_CALLOUT_DEDUPLICATION_MIN_LENGTH,
    )

    return !overlap
  })
}
