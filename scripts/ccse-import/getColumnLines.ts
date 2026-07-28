import type { PDFPageProxy } from "pdfjs-dist/legacy/build/pdf.mjs"
import { joinTextItems } from "./joinTextItems.ts"
import type { PageColumn, PdfLine, PdfTextItem } from "./types.ts"

/** Extract top-to-bottom text lines from one question-page column. */
export async function getColumnLines(
  /** PDF page containing one or two columns of questions */
  page: PDFPageProxy,
  /** Half of the page to extract */
  column: PageColumn,
): Promise<PdfLine[]> {
  const content = await page.getTextContent()
  const pageWidth = page.getViewport({ scale: 1 }).width
  const midpoint = pageWidth / 2
  const lines = new Map<number, PdfTextItem[]>()

  for (const contentItem of content.items) {
    if (!("str" in contentItem) || contentItem.str.length === 0) continue

    const item = contentItem as PdfTextItem
    const x = Number(item.transform[4])
    const y = Number(item.transform[5])
    const isInColumn = column === "left" ? x < midpoint : x >= midpoint
    const isQuestionArea = y > 50 && y < 780

    if (!isInColumn || !isQuestionArea) continue

    const yKey = Math.round(y * 10) / 10
    const lineItems = lines.get(yKey) ?? []
    lineItems.push(item)
    lines.set(yKey, lineItems)
  }

  return [...lines.entries()]
    .sort(([leftY], [rightY]) => rightY - leftY)
    .map(([, items]) => ({
      text: joinTextItems(items),
      x: Math.min(...items.map(item => Number(item.transform[4]))),
    }))
    .filter(({ text }) => text.length > 0)
}
