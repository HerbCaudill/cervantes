import type { DraftManualBlock, FigureCrop } from "./types.ts"

/** Insert artwork grids and audited standalone visuals in source reading order. */
export function insertArtworkFigureBlocks(
  /** Extracted semantic page blocks */
  blocks: DraftManualBlock[],
  /** Numbered and unnumbered figure crops on the page */
  crops: FigureCrop[],
): DraftManualBlock[] {
  const artworks = crops.filter(crop => crop.assetId.includes("-artwork-"))
  const family = crops.find(crop => crop.assetId === "figure-72-family")
  const emergency = crops.find(crop => crop.assetId === "figure-82-emergency-112")

  const orderedBlocks = blocks.flatMap((block): DraftManualBlock[] => {
    if (
      emergency &&
      block.type === "paragraph" &&
      block.text.startsWith("El número de teléfono 112 es gratuito")
    ) {
      return [block, { type: "figure", assetId: emergency.assetId, caption: emergency.caption }]
    }
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

  if (!family) return orderedBlocks
  return [...orderedBlocks, { type: "figure", assetId: family.assetId, caption: family.caption }]
}
