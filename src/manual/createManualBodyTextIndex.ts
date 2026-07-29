import { getManualTextHashLeadingPower } from "@/manual/getManualTextHashLeadingPower"
import { getManualTextWindowHash } from "@/manual/getManualTextWindowHash"
import { getNextManualTextWindowHash } from "@/manual/getNextManualTextWindowHash"
import type { ManualBodyTextIndex, ManualBodyTextOccurrence } from "@/manual/types"

/** Index every fixed-width normalized window from the manual body corpus. */
export function createManualBodyTextIndex(
  /** Normalized non-callout text segments */
  bodySearchSegments: readonly string[],
  /** Character width required for a substantial match */
  windowLength: number,
): ManualBodyTextIndex {
  const occurrencesByHash = new Map<number, ManualBodyTextOccurrence | ManualBodyTextOccurrence[]>()
  const hashLeadingPower = getManualTextHashLeadingPower(windowLength)

  for (const [segmentIndex, segment] of bodySearchSegments.entries()) {
    if (segment.length < windowLength) continue
    let hash = getManualTextWindowHash(segment, 0, windowLength)

    for (let start = 0; start <= segment.length - windowLength; start += 1) {
      const occurrence = { segmentIndex, start }
      const existingOccurrences = occurrencesByHash.get(hash)
      if (!existingOccurrences) {
        occurrencesByHash.set(hash, occurrence)
      } else if (Array.isArray(existingOccurrences)) {
        existingOccurrences.push(occurrence)
      } else {
        occurrencesByHash.set(hash, [existingOccurrences, occurrence])
      }

      const incomingOffset = start + windowLength
      if (incomingOffset < segment.length) {
        hash = getNextManualTextWindowHash(
          hash,
          segment.charCodeAt(start),
          segment.charCodeAt(incomingOffset),
          hashLeadingPower,
        )
      }
    }
  }

  return {
    windowLength,
    hashLeadingPower,
    segments: bodySearchSegments,
    occurrencesByHash,
  }
}
