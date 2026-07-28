/** Normalize accents, case, punctuation, and whitespace for forgiving Spanish search. */
export function normalizeManualSearchText(
  /** Source or query text */
  text: string,
): string {
  return text
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLocaleLowerCase("es")
    .replace(/[^\p{Letter}\p{Number}]+/gu, " ")
    .trim()
    .replace(/\s+/g, " ")
}
