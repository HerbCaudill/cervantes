/** Require a string to contain non-whitespace content. */
export function assertNonBlank(
  /** Candidate source text */
  value: string,
  /** Human-readable location included in validation errors */
  location: string,
): void {
  if (!value.trim()) throw new Error(`${location} is blank`)
}
