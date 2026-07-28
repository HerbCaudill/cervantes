import { READER_STATE_STORAGE_KEY } from "@/reader/constants"
import type { ReaderState } from "@/reader/types"

/** Persist manual-reading progress without affecting flashcard scheduling state. */
export function saveReaderState(
  /** Complete reader state */
  state: ReaderState,
): void {
  try {
    localStorage.setItem(READER_STATE_STORAGE_KEY, JSON.stringify(state))
  } catch {
    // Reading remains available when storage is disabled or full.
  }
}
