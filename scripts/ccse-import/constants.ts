import type { QuestionSection } from "./types.ts"

/** Official Instituto Cervantes preparation manual used for the import. */
export const MANUAL_URL =
  "https://examenes.cervantes.es/sites/default/files/manual-ccse-2026-def.pdf"

/** Expected page count of the pinned 2026 manual. */
export const EXPECTED_PAGE_COUNT = 102

/** SHA-256 of the official PDF, making source updates explicit. */
export const EXPECTED_MANUAL_SHA256 =
  "26c4e8d55e9e436090be40aa553a46399a3efbca20d39903af575471f7a7e0b9"

/** PDF pages containing the official answer key. */
export const ANSWER_PAGES = [99, 100, 101]

/** Question pages and app section keys for the five official CCSE tasks. */
export const QUESTION_SECTIONS: QuestionSection[] = [
  {
    section: "constitution-government",
    type: "multiple-choice",
    firstPage: 18,
    lastPage: 26,
    firstId: 1001,
    lastId: 1120,
  },
  {
    section: "rights-participation",
    type: "true-false",
    firstPage: 33,
    lastPage: 35,
    firstId: 2001,
    lastId: 2036,
  },
  {
    section: "territorial-organization",
    type: "multiple-choice",
    firstPage: 43,
    lastPage: 44,
    firstId: 3001,
    lastId: 3024,
  },
  {
    section: "culture-history",
    type: "multiple-choice",
    firstPage: 66,
    lastPage: 68,
    firstId: 4001,
    lastId: 4036,
  },
  {
    section: "society",
    type: "multiple-choice",
    firstPage: 92,
    lastPage: 98,
    firstId: 5001,
    lastId: 5084,
  },
]

/** Inclusive official ID ranges for the five tasks. */
export const QUESTION_ID_RANGES: ReadonlyArray<readonly [number, number]> = [
  [1001, 1120],
  [2001, 2036],
  [3001, 3024],
  [4001, 4036],
  [5001, 5084],
]
