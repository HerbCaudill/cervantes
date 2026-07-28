import type { Manual } from "@/manual/types"
import { READER_STATE_STORAGE_KEY } from "@/reader/constants"
import { createEmptyReaderState } from "@/reader/createEmptyReaderState"
import { parseReaderState } from "@/reader/parseReaderState"
import type { ReaderState } from "@/reader/types"

/** Load validated manual-reading progress from its isolated localStorage key. */
export function loadReaderState(
  /** Current manual used to discard stale semantic topic IDs */
  manual: Manual,
): ReaderState {
  try {
    return parseReaderState(localStorage.getItem(READER_STATE_STORAGE_KEY), manual)
  } catch {
    return createEmptyReaderState()
  }
}
