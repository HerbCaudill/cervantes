/** One text fragment associated with a tagged PDF content ID. */
export interface TaggedText {
  /** Extracted source text */
  text: string
  /** Horizontal PDF coordinate */
  x: number
  /** Vertical PDF coordinate */
  y: number
}

/** Text fragments keyed by tagged PDF content ID. */
export type TaggedTextById = ReadonlyMap<string, readonly TaggedText[]>

/** Structure-tree node returned by PDF.js, including optional accessibility metadata. */
export interface TaggedNode {
  /** Semantic PDF role */
  role?: string
  /** Structure content-reference kind */
  type?: string
  /** Text-layer content ID */
  id?: string
  /** Accessibility replacement text */
  alt?: string
  /** PDF-coordinate bounding box */
  bbox?: [number, number, number, number]
  /** Ordered semantic children */
  children?: TaggedNode[]
}

/** Semantic block with its source-column position during extraction. */
export interface LocatedManualBlock {
  /** Extracted manual block */
  block: DraftManualBlock
  /** Leftmost source coordinate */
  x: number
}

/** Rectangle in PDF points. */
export type PdfBounds = [number, number, number, number]

/** One numbered source figure to crop from a PDF page. */
export interface FigureCrop {
  /** Stable figure ID */
  assetId: string
  /** Verbatim numbered source caption */
  caption: string
  /** PDF page containing the figure */
  pageNumber: number
  /** Figure crop in PDF coordinates */
  bounds: PdfBounds
}

/** One image paint operation located in PDF coordinates. */
export interface PaintedImage {
  /** PDF-coordinate bounding box */
  bounds: PdfBounds
}

/** Locally bundled source figure. */
export interface DraftManualAsset {
  /** Stable figure ID */
  id: string
  /** Public asset path */
  src: string
  /** Useful alternative text */
  alt: string
}

/** Generated manual draft. */
export interface DraftManual {
  /** Stable edition ID */
  id: string
  /** Official source title */
  title: string
  /** Edition label */
  edition: string
  /** Official source URL */
  sourceUrl: string
  /** Ordered local figure manifest */
  assets: DraftManualAsset[]
  /** Five official task sections */
  sections: DraftManualSection[]
}

/** One official task section in the extraction draft. */
export interface DraftManualSection {
  /** Stable task ID */
  id: ManualSectionId
  /** Verbatim task title */
  title: string
  /** Page-oriented editorial draft topics */
  topics: DraftManualTopic[]
}

/** Stable identifiers for the five official tasks. */
export type ManualSectionId = "task-1" | "task-2" | "task-3" | "task-4" | "task-5"

/** One page-oriented editorial draft topic. */
export interface DraftManualTopic {
  /** Stable draft page ID */
  id: string
  /** Extracted heading or task fallback title */
  title: string
  /** Semantic source blocks */
  blocks: DraftManualBlock[]
}

/** Semantic source content emitted for editorial verification. */
export type DraftManualBlock =
  | DraftHeadingBlock
  | DraftParagraphBlock
  | DraftListBlock
  | DraftTableBlock
  | DraftFigureBlock

/** Tagged source heading. */
export interface DraftHeadingBlock {
  /** Block discriminator */
  type: "heading"
  /** Reader heading rank */
  level: 2 | 3
  /** Verbatim source text */
  text: string
}

/** Tagged source paragraph. */
export interface DraftParagraphBlock {
  /** Block discriminator */
  type: "paragraph"
  /** Verbatim source text */
  text: string
}

/** Tagged source list. */
export interface DraftListBlock {
  /** Block discriminator */
  type: "list"
  /** Ordered or unordered presentation */
  style: "ordered" | "unordered"
  /** Source list items */
  items: string[]
}

/** Tagged source table. */
export interface DraftTableBlock {
  /** Block discriminator */
  type: "table"
  /** Optional source caption */
  caption?: string
  /** Explicit column headers */
  headers: string[]
  /** Structured source table rows */
  rows: DraftTableCell[][]
}

/** One structured source table cell with optional associated figures. */
export interface DraftTableCell {
  /** Verbatim cell text; null marks an intentionally empty source cell */
  text: string | null
  /** Source figures associated with this row and column */
  figures?: DraftFigureBlock[]
}

/** Numbered source figure. */
export interface DraftFigureBlock {
  /** Block discriminator */
  type: "figure"
  /** Reference to a local crop */
  assetId: string
  /** Verbatim numbered caption */
  caption: string
}
