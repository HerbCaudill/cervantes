import { getLongestManualTextOverlap } from "@/manual/getLongestManualTextOverlap"
import { normalizeManualSearchText } from "@/manual/search/normalizeManualSearchText"
import type { ManualBodyTextIndex } from "@/manual/types"

/** Decide whether callout text substantially overlaps ordinary manual prose. */
export function isDuplicatedManualCalloutText(
  /** Verbatim text from a callout */
  text: string,
  /** Fixed-width normalized body-window index */
  bodyTextIndex: ManualBodyTextIndex,
): boolean {
  const normalizedText = normalizeManualSearchText(text)

  return Boolean(getLongestManualTextOverlap(normalizedText, bodyTextIndex))
}
