import type { RawQuestion } from "../../src/types.ts"
import { QUESTION_ID_RANGES } from "./constants.ts"

/** Validate completeness, ordering, and answer shape before overwriting app data. */
export function validateQuestionBank(
  /** Fully normalized question bank ready for serialization */
  questions: RawQuestion[],
): void {
  const expectedIds = QUESTION_ID_RANGES.flatMap(([first, last]) =>
    Array.from({ length: last - first + 1 }, (_, index) => String(first + index)),
  )
  const actualIds = questions.map(({ id }) => id)

  if (actualIds.length !== expectedIds.length) {
    throw new Error(`Extracted ${actualIds.length} questions; expected ${expectedIds.length}`)
  }
  if (new Set(actualIds).size !== actualIds.length) {
    throw new Error("Extracted duplicate question IDs")
  }

  for (let index = 0; index < expectedIds.length; index += 1) {
    if (actualIds[index] !== expectedIds[index]) {
      throw new Error(
        `Expected question ${expectedIds[index]} at position ${index + 1}, found ${actualIds[index]}`,
      )
    }
  }

  for (const question of questions) {
    if (question.prompt.trim().length === 0) {
      throw new Error(`Question ${question.id} has an empty prompt`)
    }
    if (question.type === "multiple-choice" && question.options.some(option => !option.trim())) {
      throw new Error(`Question ${question.id} has an empty option`)
    }
  }
}
