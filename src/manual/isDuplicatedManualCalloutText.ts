import { MANUAL_CALLOUT_DEDUPLICATION_MIN_LENGTH } from "@/manual/constants"
import { getLongestManualTextOverlap } from "@/manual/getLongestManualTextOverlap"
import { normalizeManualSearchText } from "@/manual/search/normalizeManualSearchText"

/** Decide whether callout text substantially overlaps ordinary manual prose. */
export function isDuplicatedManualCalloutText(
  /** Verbatim text from a callout */
  text: string,
  /** Normalized searchable strings from non-callout blocks */
  bodySearchSegments: readonly string[],
): boolean {
  const normalizedText = normalizeManualSearchText(text)

  return Boolean(
    getLongestManualTextOverlap(
      normalizedText,
      bodySearchSegments,
      MANUAL_CALLOUT_DEDUPLICATION_MIN_LENGTH,
    ),
  )
}
