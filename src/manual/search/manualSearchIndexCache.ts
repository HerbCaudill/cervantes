import type { ManualSearchIndexEntry } from "@/manual/search/types"
import type { Manual } from "@/manual/types"

/** Completed local search indexes keyed by immutable manual identity. */
export const manualSearchIndexesByManual = new WeakMap<Manual, ManualSearchIndexEntry[]>()

/** In-flight local search index builds keyed by immutable manual identity. */
export const manualSearchIndexPromisesByManual = new WeakMap<
  Manual,
  Promise<ManualSearchIndexEntry[]>
>()
