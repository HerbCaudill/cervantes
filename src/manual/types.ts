import type { MANUAL_SECTION_IDS } from "@/manual/constants"

/** Stable identifier retained across manual content revisions. */
export type ManualContentId = string

/** Stable identifier for a locally bundled manual figure. */
export type ManualAssetId = string

/** One of the five stable official task identifiers. */
export type ManualSectionId = (typeof MANUAL_SECTION_IDS)[number]

/** A locally bundled figure available to semantic content blocks. */
export interface ManualAsset {
  /** Stable identifier referenced by figure blocks */
  id: ManualAssetId
  /** Public path to the bundled offline asset */
  src: string
  /** Useful alternative text describing the figure */
  alt: string
}

/** The complete structured content and asset manifest for one manual edition. */
export interface Manual {
  /** Stable identifier for this manual edition */
  id: ManualContentId
  /** Official manual title */
  title: string
  /** Source edition label */
  edition: string
  /** URL of the official source document */
  sourceUrl: string
  /** Locally bundled figures referenced by the manual */
  assets: ManualAsset[]
  /** Ordered source tasks presented as reader sections */
  sections: ManualSection[]
}

/** One of the manual's five source tasks. */
export interface ManualSection {
  /** Stable identifier such as `task-1` */
  id: ManualSectionId
  /** Verbatim section heading */
  title: string
  /** Reader topics in source order */
  topics: ManualTopic[]
}

/** A deep-linkable reader page derived from a source heading. */
export interface ManualTopic {
  /** Stable identifier namespaced by its section */
  id: ManualContentId
  /** Verbatim topic heading */
  title: string
  /** Semantic content in source reading order */
  blocks: ManualBlock[]
}

/** A subheading retained within a topic. */
export interface HeadingBlock {
  /** Semantic block discriminator */
  type: "heading"
  /** Heading rank within the topic page */
  level: 2 | 3
  /** Verbatim heading text */
  text: string
}

/** A paragraph of verbatim manual prose. */
export interface ParagraphBlock {
  /** Semantic block discriminator */
  type: "paragraph"
  /** Verbatim paragraph text */
  text: string
}

/** A semantic source list with optional visible markers. */
export interface ListBlock {
  /** Semantic block discriminator */
  type: "list"
  /** Visual and semantic list style */
  style: "ordered" | "unordered" | "unmarked"
  /** Verbatim list items in source order */
  items: ListItem[]
}

/** Verbatim text or one parent item containing a nested source list. */
export type ListItem = string | NestedListItem

/** A source list item with semantically nested child items. */
export interface NestedListItem {
  /** Verbatim parent item text */
  text: string
  /** Child list belonging to this parent item */
  children: ListBlock
}

/** A source table with explicit labels for responsive rendering. */
export interface TableBlock {
  /** Semantic block discriminator */
  type: "table"
  /** Optional verbatim table caption */
  caption?: string
  /** Column labels used by both wide and stacked layouts */
  headers: string[]
  /** Data rows; null marks an intentionally empty source cell */
  rows: TableCell[][]
}

/** Verbatim table text or an explicitly empty source cell. */
export type TableCell = string | null

/** A source figure referenced through the manual's local asset manifest. */
export interface FigureBlock {
  /** Semantic block discriminator */
  type: "figure"
  /** Stable reference to a locally bundled manual asset */
  assetId: ManualAssetId
  /** Verbatim source caption */
  caption: string
}

/** Source content set apart in a sidebar or highlighted box. */
export interface CalloutBlock {
  /** Semantic block discriminator */
  type: "callout"
  /** Optional verbatim callout heading */
  title?: string
  /** Semantic content retained in callout reading order */
  blocks: CalloutContentBlock[]
}

/** Content forms supported inside a callout. */
export type CalloutContentBlock =
  | HeadingBlock
  | ParagraphBlock
  | ListBlock
  | TableBlock
  | FigureBlock

/** Any semantic source block supported by the manual reader. */
export type ManualBlock = CalloutContentBlock | CalloutBlock
