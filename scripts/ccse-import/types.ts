import type { QuestionType } from "../../src/types.ts"

/** A page column containing question text. */
export type PageColumn = "left" | "right"

/** Positioned text fragment returned by PDF.js. */
export interface PdfTextItem {
  /** Extracted text */
  str: string
  /** PDF transformation matrix containing horizontal and vertical coordinates */
  transform: number[]
  /** Fragment width in PDF coordinates */
  width: number
}

/** Reconstructed visual line with its left edge in PDF coordinates. */
export interface PdfLine {
  /** Reconstructed line text */
  text: string
  /** Horizontal coordinate of the line's leftmost text fragment */
  x: number
}

/** Configuration for one official CCSE task's question pages. */
export interface QuestionSection {
  /** Stable section key stored in the app's question bank */
  section: string
  /** Question format used throughout the task */
  type: QuestionType
  /** First PDF page containing questions for the task */
  firstPage: number
  /** Last PDF page containing questions for the task */
  lastPage: number
  /** First official question ID in the task */
  firstId: number
  /** Last official question ID in the task */
  lastId: number
}

/** A question extracted from the PDF before its answer is attached. */
export interface ExtractedQuestion {
  /** Official four-digit Instituto Cervantes question ID */
  id: string
  /** Stable section key used by the app */
  section: string
  /** Question format used by the task */
  type: QuestionType
  /** Question text reconstructed from wrapped PDF lines */
  prompt: string
  /** Answer choices reconstructed from wrapped PDF lines */
  options: string[]
}

/** Mutable question state used while parsing one page column. */
export interface QuestionDraft extends ExtractedQuestion {}

/** Official answer letter keyed by question ID. */
export type AnswerKey = Map<string, "a" | "b" | "c">
