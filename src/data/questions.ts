import rawQuestions from "@/data/questions.json"
import { parseQuestions } from "@/lib/parseQuestions"
import type { Question } from "@/types"

/**
 * The full CCSE question bank, normalized from `questions.json`. To grow the
 * bank, add entries to that JSON file (see `src/data/README.md` for the format)
 * — nothing else needs to change.
 */
export const questions: Question[] = parseQuestions(rawQuestions)
