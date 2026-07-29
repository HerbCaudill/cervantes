import { describe, expect, it } from "vitest"
import { insertArtworkFigureBlocks } from "../insertArtworkFigureBlocks.ts"
import type { DraftManualBlock, FigureCrop } from "../types.ts"

describe("insertArtworkFigureBlocks", () => {
  it("retains the standalone family photo without its omitted sidebar credit block", () => {
    const blocks: DraftManualBlock[] = [{ type: "paragraph", text: "Permisos laborales." }]

    expect(insertArtworkFigureBlocks(blocks, [familyCrop])).toEqual([
      { type: "paragraph", text: "Permisos laborales." },
      {
        type: "figure",
        assetId: "figure-72-family",
        caption: "© Unsplash",
      },
    ])
  })

  it("inserts the standalone emergency graphic after its matching body prose", () => {
    const emergencyText =
      "El número de teléfono 112 es gratuito y ofrece ayuda al ciudadano ante cualquier tipo de emergencia (sanitaria, incendio, salvamento o seguridad ciudadana) en la Unión Europea."
    const blocks: DraftManualBlock[] = [
      {
        type: "paragraph",
        text: emergencyText,
      },
    ]

    expect(insertArtworkFigureBlocks(blocks, [emergencyCrop])).toEqual([
      {
        type: "paragraph",
        text: emergencyText,
      },
      {
        type: "figure",
        assetId: "figure-82-emergency-112",
        caption: "112",
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
