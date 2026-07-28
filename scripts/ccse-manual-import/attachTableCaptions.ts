import type { DraftManualBlock } from "./types.ts"

/** Move numbered source table captions onto the following semantic table. */
export function attachTableCaptions(
  /** Extracted blocks in source order */
  blocks: DraftManualBlock[],
): DraftManualBlock[] {
  const result = [...blocks]
  const captions = blocks
    .map((block, index) => ({ block, index }))
    .filter(
      (
        entry,
      ): entry is {
        block: Extract<DraftManualBlock, { type: "heading" | "paragraph" }>
        index: number
      } =>
        (entry.block.type === "heading" || entry.block.type === "paragraph") &&
        /^TABLA\s+\d+\.?/i.test(entry.block.text),
    )
  const assignedTables = new Set<number>()
  const assignedCaptions = new Set<number>()

  for (const caption of captions) {
    const candidates = blocks
      .map((block, index) => ({ block, index }))
      .filter(entry => entry.block.type === "table" && !assignedTables.has(entry.index))
      .sort(
        (left, right) =>
          Math.abs(left.index - caption.index) - Math.abs(right.index - caption.index),
      )
    const table = candidates[0]
    if (!table || table.block.type !== "table") continue
    result[table.index] = { ...table.block, caption: caption.block.text }
    assignedTables.add(table.index)
    assignedCaptions.add(caption.index)
  }

  return result.filter((_, index) => !assignedCaptions.has(index))
}
