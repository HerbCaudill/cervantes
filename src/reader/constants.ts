/** Schema version embedded in persisted reader state. */
export const READER_STATE_VERSION = 1 as const

/** Versioned localStorage key reserved for manual-reading progress. */
export const READER_STATE_STORAGE_KEY = "cervantes:manual-reader:v1"

/** Delay used to coalesce synchronous localStorage writes while scrolling. */
export const READER_STATE_SAVE_DELAY_MS = 500
