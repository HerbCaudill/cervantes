import { describe, expect, it } from "vitest"
import manualDraft from "@/manual/manual.draft.json"
import type { Manual } from "@/manual/types"
import { validateManual } from "@/manual/validateManual"

describe("manual extraction draft", () => {
  it("matches the reader schema after deterministic extraction", () => {
    expect(() => validateManual(manualDraft as Manual)).not.toThrow()
  })

  it("retains every numbered table as structured content", () => {
    const tables = manualDraft.sections.flatMap(section =>
      section.topics.flatMap(topic => topic.blocks.filter(block => block.type === "table")),
    )
    const tableNumbers = tables
      .flatMap(table =>
        table.type === "table" ? [table.caption?.match(/^TABLA\s+(\d+)/)?.[1]] : [],
      )
      .filter(Boolean)

    expect(new Set(tableNumbers)).toEqual(
      new Set(["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11"]),
    )
    expect(
      tables.find(table => table.type === "table" && table.caption?.startsWith("TABLA 2."))?.type,
    ).toBe("table")
    expect(
      tables.find(table => table.type === "table" && table.caption?.startsWith("TABLA 3."))?.type,
    ).toBe("table")
  })

  it("retains every unnumbered artwork as its own referenced asset", () => {
    const expectedTitles = [
      "San Francisco en oración",
      "Las meninas",
      "Los fusilamientos del 3 de mayo",
      "La maja desnuda",
      "Guernica",
      "Paseo a la orilla del mar",
      "Logotipo de Turespaña",
      "La verbena",
      "Figura en una ventana",
      "Madrid desde Capitán Haya",
    ]
    const artworkAssets = manualDraft.assets.filter(asset => asset.id.includes("-artwork-"))
    const referencedAssetIds = new Set(
      manualDraft.sections.flatMap(section =>
        section.topics.flatMap(topic =>
          topic.blocks.flatMap(block =>
            block.type === "figure" && "assetId" in block ? [block.assetId] : [],
          ),
        ),
      ),
    )

    expect(artworkAssets.map(asset => asset.alt.split(" — ")[0])).toEqual(expectedTitles)
    expect(artworkAssets.every(asset => referencedAssetIds.has(asset.id))).toBe(true)
  })
})
