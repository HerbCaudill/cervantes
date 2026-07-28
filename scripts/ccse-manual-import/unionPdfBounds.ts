import type { PdfBounds } from "./types.ts"

/** Return the smallest PDF rectangle containing all supplied bounds. */
export function unionPdfBounds(
  /** Bounds to combine */
  bounds: PdfBounds[],
): PdfBounds {
  return [
    Math.min(...bounds.map(value => value[0])),
    Math.min(...bounds.map(value => value[1])),
    Math.max(...bounds.map(value => value[2])),
    Math.max(...bounds.map(value => value[3])),
  ]
}
