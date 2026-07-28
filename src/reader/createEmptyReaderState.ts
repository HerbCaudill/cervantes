import { READER_STATE_VERSION } from "@/reader/constants"
import type { ReaderState } from "@/reader/types"

/** Create pristine reader state for an installation or unsupported saved schema. */
export function createEmptyReaderState(): ReaderState {
  return {
    version: READER_STATE_VERSION,
    lastTopicId: null,
    topics: {},
  }
}
