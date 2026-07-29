import { MANUAL_CONTENT_RANGES } from "./constants.ts"
import type { DraftManual } from "./types.ts"

/** Validate the extraction draft before it replaces committed content. */
export function validateGeneratedManual(
  /** Generated structured manual draft */
  manual: DraftManual,
): void {
  if (manual.sections.length !== MANUAL_CONTENT_RANGES.length) {
    throw new Error(`Expected ${MANUAL_CONTENT_RANGES.length} manual sections`)
  }

  const assetIds = new Set(manual.assets.map(asset => asset.id))
  if (assetIds.size !== manual.assets.length)
    throw new Error("Generated duplicate figure asset IDs")

  for (const section of manual.sections) {
    if (section.topics.length === 0) throw new Error(`Generated empty section "${section.id}"`)
    for (const topic of section.topics) {
      if (topic.blocks.length === 0) throw new Error(`Generated empty topic "${topic.id}"`)
      for (const block of topic.blocks) {
        if (block.type === "figure" && !assetIds.has(block.assetId)) {
          throw new Error(`Generated figure references unknown asset "${block.assetId}"`)
        }
        if (block.type === "table") {
          for (const row of block.rows) {
            if (row.length !== block.headers.length) {
              throw new Error(`Generated malformed table in topic "${topic.id}"`)
            }
            for (const cell of row) {
              for (const figure of cell.figures ?? []) {
                if (!assetIds.has(figure.assetId)) {
                  throw new Error(
                    `Generated table figure references unknown asset "${figure.assetId}"`,
                  )
                }
              }
            }
          }
        }
      }
    }
  }
}
