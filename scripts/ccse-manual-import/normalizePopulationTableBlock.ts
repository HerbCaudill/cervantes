import type { DraftManualBlock } from "./types.ts"

/** Normalize the source population table while leaving every other manual block unchanged. */
export function normalizePopulationTableBlock(
  /** Extracted manual block */
  block: DraftManualBlock,
): DraftManualBlock {
  if (
    block.type !== "table" ||
    block.caption !== "TABLA 2. Número de habitantes por comunidades autónomas"
  )
    return block

  const pairCount = Math.ceil(block.headers.length / 2)
  const rows = Array.from({ length: pairCount }, (_, pairIndex) =>
    block.rows
      .map(row => [row[pairIndex * 2] ?? null, row[pairIndex * 2 + 1] ?? null])
      .filter(row => row[0] !== null && row[1] !== null),
  ).flat()

  return {
    ...block,
    headers: ["Comunidades y ciudades autónomas", "Población"],
    rows,
  }
}
