import { buildManualSearchIndex } from "@/manual/search/buildManualSearchIndex"
import type { ManualSearchIndexEntry } from "@/manual/search/types"
import type { Manual } from "@/manual/types"

const indexesByManual = new WeakMap<Manual, ManualSearchIndexEntry[]>()

/** Lazily build and retain the local search index for one immutable manual. */
export function getManualSearchIndex(
  /** Complete structured manual */
  manual: Manual,
): ManualSearchIndexEntry[] {
  const existingIndex = indexesByManual.get(manual)
  if (existingIndex) return existingIndex

  const index = buildManualSearchIndex(manual)
  indexesByManual.set(manual, index)
  return index
}
