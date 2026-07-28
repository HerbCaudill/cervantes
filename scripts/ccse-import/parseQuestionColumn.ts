import { appendWrappedText } from "./appendWrappedText.ts"
import type { ExtractedQuestion, PdfLine, QuestionDraft, QuestionSection } from "./types.ts"

/** Parse the visual lines from one PDF column into official questions. */
export function parseQuestionColumn(
  /** Top-to-bottom text lines from one page column */
  lines: PdfLine[],
  /** Task metadata applied to each parsed question */
  section: QuestionSection,
): ExtractedQuestion[] {
  const questions: ExtractedQuestion[] = []
  let current: QuestionDraft | undefined
  let optionLabelX: number | undefined
  const expectedLabels = section.type === "true-false" ? ["a", "b"] : ["a", "b", "c"]

  for (const line of lines) {
    const questionMatch = line.text.match(/^([1-5]\d{3})\s+(.+)$/)
    const possibleId = Number(questionMatch?.[1])
    const isQuestionId = possibleId >= section.firstId && possibleId <= section.lastId

    if (questionMatch && isQuestionId) {
      if (current) {
        if (current.options.length !== expectedLabels.length) {
          throw new Error(
            `Question ${current.id} has ${current.options.length} option labels; expected ${expectedLabels.join(", ")}`,
          )
        }
        questions.push(current)
      }

      current = {
        id: questionMatch[1],
        section: section.section,
        type: section.type,
        prompt: questionMatch[2],
        options: [],
      }
      optionLabelX = undefined
      continue
    }

    if (!current) continue

    const optionMatch = line.text.match(/^([abc])\.\s*(.*)$/)
    if (optionMatch) {
      const expectedLabel = expectedLabels[current.options.length]
      if (optionMatch[1] !== expectedLabel) {
        throw new Error(
          `Question ${current.id} has option ${optionMatch[1]}; expected ${expectedLabel ?? "no more options"}`,
        )
      }

      current.options.push(optionMatch[2])
      optionLabelX ??= line.x
      continue
    }

    if (current.options.length === 0) {
      current.prompt = appendWrappedText(current.prompt, line.text)
      continue
    }

    if (optionLabelX === undefined || line.x <= optionLabelX + 10) {
      throw new Error(`Unexpected text after an option in question ${current.id}: ${line.text}`)
    }

    const lastOptionIndex = current.options.length - 1
    current.options[lastOptionIndex] = appendWrappedText(
      current.options[lastOptionIndex],
      line.text,
    )
  }

  if (current) {
    if (current.options.length !== expectedLabels.length) {
      throw new Error(
        `Question ${current.id} has ${current.options.length} option labels; expected ${expectedLabels.join(", ")}`,
      )
    }
    questions.push(current)
  }

  return questions
}
