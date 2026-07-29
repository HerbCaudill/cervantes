import { manualSearchIndexesByManual } from "@/manual/search/manualSearchIndexCache"
import type { ManualSearchIndexEntry } from "@/manual/search/types"
import type { Manual } from "@/manual/types"

/** Return an already-built local search index without starting new work. */
export function peekManualSearchIndex(
  /** Complete structured manual */
  manual: Manual,
): ManualSearchIndexEntry[] | null {
  return manualSearchIndexesByManual.get(manual) ?? null
}
