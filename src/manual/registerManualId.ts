import { assertNonBlank } from "@/manual/assertNonBlank"

/** Register a content ID and reject duplicates across the manual. */
export function registerManualId(
  /** Stable content ID */
  id: string,
  /** Human-readable content location */
  location: string,
  /** IDs already encountered while validating this manual */
  seenIds: Set<string>,
): void {
  assertNonBlank(id, `${location} ID`)
  if (seenIds.has(id)) throw new Error(`${location} has duplicate ID "${id}"`)
  seenIds.add(id)
}
