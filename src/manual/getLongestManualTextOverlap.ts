import type { ManualBodyTextIndex } from "@/manual/types"

/** Find the longest contiguous overlap between normalized callout text and body segments. */
export function getLongestManualTextOverlap(
  /** Normalized callout text */
  calloutText: string,
  /** Fixed-width normalized body-window index */
  bodyTextIndex: ManualBodyTextIndex,
): ManualTextOverlap | null {
  const { windowLength, windows } = bodyTextIndex
  if (calloutText.length < windowLength) return null

  let longestOverlap: ManualTextOverlap | null = null
  let currentStart: number | null = null

  for (let start = 0; start <= calloutText.length - windowLength; start += 1) {
    if (windows.has(calloutText.slice(start, start + windowLength))) {
      if (currentStart === null) currentStart = start
      continue
    }

    if (currentStart === null) continue
    const overlap = {
      start: currentStart,
      length: start + windowLength - 1 - currentStart,
    }
    if (!longestOverlap || overlap.length > longestOverlap.length) longestOverlap = overlap
    currentStart = null
  }

  if (currentStart !== null) {
    const overlap = {
      start: currentStart,
      length: calloutText.length - currentStart,
    }
    if (!longestOverlap || overlap.length > longestOverlap.length) longestOverlap = overlap
  }

  return longestOverlap
}

interface ManualTextOverlap {
  /** Zero-based start in normalized callout text */
  start: number
  /** Contiguous normalized overlap length */
  length: number
}
