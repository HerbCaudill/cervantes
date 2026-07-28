/** A destination understood by the application router. */
export type AppRoute =
  | { type: "practice" }
  | { type: "manual-index" }
  | { type: "manual-search" }
  | { type: "manual-section"; sectionId: string }
  | { type: "manual-topic"; sectionId: string; topicId: string }
  | { type: "not-found" }
