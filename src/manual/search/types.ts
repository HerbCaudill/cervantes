import type { ManualContentId, ManualSectionId } from "@/manual/types"

/** One topic's normalized local full-text search document. */
export interface ManualSearchIndexEntry {
  /** Stable source task identifier */
  sectionId: ManualSectionId
  /** Verbatim source task title */
  sectionTitle: string
  /** One-based task position */
  sectionNumber: number
  /** Stable topic identifier */
  topicId: ManualContentId
  /** Verbatim source topic title */
  topicTitle: string
  /** One-based topic position within its task */
  topicNumber: number
  /** Semantic deep link to the topic */
  href: string
  /** Original searchable fragments retained for excerpts */
  segments: string[]
  /** Normalized topic title used for ranking */
  normalizedTitle: string
  /** Unicode-aware whole-word tokens used for matching and ranking */
  normalizedTokens: string[]
}

/** One topic-level manual search result. */
export interface ManualSearchResult {
  /** Stable source task identifier */
  sectionId: ManualSectionId
  /** Verbatim source task title */
  sectionTitle: string
  /** One-based task position */
  sectionNumber: number
  /** Stable topic identifier */
  topicId: ManualContentId
  /** Verbatim source topic title */
  topicTitle: string
  /** One-based topic position within its task */
  topicNumber: number
  /** Semantic deep link to the topic */
  href: string
  /** Short original-text fragment containing the strongest match */
  excerpt: string
}

/** A safe text fragment for rendering manual search highlighting as React nodes. */
export interface ManualSearchHighlightPart {
  /** Original source text */
  text: string
  /** Whether this source fragment matches one of the query terms */
  highlighted: boolean
}

/** One Unicode-aware whole-word token and its original-text location. */
export interface ManualSearchToken {
  /** Accent- and case-normalized whole word */
  normalized: string
  /** Inclusive UTF-16 offset in the original text */
  start: number
  /** Exclusive UTF-16 offset in the original text */
  end: number
}

/** One highlighted query term's original-text location. */
export interface ManualSearchMatchRange {
  /** Inclusive UTF-16 offset in the original text */
  start: number
  /** Exclusive UTF-16 offset in the original text */
  end: number
}
