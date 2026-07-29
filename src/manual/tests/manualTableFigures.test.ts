import { describe, expect, it } from "vitest"
import manualDraft from "@/manual/manual.draft.json"
import type { Manual } from "@/manual/types"

const manual = manualDraft as unknown as Manual
const blocks = manual.sections.flatMap(section => section.topics.flatMap(topic => topic.blocks))
const tables = blocks.filter(block => block.type === "table")

describe("manual table row figures", () => {
  it("associates Figures 47–54 with the intended Table 5 rows", () => {
    const table = tables.find(block => block.caption?.startsWith("TABLA 5."))

    expect(
      table?.rows.flatMap(
        row => row[2].figures?.map(figure => [row[0].text, figure.assetId]) ?? [],
      ),
    ).toEqual([
      ["1252", "figure-57-47"],
      ["1492", "figure-57-48"],
      ["Siglos XVI-XVII", "figure-58-49"],
      ["1936-1939", "figure-58-50"],
      ["1936-1939", "figure-58-51"],
      ["1939-1975", "figure-59-52"],
      ["1978", "figure-59-53"],
      ["1992", "figure-59-54"],
    ])
    expect(table?.rows.find(row => row[0].text === "1936-1939")?.[2].text).toContain(
      "La guerra civil española",
    )
  })

  it("associates the five holiday figures with their intended Table 6 rows", () => {
    const table = tables.find(block => block.caption?.startsWith("TABLA 6."))

    expect(
      table?.rows.flatMap(
        row => row[2].figures?.map(figure => [row[0].text, figure.assetId]) ?? [],
      ),
    ).toEqual([
      ["Fallas de Valencia", "figure-60-55"],
      ["Semana Santa", "figure-61-58"],
      ["Sant Jordi", "figure-62-59"],
      ["Sanfermines", "figure-62-61"],
      ["La Tomatina", "figure-62-60"],
    ])
    expect(table?.rows.find(row => row[0].text === "Fallas de Valencia")?.[2].text).toContain(
      "ninots",
    )
  })

  it("adds Figure 75 to Educación Infantil in Table 8", () => {
    const table = tables.find(block => block.caption?.startsWith("TABLA 8."))

    expect(table?.headers).toEqual(["Nivel educativo", "Descripción", "Imagen"])
    expect(table?.rows[0]).toMatchObject([
      { text: "Educación Infantil" },
      { text: expect.stringContaining("No es obligatoria") },
      {
        text: null,
        figures: [
          {
            assetId: "figure-77-75",
            caption: expect.stringContaining("FIGURA 75."),
          },
        ],
      },
    ])
    expect(table?.rows.slice(1).every(row => row[2].text === null)).toBe(true)
  })

  it("removes embedded standalone copies while preserving unrelated folklore figures", () => {
    const standaloneFigureIds = blocks.flatMap(block =>
      block.type === "figure" ? [block.assetId] : [],
    )
    const referencedFigureIds = blocks.flatMap(block => {
      if (block.type === "figure") return [block.assetId]
      if (block.type !== "table") return []
      return block.rows.flatMap(row =>
        row.flatMap(cell => cell.figures?.map(figure => figure.assetId) ?? []),
      )
    })

    expect(standaloneFigureIds).not.toEqual(
      expect.arrayContaining([
        "figure-57-47",
        "figure-57-48",
        "figure-58-49",
        "figure-58-50",
        "figure-58-51",
        "figure-59-52",
        "figure-59-53",
        "figure-59-54",
        "figure-60-55",
        "figure-61-58",
        "figure-62-59",
        "figure-62-60",
        "figure-62-61",
        "figure-77-75",
      ]),
    )
    expect(standaloneFigureIds).toEqual(expect.arrayContaining(["figure-60-56", "figure-61-57"]))
    expect(manual.assets).toHaveLength(110)
    expect(referencedFigureIds).toHaveLength(110)
    expect(new Set(referencedFigureIds)).toEqual(new Set(manual.assets.map(asset => asset.id)))
  })
})
