import { writeFile } from "node:fs/promises"
import { fileURLToPath } from "node:url"
import { formatManualDraft } from "./formatManualDraft.ts"
import type { DraftManual } from "./types.ts"

/** Write a generated manual draft with canonical repository formatting. */
export async function writeManualDraft(
  /** Fully validated extraction draft */
  manual: DraftManual,
): Promise<void> {
  const outputUrl = new URL("../../src/manual/manual.draft.json", import.meta.url)
  const outputPath = fileURLToPath(outputUrl)
  await writeFile(outputUrl, await formatManualDraft(manual, outputPath))
}
