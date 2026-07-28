/** Split callout prose at sentence boundaries while retaining its punctuation. */
export function splitManualTextChunks(
  /** Verbatim callout prose */
  text: string,
): string[] {
  return (text.match(/[^.!?;]+[.!?;]*/gu) ?? [text]).map(chunk => chunk.trim()).filter(Boolean)
}
