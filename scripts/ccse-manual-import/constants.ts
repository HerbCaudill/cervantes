import type { ManualSectionId, PdfBounds } from "./types.ts"

/** Visually audited bounds for numbered figures whose PDF structure omits the full artwork. */
export const NUMBERED_FIGURE_CROP_OVERRIDES: Readonly<Partial<Record<string, PdfBounds>>> = {
  "figure-7-1": [440, 688.89, 562, 770.39],
  "figure-13-7": [34, 79.89, 562, 440.39],
  "figure-15-8": [34.0157471, 379.0954075, 380.7874088, 606.2870139],
  "figure-28-9": [440.0786743, 354.2464858, 561.4237517, 530.1968384],
  "figure-30-10": [440.0786743, 605.8112586, 561.423747, 770.1959228],
  "figure-30-11": [440.0787053, 139.1782001, 561.4237671000001, 289.7359619],
  "figure-31-12": [439.016429, 110.1977618, 562.4297955, 275.1968384],
  "figure-32-13": [32.9673863, 79.1732251, 381.8399157, 410.1968689],
}

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
