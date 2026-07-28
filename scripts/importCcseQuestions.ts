import { getDocument } from "pdfjs-dist/legacy/build/pdf.mjs"
import { EXPECTED_MANUAL_SHA256, EXPECTED_PAGE_COUNT, MANUAL_URL } from "./ccse-import/constants.ts"
import { downloadCcseManual } from "./ccse-import/downloadCcseManual.ts"
import { extractAnswerKey } from "./ccse-import/extractAnswerKey.ts"
import { extractQuestionsFromPdf } from "./ccse-import/extractQuestionsFromPdf.ts"
import { hashBytes } from "./ccse-import/hashBytes.ts"
import { mergeQuestionAnswers } from "./ccse-import/mergeQuestionAnswers.ts"
import { validateQuestionBank } from "./ccse-import/validateQuestionBank.ts"
import { writeQuestionBank } from "./ccse-import/writeQuestionBank.ts"

console.log(`Downloading ${MANUAL_URL}`)
const pdfData = await downloadCcseManual()
const sourceHash = hashBytes(pdfData)

if (sourceHash !== EXPECTED_MANUAL_SHA256) {
  throw new Error(`Downloaded manual has SHA-256 ${sourceHash}; expected ${EXPECTED_MANUAL_SHA256}`)
}

const loadingTask = getDocument({ data: pdfData })
const pdf = await loadingTask.promise

if (pdf.numPages !== EXPECTED_PAGE_COUNT) {
  throw new Error(`Downloaded manual has ${pdf.numPages} pages; expected ${EXPECTED_PAGE_COUNT}`)
}

const extractedQuestions = await extractQuestionsFromPdf(pdf)
const answerKey = await extractAnswerKey(pdf)

if (answerKey.size !== extractedQuestions.length) {
  throw new Error(`Extracted ${answerKey.size} answers for ${extractedQuestions.length} questions`)
}

const questions = mergeQuestionAnswers(extractedQuestions, answerKey)

validateQuestionBank(questions)
await writeQuestionBank(questions)
await loadingTask.destroy()

console.log(`Wrote ${questions.length} verified questions to src/data/questions.json`)
