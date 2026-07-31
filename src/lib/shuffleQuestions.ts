import type { Question } from "@/types"

/** Return a shuffled copy of the questions using the Fisher-Yates algorithm. */
export function shuffleQuestions(
  /** Questions to shuffle without modifying the original array */
  questions: Question[],
): Question[] {
  const shuffled = [...questions]

  for (let index = shuffled.length - 1; index > 0; index--) {
    const swapIndex = Math.floor(Math.random() * (index + 1))
    ;[shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]]
  }

  return shuffled
}
