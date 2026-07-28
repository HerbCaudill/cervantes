import { writeFile } from "node:fs/promises"
import type { RawQuestion } from "../../src/types.ts"

/** Serialize the verified question bank to the app's data file. */
export async function writeQuestionBank(
  /** Fully validated question bank */
  questions: RawQuestion[],
): Promise<void> {
  const outputUrl = new URL("../../src/data/questions.json", import.meta.url)
  await writeFile(outputUrl, `${JSON.stringify(questions, null, 2)}\n`)
}
