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

  return blocks.flatMap((block): DraftManualBlock[] => {
    const calloutText =
      block.type === "callout" && block.blocks[0]?.type === "paragraph" ?
        block.blocks[0].text
      : undefined
    if (family && calloutText === family.caption) {
      return [{ type: "figure", assetId: family.assetId, caption: family.caption }]
    }
    if (emergency && calloutText?.startsWith("El número de teléfono 112 es gratuito")) {
      return [{ type: "figure", assetId: emergency.assetId, caption: emergency.caption }, block]
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
}
