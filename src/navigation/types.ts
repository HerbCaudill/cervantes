/** A destination understood by the application router. */
export type AppRoute =
  | { type: "practice" }
  | { type: "manual-index" }
  | { type: "manual-search"; query: string }
  | { type: "manual-section"; sectionId: string }
  | { type: "manual-topic"; sectionId: string; topicSlug: string }
  | { type: "not-found" }

/** Scroll behavior requested for a new in-app history entry. */
export type NavigationScrollMode = "top" | "restore"

/** Metadata supplied with an in-app navigation event. */
export interface NavigationEventDetail {
  /** Whether the destination should begin at the top or restore saved progress */
  scroll: NavigationScrollMode
}
