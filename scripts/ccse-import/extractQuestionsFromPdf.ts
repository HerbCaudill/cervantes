import type { PDFDocumentProxy } from "pdfjs-dist/legacy/build/pdf.mjs"
import { getColumnLines } from "./getColumnLines.ts"
import { parseQuestionColumn } from "./parseQuestionColumn.ts"
import { QUESTION_SECTIONS } from "./constants.ts"
import type { ExtractedQuestion, PageColumn } from "./types.ts"

/** Extract all question text and options from the official task pages. */
export async function extractQuestionsFromPdf(
  /** Loaded Instituto Cervantes preparation manual */
  pdf: PDFDocumentProxy,
): Promise<ExtractedQuestion[]> {
  const questions: ExtractedQuestion[] = []

  for (const section of QUESTION_SECTIONS) {
    for (let pageNumber = section.firstPage; pageNumber <= section.lastPage; pageNumber += 1) {
      const page = await pdf.getPage(pageNumber)
      const columns: PageColumn[] = pageNumber === section.firstPage ? ["right"] : ["left", "right"]

      for (const column of columns) {
        const lines = await getColumnLines(page, column)
        questions.push(...parseQuestionColumn(lines, section))
      }
    }
  }

  return questions.sort((left, right) => Number(left.id) - Number(right.id))
}
