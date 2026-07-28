import type { READER_STATE_VERSION } from "@/reader/constants"

/** Saved reading measurements for one stable semantic topic. */
export interface ReaderTopicState {
  /** Most recent vertical document offset */
  scrollPosition: number
  /** Furthest fractional progress reached, from zero to one */
  maximumProgress: number
}

/** Complete persisted state for the manual reader. */
export interface ReaderState {
  /** Persisted schema version */
  version: typeof READER_STATE_VERSION
  /** Most recently opened semantic topic */
  lastTopicId: string | null
  /** Reading measurements keyed by semantic topic ID */
  topics: Record<string, ReaderTopicState>
}
