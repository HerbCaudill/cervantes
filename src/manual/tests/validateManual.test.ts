import { describe, expect, it } from "vitest"
import { validateManual } from "@/manual/validateManual"
import type { Manual } from "@/manual/types"

describe("validateManual", () => {
  it("accepts a manual containing every semantic content form", () => {
    expect(() => validateManual(createManual())).not.toThrow()
  })

  it.each([
    {
      name: "manual id",
      update: (manual: Manual) => {
        manual.id = " "
      },
    },
    {
      name: "manual title",
      update: (manual: Manual) => {
        manual.title = " "
      },
    },
    {
      name: "section title",
      update: (manual: Manual) => {
        manual.sections[0].title = " "
      },
    },
    {
      name: "topic title",
      update: (manual: Manual) => {
        manual.sections[0].topics[0].title = " "
      },
    },
    {
      name: "paragraph text",
      update: (manual: Manual) => {
        manual.sections[0].topics[0].blocks = [{ type: "paragraph", text: " " }]
      },
    },
    {
      name: "list item",
      update: (manual: Manual) => {
        manual.sections[0].topics[0].blocks = [
          { type: "list", style: "unordered", items: ["Contenido", " "] },
        ]
      },
    },
    {
      name: "callout content",
      update: (manual: Manual) => {
        manual.sections[0].topics[0].blocks = [
          { type: "callout", blocks: [{ type: "paragraph", text: " " }] },
        ]
      },
    },
  ])("rejects missing $name content", ({ update }) => {
    const manual = createManual()
    update(manual)

    expect(() => validateManual(manual)).toThrow(/empty|blank/i)
  })

  it("rejects a manual without sections", () => {
    const manual = createManual()
    manual.sections = []

    expect(() => validateManual(manual)).toThrow(/section/i)
  })

  it("rejects a section without topics", () => {
    const manual = createManual()
    manual.sections[0].topics = []

    expect(() => validateManual(manual)).toThrow(/topic/i)
  })

  it("rejects a topic without blocks", () => {
    const manual = createManual()
    manual.sections[0].topics[0].blocks = []

    expect(() => validateManual(manual)).toThrow(/empty topic/i)
  })

  it.each([
    {
      name: "cross-content",
      update: (manual: Manual) => {
        manual.assets[0].id = manual.sections[0].topics[0].id
      },
    },
    {
      name: "section",
      update: (manual: Manual) => {
        manual.sections.push({ ...manual.sections[0] })
      },
    },
    {
      name: "topic",
      update: (manual: Manual) => {
        manual.sections[0].topics.push({ ...manual.sections[0].topics[0] })
      },
    },
    {
      name: "asset",
      update: (manual: Manual) => {
        manual.assets.push({ ...manual.assets[0] })
      },
    },
  ])("rejects a duplicate $name id", ({ update }) => {
    const manual = createManual()
    update(manual)

    expect(() => validateManual(manual)).toThrow(/duplicate id/i)
  })

  it("rejects a table row with the wrong number of cells", () => {
    const manual = createManual()
    manual.sections[0].topics[0].blocks = [
      {
        type: "table",
        headers: ["Institución", "Sede"],
        rows: [["Congreso de los Diputados"]],
      },
    ]

    expect(() => validateManual(manual)).toThrow(/table.*2 cells/i)
  })

  it.each([
    {
      name: "headers",
      table: { type: "table" as const, headers: [], rows: [["Madrid"]] },
    },
    {
      name: "rows",
      table: { type: "table" as const, headers: ["Sede"], rows: [] },
    },
    {
      name: "blank cells",
      table: { type: "table" as const, headers: ["Sede"], rows: [[" "]] },
    },
  ])("rejects malformed tables with $name", ({ table }) => {
    const manual = createManual()
    manual.sections[0].topics[0].blocks = [table]

    expect(() => validateManual(manual)).toThrow(/table/i)
  })

  it("rejects a figure that refers to an unknown asset", () => {
    const manual = createManual()
    manual.sections[0].topics[0].blocks = [
      {
        type: "figure",
        assetId: "figure-missing",
        caption: "El Congreso de los Diputados.",
      },
    ]

    expect(() => validateManual(manual)).toThrow(/unknown asset/i)
  })

  it.each([
    {
      name: "source",
      update: (manual: Manual) => {
        manual.assets[0].src = " "
      },
    },
    {
      name: "alt text",
      update: (manual: Manual) => {
        manual.assets[0].alt = " "
      },
    },
    {
      name: "caption",
      update: (manual: Manual) => {
        const figure = manual.sections[0].topics[0].blocks.find(block => block.type === "figure")
        if (figure?.type === "figure") figure.caption = " "
      },
    },
  ])("rejects a figure with missing $name", ({ update }) => {
    const manual = createManual()
    update(manual)

    expect(() => validateManual(manual)).toThrow(/asset|figure/i)
  })
})

/** Build representative valid manual content for validator tests. */
function createManual(): Manual {
  return {
    id: "ccse-2026",
    title: "Manual para la preparación de la prueba CCSE",
    edition: "2026",
    sourceUrl: "https://example.com/manual.pdf",
    assets: [
      {
        id: "figure-congreso",
        src: "/manual/figures/congreso.webp",
        alt: "Fachada del Congreso de los Diputados",
      },
    ],
    sections: [
      {
        id: "task-1",
        title: "Tarea 1",
        topics: [
          {
            id: "task-1-poder-legislativo",
            title: "El poder legislativo",
            blocks: [
              { type: "heading", level: 2, text: "Las Cortes Generales" },
              { type: "paragraph", text: "Las Cortes Generales representan al pueblo español." },
              {
                type: "list",
                style: "unordered",
                items: ["El Congreso de los Diputados", "El Senado"],
              },
              {
                type: "table",
                caption: "Instituciones y sedes",
                headers: ["Institución", "Sede"],
                rows: [["Congreso de los Diputados", "Madrid"]],
              },
              {
                type: "figure",
                assetId: "figure-congreso",
                caption: "El Congreso de los Diputados.",
              },
              {
                type: "callout",
                title: "Importante",
                blocks: [
                  { type: "paragraph", text: "Las Cortes Generales tienen dos cámaras." },
                  { type: "list", style: "ordered", items: ["Congreso", "Senado"] },
                ],
              },
            ],
          },
        ],
      },
    ],
  }
}
