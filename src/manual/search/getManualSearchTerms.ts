import { normalizeManualSearchText } from "@/manual/search/normalizeManualSearchText"

/** Return unique normalized query terms in the order the reader entered them. */
export function getManualSearchTerms(
  /** Reader-entered query */
  query: string,
): string[] {
  const normalized = normalizeManualSearchText(query)
  if (!normalized) return []

  return [...new Set(normalized.split(" "))]
}
