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
  "figure-37-14": [439.055505, 380.1968405, 562.4361336, 530.1968384],
  "figure-38-15": [34.0157471, 495.4513616, 380.7084426, 770.1968962999999],
  "figure-38-16": [34.2261101, 90.451291, 380.49815390000003, 365.19682680000005],
  "figure-38-17": [440.0786743, 687.7823911, 561.4237404, 770.1959228000001],
  "figure-39-18": [439.0516038, 680.1968642, 562.2932372, 770.1959229],
  "figure-39-19": [34.0157471, 94.1826139, 380.7874384, 291.24187770000003],
  "figure-40-20": [34.015728, 79.1508469, 380.78740530000005, 246.2029525],
  "figure-40-21": [40.1056976, 506.2195359, 374.6618868, 770.1959349],
  "figure-40-22": [439.0473847, 275.1968762, 562.2885042, 410.1968689],
  "figure-41-23": [439.0702561, 573.5917856, 562.2726508, 650.1968383999999],
  "figure-41-24": [440.0787659, 305.1968631, 561.2598522000001, 456.2240144],
  "figure-41-25": [440.0653076, 94.3110328, 561.2464054, 185.1968536],
  "figure-42-26": [438.9321463, 692.5052262, 562.3232556, 770.1959229],
  "figure-42-27": [439.0128571, 395.1968423, 562.2988649, 575.1968384],
  "figure-42-28": [440.0787354, 110.1968776, 561.2598231000001, 291.2147131],
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
