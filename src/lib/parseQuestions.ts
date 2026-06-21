import { parseQuestion } from "@/lib/parseQuestion"
import type { Question } from "@/types"

/**
 * Validate and normalize a raw imported array into `Question`s. Invalid entries
 * are skipped with a console warning rather than crashing the app, so one bad
 * row in a large bulk import doesn't block studying.
 */
export function parseQuestions(
  /** The parsed contents of the questions JSON file (untrusted shape) */
  input: unknown,
): Question[] {
  if (!Array.isArray(input)) {
    console.warn("parseQuestions: expected an array of questions")
    return []
  }

  const questions: Question[] = []
  for (const raw of input) {
    const question = parseQuestion(raw)
    if (question) questions.push(question)
    else console.warn("parseQuestions: skipping invalid question", raw)
  }
  return questions
}
