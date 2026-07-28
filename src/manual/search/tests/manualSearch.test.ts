import { describe, expect, it } from "vitest"
import { buildManualSearchIndex } from "@/manual/search/buildManualSearchIndex"
import { getManualSearchHighlightParts } from "@/manual/search/getManualSearchHighlightParts"
import { searchManualIndex } from "@/manual/search/searchManualIndex"
import type { Manual } from "@/manual/types"

const manual = {
  id: "manual-search-fixture",
  title: "Manual de prueba",
  edition: "2026",
  sourceUrl: "https://example.com/manual.pdf",
  assets: [
    {
      id: "figure-1",
      src: "/manual/figures/figure-1.jpg",
      alt: "Texto alternativo que no forma parte del índice",
    },
  ],
  sections: [
    {
      id: "task-1",
      title: "Derechos y deberes",
      topics: [
        {
          id: "task-1-constitution",
          title: "La Constitución española",
          blocks: [
            { type: "heading", level: 2, text: "Principios fundamentales" },
            {
              type: "paragraph",
              text: "La soberanía nacional reside en el pueblo español.",
            },
            {
              type: "paragraph",
              text: `${"Contexto anterior ".repeat(10)}palabraobjetivo ${"contexto posterior ".repeat(10)}`,
            },
            {
              type: "list",
              style: "unordered",
              items: ["La libertad", "La justicia"],
            },
            {
              type: "table",
              caption: "Organización territorial",
              headers: ["Institución", "Ámbito"],
              rows: [["Ayuntamiento", "Municipal"]],
            },
            {
              type: "figure",
              assetId: "figure-1",
              caption: "FIGURA 1. Congreso de los Diputados.",
            },
            {
              type: "callout",
              title: "Recuerde",
              blocks: [
                {
                  type: "paragraph",
                  text: "La mayoría de edad se alcanza a los dieciocho años.",
                },
              ],
            },
          ],
        },
        {
          id: "task-1-secondary",
          title: "Otras instituciones",
          blocks: [
            {
              type: "paragraph",
              text: "La Constitución española organiza las instituciones del Estado. Constitución.",
            },
          ],
        },
      ],
    },
  ],
} satisfies Manual

describe("manual search", () => {
  it.each([
    ["Principios fundamentales", "heading"],
    ["soberanía nacional", "paragraph"],
    ["libertad", "list item"],
    ["Organización territorial", "table caption"],
    ["Institución", "table header"],
    ["Ayuntamiento", "table cell"],
    ["Congreso de los Diputados", "figure caption"],
    ["Recuerde", "callout title"],
    ["dieciocho años", "nested callout prose"],
  ])("indexes %s from a %s", (query, _source) => {
    const results = searchManualIndex(buildManualSearchIndex(manual), query)

    expect(results.map(result => result.topicId)).toContain("task-1-constitution")
  })

  it("indexes the task heading for each topic-level result", () => {
    const results = searchManualIndex(buildManualSearchIndex(manual), "derechos deberes")

    expect(results.map(result => result.topicId)).toEqual([
      "task-1-constitution",
      "task-1-secondary",
    ])
  })

  it("matches Spanish accents, case, and repeated query whitespace", () => {
    const results = searchManualIndex(
      buildManualSearchIndex(manual),
      "  CONSTITUCION    ESPANOLA  ",
    )

    expect(results[0]).toMatchObject({
      topicId: "task-1-constitution",
      topicTitle: "La Constitución española",
      href: "/manual/task-1/la-constitucion-espanola-01",
    })
    expect(results[0]?.excerpt).toContain("Constitución española")
  })

  it("requires every query term while allowing them outside an exact phrase", () => {
    const results = searchManualIndex(buildManualSearchIndex(manual), "pueblo soberanía española")

    expect(results.map(result => result.topicId)).toEqual(["task-1-constitution"])
  })

  it("ranks title matches first and returns each topic only once", () => {
    const results = searchManualIndex(buildManualSearchIndex(manual), "constitución española")

    expect(results.map(result => result.topicId)).toEqual([
      "task-1-constitution",
      "task-1-secondary",
    ])
    expect(new Set(results.map(result => result.topicId)).size).toBe(results.length)
  })

  it("returns no results for an empty or unmatched query", () => {
    const index = buildManualSearchIndex(manual)

    expect(searchManualIndex(index, "  ")).toEqual([])
    expect(searchManualIndex(index, "texto que no existe")).toEqual([])
  })

  it("returns a short excerpt centered on a prose match", () => {
    const [result] = searchManualIndex(buildManualSearchIndex(manual), "palabraobjetivo")

    expect(result?.excerpt).toContain("palabraobjetivo")
    expect(result?.excerpt.length).toBeLessThanOrEqual(162)
    expect(result?.excerpt.startsWith("…")).toBe(true)
    expect(result?.excerpt.endsWith("…")).toBe(true)
  })

  it("preserves original accented text while identifying safe highlight spans", () => {
    expect(
      getManualSearchHighlightParts(
        "La Constitución ESPAÑOLA reconoce derechos.",
        "constitucion espanola",
      ),
    ).toEqual([
      { text: "La ", highlighted: false },
      { text: "Constitución", highlighted: true },
      { text: " ", highlighted: false },
      { text: "ESPAÑOLA", highlighted: true },
      { text: " reconoce derechos.", highlighted: false },
    ])
  })
})
