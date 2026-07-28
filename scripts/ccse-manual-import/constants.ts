import type { ManualSectionId } from "./types.ts"

/** Source pages containing explanatory content, excluding task questions and solutions. */
export const MANUAL_CONTENT_RANGES: ManualContentRange[] = [
  {
    id: "task-1",
    title: "Gobierno, legislación y participación ciudadana",
    firstPage: 6,
    lastPage: 17,
  },
  {
    id: "task-2",
    title: "Derechos y deberes fundamentales",
    firstPage: 28,
    lastPage: 32,
  },
  {
    id: "task-3",
    title: "Organización territorial de España. Geografía física y política",
    firstPage: 37,
    lastPage: 42,
  },
  {
    id: "task-4",
    title: "Cultura e historia de España",
    firstPage: 46,
    lastPage: 65,
  },
  {
    id: "task-5",
    title: "Sociedad española",
    firstPage: 70,
    lastPage: 91,
  },
]

/** One official task's explanatory page range. */
export interface ManualContentRange {
  /** Stable manual section ID */
  id: ManualSectionId
  /** Verbatim source task title */
  title: string
  /** First physical PDF page included */
  firstPage: number
  /** Last physical PDF page included */
  lastPage: number
}
