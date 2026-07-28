import type { RawQuestion } from "../../src/types.ts"
import type { AnswerKey, ExtractedQuestion } from "./types.ts"

/** Attach the official answer key and normalize questions for the app. */
export function mergeQuestionAnswers(
  /** Questions and choices extracted from the task pages */
  questions: ExtractedQuestion[],
  /** Official answer letter keyed by question ID */
  answers: AnswerKey,
): RawQuestion[] {
  return questions.map(question => {
    const answer = answers.get(question.id)
    if (!answer) throw new Error(`Missing answer for question ${question.id}`)

    if (question.type === "true-false") {
      if (question.options.length !== 2) {
        throw new Error(
          `Question ${question.id} has ${question.options.length} options; expected 2`,
        )
      }
      if (answer === "c") throw new Error(`True/false question ${question.id} has answer c`)

      return {
        id: question.id,
        section: question.section,
        type: question.type,
        prompt: question.prompt,
        answer: answer === "a",
      }
    }

    if (question.options.length !== 3) {
      throw new Error(`Question ${question.id} has ${question.options.length} options; expected 3`)
    }

    return {
      id: question.id,
      section: question.section,
      type: question.type,
      prompt: question.prompt,
      options: question.options,
      answer: answer.charCodeAt(0) - "a".charCodeAt(0),
    }
  })
}
