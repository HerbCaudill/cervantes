/** Derive a compact marginal note only from text already present in the official source. */
export function getManualMarginNote(
  /** Verbatim source text */
  text: string,
): string | null {
  const article = text.match(/\bartículos?\s+(\d+)(?:\s*(?:a|al|y|-|–)\s*(\d+))?/i)
  if (article?.[2]) return `${article[1]}–${article[2]}`
  if (article) return `Art.${article[1]}`

  return text.match(/\b(?:1[5-9]\d{2}|20\d{2})\b/)?.[0] ?? null
}
