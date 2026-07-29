import { getManualTextWindowHash } from "@/manual/getManualTextWindowHash"
import { getNextManualTextWindowHash } from "@/manual/getNextManualTextWindowHash"
import { isManualTextWindowMatch } from "@/manual/isManualTextWindowMatch"
import type { ManualBodyTextIndex } from "@/manual/types"

/** Find the longest contiguous overlap between normalized callout text and body segments. */
export function getLongestManualTextOverlap(
  /** Normalized callout text */
  calloutText: string,
  /** Fixed-width normalized body-window index */
  bodyTextIndex: ManualBodyTextIndex,
): ManualTextOverlap | null {
  const { windowLength, hashLeadingPower, occurrencesByHash, segments } = bodyTextIndex
  if (calloutText.length < windowLength) return null

  let longestOverlap: ManualTextOverlap | null = null
  let activeRuns = new Map<string, number>()
  let hash = getManualTextWindowHash(calloutText, 0, windowLength)

  for (let start = 0; start <= calloutText.length - windowLength; start += 1) {
    const indexedOccurrences = occurrencesByHash.get(hash)
    const occurrences =
      !indexedOccurrences ? []
      : Array.isArray(indexedOccurrences) ? indexedOccurrences
      : [indexedOccurrences]
    const continuingRuns = new Map<string, number>()

    for (const occurrence of occurrences) {
      const bodyText = segments[occurrence.segmentIndex]
      if (!isManualTextWindowMatch(calloutText, start, bodyText, occurrence.start, windowLength)) {
        continue
      }

      const runKey = `${occurrence.segmentIndex}:${occurrence.start - start}`
      const runStart = activeRuns.get(runKey) ?? start
      continuingRuns.set(runKey, runStart)
      const overlap = {
        start: runStart,
        length: start - runStart + windowLength,
      }
      if (!longestOverlap || overlap.length > longestOverlap.length) longestOverlap = overlap
    }

    activeRuns = continuingRuns
    const incomingOffset = start + windowLength
    if (incomingOffset < calloutText.length) {
      hash = getNextManualTextWindowHash(
        hash,
        calloutText.charCodeAt(start),
        calloutText.charCodeAt(incomingOffset),
        hashLeadingPower,
      )
    }
  }

  return longestOverlap
}

interface ManualTextOverlap {
  /** Zero-based start in normalized callout text */
  start: number
  /** Contiguous normalized overlap length */
  length: number
}
