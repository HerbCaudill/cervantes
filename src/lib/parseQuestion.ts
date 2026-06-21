import { TRUE_FALSE_OPTIONS } from "@/constants"
import type { Question } from "@/types"

/**
 * Validate and normalize a single raw imported entry into a `Question`, or
 * return null if it's malformed. True/false entries (boolean `answer`, optional
 * `options`) and multiple-choice entries (`options` array, numeric `answer`
 * index) are both accepted and produce the uniform internal shape.
 */
export function parseQuestion(
  /** A single untrusted entry from the import array */
  raw: unknown,
): Question | null {
  if (typeof raw !== "object" || raw === null) return null
  const r = raw as Record<string, unknown>

  if (typeof r.id !== "string" || typeof r.prompt !== "string") return null
  if (typeof r.section !== "string") return null

  const base = {
    id: r.id,
    section: r.section,
    prompt: r.prompt,
    explanation: typeof r.explanation === "string" ? r.explanation : undefined,
  }

  if (r.type === "true-false") {
    if (typeof r.answer !== "boolean") return null
    const options =
      Array.isArray(r.options) && r.options.length === 2 ?
        (r.options as [string, string])
      : TRUE_FALSE_OPTIONS
    return { ...base, type: "true-false", options, answerIndex: r.answer ? 0 : 1 }
  }

  if (r.type === "multiple-choice") {
    if (!Array.isArray(r.options) || r.options.length < 2) return null
    if (!r.options.every(o => typeof o === "string")) return null
    if (typeof r.answer !== "number" || r.answer < 0 || r.answer >= r.options.length) return null
    return {
      ...base,
      type: "multiple-choice",
      options: r.options as string[],
      answerIndex: r.answer,
    }
  }

  return null
}
