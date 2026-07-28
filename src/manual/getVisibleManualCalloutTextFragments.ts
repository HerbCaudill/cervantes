import { getLongestManualTextOverlap } from "@/manual/getLongestManualTextOverlap"
import { normalizeManualSearchText } from "@/manual/search/normalizeManualSearchText"
import { splitManualTextChunks } from "@/manual/splitManualTextChunks"
import type { ManualBodyTextIndex } from "@/manual/types"

/** Derive unique source-order fragments from one partly or wholly repeated callout string. */
export function getVisibleManualCalloutTextFragments(
  /** Verbatim callout text */
  text: string,
  /** Fixed-width normalized body-window index */
  bodyTextIndex: ManualBodyTextIndex,
): string[] {
  const normalizedText = normalizeManualSearchText(text)
  const substantialOverlap = getLongestManualTextOverlap(normalizedText, bodyTextIndex)
  if (!substantialOverlap) return [text]
  if (substantialOverlap.length === normalizedText.length) return []

  return splitManualTextChunks(text).filter(chunk => {
    const overlap = getLongestManualTextOverlap(normalizeManualSearchText(chunk), bodyTextIndex)

    return !overlap
  })
}
