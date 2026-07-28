/** Find the longest contiguous overlap between normalized callout text and body segments. */
export function getLongestManualTextOverlap(
  /** Normalized callout text */
  calloutText: string,
  /** Normalized non-callout text segments */
  bodySearchSegments: readonly string[],
  /** Minimum overlap length worth returning */
  minimumLength: number,
): ManualTextOverlap | null {
  let longestOverlap: ManualTextOverlap | null = null

  for (const bodyText of bodySearchSegments) {
    if (Math.min(calloutText.length, bodyText.length) < minimumLength) continue
    if (bodyText.includes(calloutText)) {
      return { start: 0, length: calloutText.length }
    }

    for (
      let calloutStart = 0;
      calloutStart <= calloutText.length - minimumLength;
      calloutStart += 1
    ) {
      const candidate = calloutText.slice(calloutStart, calloutStart + minimumLength)
      let bodyStart = bodyText.indexOf(candidate)

      while (bodyStart >= 0) {
        let leftExpansion = 0
        while (
          calloutStart - leftExpansion > 0 &&
          bodyStart - leftExpansion > 0 &&
          calloutText[calloutStart - leftExpansion - 1] === bodyText[bodyStart - leftExpansion - 1]
        ) {
          leftExpansion += 1
        }

        let rightExpansion = minimumLength
        while (
          calloutStart + rightExpansion < calloutText.length &&
          bodyStart + rightExpansion < bodyText.length &&
          calloutText[calloutStart + rightExpansion] === bodyText[bodyStart + rightExpansion]
        ) {
          rightExpansion += 1
        }

        const overlap = {
          start: calloutStart - leftExpansion,
          length: leftExpansion + rightExpansion,
        }
        if (!longestOverlap || overlap.length > longestOverlap.length) {
          longestOverlap = overlap
          if (overlap.length === calloutText.length) return overlap
        }

        bodyStart = bodyText.indexOf(candidate, bodyStart + 1)
      }
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
