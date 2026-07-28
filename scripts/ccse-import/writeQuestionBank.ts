import { writeFile } from "node:fs/promises"
import { fileURLToPath } from "node:url"
import { format, resolveConfig } from "prettier"
import type { RawQuestion } from "../../src/types.ts"

/** Serialize the verified question bank to the app's data file. */
export async function writeQuestionBank(
  /** Fully validated question bank */
  questions: RawQuestion[],
): Promise<void> {
  const outputUrl = new URL("../../src/data/questions.json", import.meta.url)
  const outputPath = fileURLToPath(outputUrl)
  const prettierConfig = await resolveConfig(outputPath)
  const json = await format(JSON.stringify(questions), {
    ...prettierConfig,
    filepath: outputPath,
  })
  await writeFile(outputUrl, json)
}
