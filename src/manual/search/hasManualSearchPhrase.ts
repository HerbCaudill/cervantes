/** Check whether normalized query terms occur as adjacent whole-word tokens. */
export function hasManualSearchPhrase(
  /** Normalized source tokens */
  tokens: string[],
  /** Normalized query terms */
  terms: string[],
): boolean {
  if (terms.length === 0 || terms.length > tokens.length) return false

  return tokens.some((token, start) =>
    terms.every((term, offset) => tokens[start + offset] === term),
  )
}
