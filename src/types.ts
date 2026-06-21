/** The two question formats used on the CCSE exam. */
export type QuestionType = "true-false" | "multiple-choice"

/** The four self-assessment grades fed into the SM-2 scheduler. */
export type Grade = "again" | "hard" | "good" | "easy"

/**
 * A single CCSE question, normalized for the app. Both true/false and
 * multiple-choice questions share this shape: `options` holds the choices (for
 * true/false these are "Verdadero"/"Falso") and `answerIndex` points at the
 * correct one. Build these with `parseQuestions` from the raw import format.
 */
export interface Question {
  /** Stable unique id, kept across edits so review history stays attached */
  id: string
  /** Knowledge area / exam section key (see SECTION_LABELS); free-form for import */
  section: string
  /** Whether this is a true/false or multiple-choice question */
  type: QuestionType
  /** The question text shown to the user */
  prompt: string
  /** The selectable answers, in display order */
  options: string[]
  /** Index into `options` of the correct answer */
  answerIndex: number
  /** Optional explanation shown as feedback after answering */
  explanation?: string
}

/**
 * A raw question as authored in the import JSON. Kept deliberately easy to
 * bulk-write: true/false questions give a boolean `answer` and may omit
 * `options`; multiple-choice questions give an `options` array and a numeric
 * `answer` index. `parseQuestions` validates and normalizes these into `Question`.
 */
export type RawQuestion =
  | {
      id: string
      section: string
      type: "true-false"
      prompt: string
      /** true if the statement is correct ("Verdadero"), false otherwise */
      answer: boolean
      options?: [string, string]
      explanation?: string
    }
  | {
      id: string
      section: string
      type: "multiple-choice"
      prompt: string
      options: string[]
      /** index into `options` of the correct choice */
      answer: number
      explanation?: string
    }

/** The SM-2 spaced-repetition scheduling state for a single question. */
export interface ReviewState {
  /** id of the question this state belongs to */
  questionId: string
  /** Number of consecutive successful reviews */
  repetitions: number
  /** Ease factor controlling how fast intervals grow (min 1.3) */
  easeFactor: number
  /** Current interval in days until the next review */
  interval: number
  /** ISO date string for when the question is next due */
  due: string
}

/** Map of question id to its scheduling state, as persisted to storage. */
export type StateMap = Record<string, ReviewState>
