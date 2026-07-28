import { describe, expect, it } from "vitest"
import { createArtworkFigureCrops } from "../createArtworkFigureCrops.ts"
import type { PaintedImage, TaggedNode, TaggedTextById } from "../types.ts"

describe("createArtworkFigureCrops", () => {
  it("associates each unnumbered artwork with its table column and excludes sidebar figures", () => {
    const textById = createTextById({
      titleOne: "San Francisco en oración",
      titleTwo: "Las meninas",
      artistOne: "Francisco de Zurbarán (1598-1664)",
      artistTwo: "Diego Rodríguez de Silva y Velázquez (1599-1660)",
      museumOne: "Museo del Prado Madrid",
      museumTwo: "Museo del Prado Madrid",
    })
    const tree: TaggedNode = {
      role: "Root",
      children: [
        {
          role: "Table",
          bbox: [34, 385, 381, 493],
          children: [
            {
              role: "THead",
              children: [
                row("TH", ["titleOne", "titleTwo"]),
                row("TH", ["artistOne", "artistTwo"]),
              ],
            },
            { role: "TBody", children: [row("TD", ["museumOne", "museumTwo"])] },
          ],
        },
      ],
    }
    const images: PaintedImage[] = [
      { bounds: [34, 509, 200, 725] },
      { bounds: [215, 536, 381, 725] },
      { bounds: [439, 560, 563, 727] },
    ]

    expect(createArtworkFigureCrops(tree, textById, images, 53)).toEqual([
      {
        assetId: "figure-53-artwork-1",
        caption:
          "San Francisco en oración — Francisco de Zurbarán (1598-1664) — Museo del Prado Madrid",
        pageNumber: 53,
        bounds: [30, 505, 204, 729],
      },
      {
        assetId: "figure-53-artwork-2",
        caption:
          "Las meninas — Diego Rodríguez de Silva y Velázquez (1599-1660) — Museo del Prado Madrid",
        pageNumber: 53,
        bounds: [211, 532, 385, 729],
      },
    ])
  })

  it("infers a crop for a vector artwork in an otherwise matched art grid", () => {
    const textById = createTextById({
      titleOne: "Paseo a la orilla del mar",
      titleTwo: "Logotipo de Turespaña",
      artistOne: "Joaquín Sorolla (1863-1923)",
      artistTwo: "Joan Miró (1893-1983)",
      museumOne: "Casa Museo Sorolla Madrid",
      museumTwo: "Mural del Palacio de Congresos de Madrid",
    })
    const tree: TaggedNode = {
      role: "Root",
      children: [
        {
          role: "Table",
          bbox: [34, 85, 381, 192],
          children: [
            {
              role: "THead",
              children: [
                row("TH", ["titleOne", "titleTwo"]),
                row("TH", ["artistOne", "artistTwo"]),
              ],
            },
            { role: "TBody", children: [row("TD", ["museumOne", "museumTwo"])] },
          ],
        },
      ],
    }

    expect(createArtworkFigureCrops(tree, textById, [{ bounds: [33, 238, 202, 455] }], 54)).toEqual(
      [
        {
          assetId: "figure-54-artwork-1",
          caption:
            "Paseo a la orilla del mar — Joaquín Sorolla (1863-1923) — Casa Museo Sorolla Madrid",
          pageNumber: 54,
          bounds: [29, 234, 206, 459],
        },
        {
          assetId: "figure-54-artwork-2",
          caption:
            "Logotipo de Turespaña — Joan Miró (1893-1983) — Mural del Palacio de Congresos de Madrid",
          pageNumber: 54,
          bounds: [207.5, 200, 381, 462],
        },
      ],
    )
  })
})

/** Build a tagged table row from content IDs. */
function row(
  /** Cell role */
  cellRole: "TH" | "TD",
  /** Cell content IDs */
  ids: string[],
): TaggedNode {
  return {
    role: "TR",
    children: ids.map(id => ({ role: cellRole, children: [{ type: "content", id }] })),
  }
}

/** Build tagged text at deterministic coordinates. */
function createTextById(
  /** Source text keyed by tagged content ID */
  values: Record<string, string>,
): TaggedTextById {
  return new Map(
    Object.entries(values).map(([id, text], index) => [
      id,
      [{ text, x: index % 2 === 0 ? 34 : 215, y: 480 - Math.floor(index / 2) * 20 }],
    ]),
  )
}
