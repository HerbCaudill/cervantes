import rawQuestions from "@/data/questions.json"
import { parseQuestions } from "@/lib/parseQuestions"
import type { Question } from "@/types"

/**
 * The official CCSE question bank, generated from the Instituto Cervantes
 * preparation manual and normalized from `questions.json`.
 */
export const questions: Question[] = parseQuestions(rawQuestions)
