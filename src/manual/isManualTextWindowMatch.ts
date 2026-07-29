/** Verify two fixed-width text windows character by character after a hash match. */
export function isManualTextWindowMatch(
  /** Complete normalized callout text */
  calloutText: string,
  /** Zero-based callout window start */
  calloutStart: number,
  /** Complete normalized body segment */
  bodyText: string,
  /** Zero-based body window start */
  bodyStart: number,
  /** Number of UTF-16 characters to compare */
  windowLength: number,
): boolean {
  for (let offset = 0; offset < windowLength; offset += 1) {
    if (calloutText.charCodeAt(calloutStart + offset) !== bodyText.charCodeAt(bodyStart + offset)) {
      return false
    }
  }

  return true
}
