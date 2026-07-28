import { format, resolveConfig } from "prettier"

/** Serialize a manual draft using the repository's canonical JSON formatting. */
export async function formatManualDraft(
  /** Generated structured manual draft */
  manual: unknown,
  /** Output path used to resolve formatting rules */
  outputPath: string,
): Promise<string> {
  const prettierConfig = await resolveConfig(outputPath)
  return format(JSON.stringify(manual), {
    ...prettierConfig,
    filepath: outputPath,
  })
}
