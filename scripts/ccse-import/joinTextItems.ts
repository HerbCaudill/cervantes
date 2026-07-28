import type { PdfTextItem } from "./types.ts"

/** Reconstruct one visual PDF line from positioned PDF.js text items. */
export function joinTextItems(
  /** Text items sharing the same vertical position */
  items: PdfTextItem[],
): string {
  const sortedItems = [...items].sort((left, right) => left.transform[4] - right.transform[4])
  let line = ""
  let previousRight: number | undefined

  for (const item of sortedItems) {
    const x = Number(item.transform[4])
    const gap = previousRight === undefined ? 0 : x - previousRight
    const needsSpace = line.length > 0 && !/\s$/.test(line) && !/^\s/.test(item.str) && gap > 1.5

    if (needsSpace) line += " "
    line += item.str
    previousRight = x + item.width
  }

  return line.trim().replace(/\s+/g, " ")
}
