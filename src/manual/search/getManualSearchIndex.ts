import { buildManualSearchIndex } from "@/manual/search/buildManualSearchIndex"
import { manualSearchIndexesByManual } from "@/manual/search/manualSearchIndexCache"
import type { ManualSearchIndexEntry } from "@/manual/search/types"
import type { Manual } from "@/manual/types"

/** Lazily build and retain the local search index for one immutable manual. */
export function getManualSearchIndex(
  /** Complete structured manual */
  manual: Manual,
): ManualSearchIndexEntry[] {
  const existingIndex = manualSearchIndexesByManual.get(manual)
  if (existingIndex) return existingIndex

  const index = buildManualSearchIndex(manual)
  manualSearchIndexesByManual.set(manual, index)
  return index
}
