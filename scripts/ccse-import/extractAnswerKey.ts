import type { PDFDocumentProxy } from "pdfjs-dist/legacy/build/pdf.mjs"
import { ANSWER_PAGES } from "./constants.ts"
import type { AnswerKey, PdfTextItem } from "./types.ts"

/** Extract every official answer letter from the manual's solution tables. */
export async function extractAnswerKey(
  /** Loaded Instituto Cervantes preparation manual */
  pdf: PDFDocumentProxy,
): Promise<AnswerKey> {
  const answers: AnswerKey = new Map()

  for (const pageNumber of ANSWER_PAGES) {
    const page = await pdf.getPage(pageNumber)
    const content = await page.getTextContent()
    const items: PdfTextItem[] = []

    for (const contentItem of content.items) {
      if (!("str" in contentItem) || contentItem.str.trim().length === 0) continue
      items.push(contentItem as PdfTextItem)
    }

    for (let index = 0; index < items.length - 1; index += 1) {
      const id = items[index].str.trim()
      const answer = items[index + 1].str.trim()

      if (!/^[1-5]\d{3}$/.test(id) || !/^[abc]$/.test(answer)) continue
      if (answers.has(id)) throw new Error(`Duplicate answer for question ${id}`)

      answers.set(id, answer as "a" | "b" | "c")
    }
  }

  return answers
}
