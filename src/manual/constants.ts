/** Stable section IDs for the five official CCSE manual tasks. */
export const MANUAL_SECTION_IDS = ["task-1", "task-2", "task-3", "task-4", "task-5"] as const

/** Minimum normalized quote length that can safely be treated as intentional repetition. */
export const MANUAL_CALLOUT_DEDUPLICATION_MIN_LENGTH = 64

/** Polynomial base for rolling hashes of normalized manual text windows. */
export const MANUAL_TEXT_WINDOW_HASH_BASE = 31

/** Maximum uninterrupted main-thread time for one async manual search phase. */
export const MANUAL_SEARCH_TASK_BUDGET_MS = 8
