import { describe, expect, it } from "vitest"
import { insertArtworkFigureBlocks } from "../insertArtworkFigureBlocks.ts"
import type { DraftManualBlock, FigureCrop } from "../types.ts"

describe("insertArtworkFigureBlocks", () => {
  it("replaces the family photo credit with its standalone source figure", () => {
    const blocks: DraftManualBlock[] = [
      {
        type: "callout",
        blocks: [{ type: "paragraph", text: "© Unsplash" }],
      },
    ]

    expect(insertArtworkFigureBlocks(blocks, [familyCrop])).toEqual([
      {
        type: "figure",
        assetId: "figure-72-family",
        caption: "© Unsplash",
      },
    ])
  })

  it("inserts the standalone emergency graphic before its adjacent source callout", () => {
    const emergencyText =
      "El número de teléfono 112 es gratuito y ofrece ayuda al ciudadano ante cualquier tipo de emergencia (sanitaria, incendio, salvamento o seguridad ciudadana) en la Unión Europea."
    const blocks: DraftManualBlock[] = [
      {
        type: "callout",
        blocks: [{ type: "paragraph", text: emergencyText }],
      },
    ]

    expect(insertArtworkFigureBlocks(blocks, [emergencyCrop])).toEqual([
      {
        type: "figure",
        assetId: "figure-82-emergency-112",
        caption: "112",
      },
      {
        type: "callout",
        blocks: [{ type: "paragraph", text: emergencyText }],
      },
    ])
  })
})

const familyCrop: FigureCrop = {
  assetId: "figure-72-family",
  caption: "© Unsplash",
  pageNumber: 72,
  bounds: [439.052765, 320.1968403, 562.2756673, 425.19683840000005],
}

const emergencyCrop: FigureCrop = {
  assetId: "figure-82-emergency-112",
  caption: "112",
  pageNumber: 82,
  bounds: [440, 290, 562, 410],
}
