import { describe, expect, it } from "vitest"
import { embedTableRowFigures } from "../embedTableRowFigures.ts"
import type { DraftManualSection } from "../types.ts"

describe("embedTableRowFigures", () => {
  it("moves holiday figures into matching Table 6 rows across topic boundaries", () => {
    const sections: DraftManualSection[] = [
      {
        id: "task-4",
        title: "Tarea 4",
        topics: [
          {
            id: "task-4-page-60",
            title: "Folclore",
            blocks: [
              {
                type: "figure",
                assetId: "figure-60-56",
                caption: "FIGURA 56. Sevilla. El baile.",
              },
              {
                type: "figure",
                assetId: "figure-60-55",
                caption: "FIGURA 55. Mascletá en Valencia. © MrCarlos11",
              },
            ],
          },
          {
            id: "task-4-page-61",
            title: "Fiestas",
            blocks: [
              {
                type: "table",
                caption: "TABLA 6. Fiestas españolas más conocidas",
                headers: ["Fiestas", "Fecha y localidad", "Símbolos relacionados con las fiestas"],
                rows: [
                  [
                    { text: "Fallas de Valencia" },
                    { text: "Se celebran en marzo." },
                    { text: "Símbolos: ninots." },
                  ],
                ],
              },
            ],
          },
        ],
      },
    ]

    const result = embedTableRowFigures(sections)
    const sourceBlocks = result[0].topics[0].blocks
    const table = result[0].topics[1].blocks[0]

    expect(sourceBlocks).toEqual([
      {
        type: "figure",
        assetId: "figure-60-56",
        caption: "FIGURA 56. Sevilla. El baile.",
      },
    ])
    expect(table).toMatchObject({
      type: "table",
      rows: [
        [
          { text: "Fallas de Valencia" },
          { text: "Se celebran en marzo." },
          {
            text: "Símbolos: ninots.",
            figures: [
              {
                type: "figure",
                assetId: "figure-60-55",
                caption: "FIGURA 55. Mascletá en Valencia. © MrCarlos11",
              },
            ],
          },
        ],
      ],
    })
    expect(embedTableRowFigures(result)).toEqual(result)
  })

  it("keeps both Civil War figures in source order without replacing Table 5 prose", () => {
    const sections: DraftManualSection[] = [
      {
        id: "task-4",
        title: "Tarea 4",
        topics: [
          {
            id: "task-4-history",
            title: "Historia",
            blocks: [
              {
                type: "table",
                caption: "TABLA 5. Acontecimientos relevantes en la historia de España",
                headers: ["Fecha", "Época histórica", "Descripción"],
                rows: [
                  [
                    { text: "1936-1939" },
                    { text: "Guerra Civil" },
                    { text: "La guerra civil española fue un conflicto bélico." },
                  ],
                ],
              },
              {
                type: "figure",
                assetId: "figure-58-50",
                caption: "FIGURA 50. Artilleros republicanos.",
              },
              {
                type: "figure",
                assetId: "figure-58-51",
                caption: "FIGURA 51. Entrada de las tropas nacionales.",
              },
            ],
          },
        ],
      },
    ]

    const result = embedTableRowFigures(sections)
    const blocks = result[0].topics[0].blocks
    const table = blocks[0]

    expect(blocks).toHaveLength(1)
    expect(table).toMatchObject({
      type: "table",
      rows: [
        [
          { text: "1936-1939" },
          { text: "Guerra Civil" },
          {
            text: "La guerra civil española fue un conflicto bélico.",
            figures: [{ assetId: "figure-58-50" }, { assetId: "figure-58-51" }],
          },
        ],
      ],
    })
  })

  it("adds a media column to Table 8 and associates Figure 75 only with Educación Infantil", () => {
    const sections: DraftManualSection[] = [
      {
        id: "task-5",
        title: "Tarea 5",
        topics: [
          {
            id: "task-5-education",
            title: "Educación",
            blocks: [
              {
                type: "table",
                caption: "TABLA 8. Sistema educativo español",
                headers: ["Nivel educativo", "Descripción"],
                rows: [
                  [{ text: "Educación Infantil" }, { text: "No es obligatoria." }],
                  [{ text: "Educación Primaria" }, { text: "Es obligatoria." }],
                ],
              },
              {
                type: "figure",
                assetId: "figure-77-75",
                caption: "FIGURA 75. La educación infantil no es obligatoria.",
              },
            ],
          },
        ],
      },
    ]

    const result = embedTableRowFigures(sections)
    const blocks = result[0].topics[0].blocks
    const table = blocks[0]

    expect(blocks).toHaveLength(1)
    expect(table).toMatchObject({
      type: "table",
      headers: ["Nivel educativo", "Descripción", "Imagen"],
      rows: [
        [
          { text: "Educación Infantil" },
          { text: "No es obligatoria." },
          {
            text: null,
            figures: [
              {
                type: "figure",
                assetId: "figure-77-75",
                caption: "FIGURA 75. La educación infantil no es obligatoria.",
              },
            ],
          },
        ],
        [{ text: "Educación Primaria" }, { text: "Es obligatoria." }, { text: null }],
      ],
    })
  })
})
