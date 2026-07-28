/** Join a wrapped PDF line, preserving intentional hyphenation. */
export function appendWrappedText(
  /** Text accumulated from earlier lines */
  current: string,
  /** Continuation from the next visual line */
  continuation: string,
): string {
  if (current.endsWith("-")) return `${current}${continuation}`
  return `${current} ${continuation}`.trim()
}
