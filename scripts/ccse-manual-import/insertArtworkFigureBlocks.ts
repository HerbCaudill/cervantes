import type { DraftManualBlock, FigureCrop } from "./types.ts"

/** Insert unnumbered artwork figures immediately before their source metadata table. */
export function insertArtworkFigureBlocks(
  /** Extracted semantic page blocks */
  blocks: DraftManualBlock[],
  /** Numbered and unnumbered figure crops on the page */
  crops: FigureCrop[],
): DraftManualBlock[] {
  const artworks = crops.filter(crop => crop.assetId.includes("-artwork-"))

  return blocks.flatMap((block): DraftManualBlock[] => {
    if (block.type !== "table") return [block]
    const tableArtworks = block.headers.flatMap(header =>
      artworks.filter(crop => crop.caption === header || crop.caption.startsWith(`${header} —`)),
    )
    return [
      ...tableArtworks.map(crop => ({
        type: "figure" as const,
        assetId: crop.assetId,
        caption: crop.caption,
      })),
      block,
    ]
  })
}
