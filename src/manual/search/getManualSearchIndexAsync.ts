import { buildManualSearchIndexAsync } from "@/manual/search/buildManualSearchIndexAsync"
import {
  manualSearchIndexesByManual,
  manualSearchIndexPromisesByManual,
} from "@/manual/search/manualSearchIndexCache"
import type { ManualSearchIndexEntry } from "@/manual/search/types"
import type { Manual } from "@/manual/types"

/** Get or asynchronously build one cached local search index. */
export function getManualSearchIndexAsync(
  /** Complete structured manual */
  manual: Manual,
): Promise<ManualSearchIndexEntry[]> {
  const existingIndex = manualSearchIndexesByManual.get(manual)
  if (existingIndex) return Promise.resolve(existingIndex)

  const existingPromise = manualSearchIndexPromisesByManual.get(manual)
  if (existingPromise) return existingPromise

  const indexPromise = buildManualSearchIndexAsync(manual).then(
    index => {
      manualSearchIndexesByManual.set(manual, index)
      manualSearchIndexPromisesByManual.delete(manual)
      return index
    },
    error => {
      manualSearchIndexPromisesByManual.delete(manual)
      throw error
    },
  )
  manualSearchIndexPromisesByManual.set(manual, indexPromise)
  return indexPromise
}
