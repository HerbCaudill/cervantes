import { MANUAL_CALLOUT_DEDUPLICATION_MIN_LENGTH } from "@/manual/constants"
import { normalizeManualSearchText } from "@/manual/search/normalizeManualSearchText"

/** Decide whether substantial callout text is contained in ordinary manual prose. */
export function isDuplicatedManualCalloutText(
  /** Verbatim text from a callout */
  text: string,
  /** Normalized searchable strings from non-callout blocks */
  bodySearchSegments: readonly string[],
): boolean {
  const normalizedText = normalizeManualSearchText(text)

  return (
    normalizedText.length >= MANUAL_CALLOUT_DEDUPLICATION_MIN_LENGTH &&
    bodySearchSegments.some(bodyText => bodyText.includes(normalizedText))
  )
}
