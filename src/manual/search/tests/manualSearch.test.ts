import { describe, expect, it } from "vitest"
import { buildManualSearchIndex } from "@/manual/search/buildManualSearchIndex"
import { getManualSearchHighlightParts } from "@/manual/search/getManualSearchHighlightParts"
import { getManualSearchTokens } from "@/manual/search/getManualSearchTokens"
import { searchManualIndex } from "@/manual/search/searchManualIndex"
import manualDraft from "@/manual/manual.draft.json"
import type { Manual, ManualBlock } from "@/manual/types"

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

  it("does not separately index a duplicated callout in another topic", () => {
    const repeatedText =
      "La soberanía nacional reside en el pueblo español y sostiene todas las instituciones democráticas establecidas por la Constitución."
    const duplicatedCalloutManual = structuredClone(manual) as Manual
    duplicatedCalloutManual.sections[0].topics[0].blocks.push({
      type: "paragraph",
      text: repeatedText,
    })
    duplicatedCalloutManual.sections[0].topics[1].blocks.push({
      type: "callout",
      blocks: [{ type: "paragraph", text: repeatedText }],
    })

    expect(
      searchManualIndex(
        buildManualSearchIndex(duplicatedCalloutManual),
        "sostiene instituciones",
      ).map(result => result.topicId),
    ).toEqual(["task-1-constitution"])
  })

  it("promotes unique nested-list children without indexing their repeated parent", () => {
    const repeatedParent =
      "La soberanía nacional reside en el pueblo español y sostiene todas las instituciones democráticas establecidas por la Constitución."
    const uniqueChild =
      "La oficina provincial entrega un justificante firmado para esta solicitud extraordinaria."
    const nestedCalloutManual = structuredClone(manual) as Manual
    nestedCalloutManual.sections[0].topics[0].blocks.push({
      type: "paragraph",
      text: repeatedParent,
    })
    nestedCalloutManual.sections[0].topics[1].blocks.push({
      type: "callout",
      blocks: [
        {
          type: "list",
          style: "unordered",
          items: [
            {
              text: repeatedParent,
              children: {
                type: "list",
                style: "unmarked",
                items: [uniqueChild],
              },
            },
          ],
        },
      ],
    })
    const index = buildManualSearchIndex(nestedCalloutManual)

    expect(searchManualIndex(index, "justificante firmado").map(result => result.topicId)).toEqual([
      "task-1-secondary",
    ])
    expect(
      searchManualIndex(index, "sostiene instituciones").map(result => result.topicId),
    ).toEqual(["task-1-constitution"])
  })

  it("indexes parent and recursively nested list item text", () => {
    const nestedManual = structuredClone(manual) as Manual
    nestedManual.sections[0].topics[0].blocks.push({
      type: "list",
      style: "unordered",
      items: [
        {
          text: "Casos de nacionalidad",
          children: {
            type: "list",
            style: "unmarked",
            items: ["Residencia bajo tutela"],
          },
        },
      ],
    } as unknown as ManualBlock)

    const index = buildManualSearchIndex(nestedManual)

    expect(searchManualIndex(index, "casos nacionalidad")[0]?.topicId).toBe("task-1-constitution")
    expect(searchManualIndex(index, "residencia tutela")[0]?.topicId).toBe("task-1-constitution")
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

  it("matches whole normalized words next to punctuation without matching substrings or plurals", () => {
    const punctuationManual = {
      ...manual,
      sections: [
        {
          ...manual.sections[0],
          topics: [
            {
              id: "task-1-year",
              title: "Fechas",
              blocks: [
                {
                  type: "paragraph",
                  text: "El año, termina; otros años continúan para el español.",
                },
              ],
            },
            {
              id: "task-1-festival",
              title: "Fiestas",
              blocks: [
                {
                  type: "paragraph",
                  text: "Los ninots forman parte de las Fallas.",
                },
              ],
            },
          ],
        },
      ],
    } satisfies Manual
    const index = buildManualSearchIndex(punctuationManual)

    expect(searchManualIndex(index, "ANO").map(result => result.topicId)).toEqual(["task-1-year"])
    expect(searchManualIndex(index, "años").map(result => result.topicId)).toEqual(["task-1-year"])
    expect(searchManualIndex(index, "niño")).toEqual([])
  })

  it("does not return real-manual español or ninots substring false positives", () => {
    const index = buildManualSearchIndex(manualDraft as Manual)
    const yearResults = searchManualIndex(index, "año")
    const childResults = searchManualIndex(index, "niño")
    const spanishOnlyTopic = index.find(
      entry =>
        entry.normalizedTokens.includes("espanol") && !entry.normalizedTokens.includes("ano"),
    )
    const ninotsOnlyTopic = index.find(
      entry =>
        entry.normalizedTokens.includes("ninots") && !entry.normalizedTokens.includes("nino"),
    )

    expect(spanishOnlyTopic).toBeDefined()
    expect(ninotsOnlyTopic).toBeDefined()
    expect(yearResults.length).toBeGreaterThan(0)
    expect(childResults.length).toBeGreaterThan(0)
    expect(yearResults.map(result => result.topicId)).not.toContain(spanishOnlyTopic?.topicId)
    expect(childResults.map(result => result.topicId)).not.toContain(ninotsOnlyTopic?.topicId)
    expect(
      yearResults.every(result =>
        index.find(entry => entry.topicId === result.topicId)?.normalizedTokens.includes("ano"),
      ),
    ).toBe(true)
    expect(
      childResults.every(result =>
        index.find(entry => entry.topicId === result.topicId)?.normalizedTokens.includes("nino"),
      ),
    ).toBe(true)
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

  it("highlights whole accented words without marking longer words or plurals", () => {
    expect(getManualSearchHighlightParts("español, años y año.", "ANO")).toEqual([
      { text: "español, años y ", highlighted: false },
      { text: "año", highlighted: true },
      { text: ".", highlighted: false },
    ])
    expect(getManualSearchHighlightParts("ninots y niño", "NIÑO")).toEqual([
      { text: "ninots y ", highlighted: false },
      { text: "niño", highlighted: true },
    ])
  })

  it.each([
    ["La tasa de paro fue del 10,29%.", "10,29", ["10", "29"]],
    ["Visitaron España 93,8 millones.", "93,8", ["93", "8"]],
    ["Institut d'Estudis Catalans", "d Estudis", ["d", "Estudis"]],
    ["Mossos d’Esquadra en Cataluña", "d Esquadra", ["d", "Esquadra"]],
  ])("reconstructs %s exactly after highlighting %s", (source, query, highlighted) => {
    const parts = getManualSearchHighlightParts(source, query)

    expect(parts.map(part => part.text).join("")).toBe(source)
    expect(parts.filter(part => part.highlighted).map(part => part.text)).toEqual(highlighted)
  })

  it.each([
    ["10,29", "10,29", ["10", "29"]],
    ["93,8", "93,8", ["93", "8"]],
    ["d'Estudis", "d Estudis", ["d", "Estudis"]],
    ["d’Esquadra", "d Esquadra", ["d", "Esquadra"]],
  ])("reconstructs the real manual segment containing %s exactly", (marker, query, highlighted) => {
    const source = buildManualSearchIndex(manualDraft as Manual)
      .flatMap(entry => entry.segments)
      .find(segment => segment.includes(marker))

    expect(source).toBeDefined()
    const parts = getManualSearchHighlightParts(source!, query)
    expect(parts.map(part => part.text).join("")).toBe(source)
    expect(parts.filter(part => part.highlighted).map(part => part.text)).toEqual(highlighted)
  })

  it.each([
    ["La tasa fue del 10,29%.", "29", ["29"]],
    ["Institut d'Estudis Catalans", "Estudis", ["Estudis"]],
  ])("highlights only the precise token in %s for %s", (source, query, highlighted) => {
    const parts = getManualSearchHighlightParts(source, query)

    expect(parts.map(part => part.text).join("")).toBe(source)
    expect(parts.filter(part => part.highlighted).map(part => part.text)).toEqual(highlighted)
  })

  it("retains precise UTF-16 offsets for punctuation and decomposed accents", () => {
    expect(getManualSearchTokens("10,29 d'Estudis nin\u0303o")).toEqual([
      { normalized: "10", start: 0, end: 2 },
      { normalized: "29", start: 3, end: 5 },
      { normalized: "d", start: 6, end: 7 },
      { normalized: "estudis", start: 8, end: 15 },
      { normalized: "nino", start: 16, end: 21 },
    ])
  })
})
