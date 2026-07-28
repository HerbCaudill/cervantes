import { describe, expect, it } from "vitest"
import { getVisibleManualBlocks } from "@/manual/getVisibleManualBlocks"
import manualDraft from "@/manual/manual.draft.json"
import type { CalloutBlock, ListBlock, Manual, ManualBlock, ParagraphBlock } from "@/manual/types"

const duplicatedQuote =
  "La ciudadanía participa en las decisiones públicas mediante elecciones libres celebradas periódicamente en todo el territorio español."

const longerBodyParagraph = `Según la Constitución, ${duplicatedQuote} Este derecho sostiene el funcionamiento de las instituciones democráticas.`

const uniqueQuote =
  "Las oficinas consulares prestan asistencia a los ciudadanos españoles que se encuentran temporalmente en el extranjero."

describe("visible manual blocks", () => {
  it("removes a callout paragraph that exactly duplicates body prose", () => {
    const manual = createManual([paragraph(duplicatedQuote), callout([paragraph(duplicatedQuote)])])

    expect(getVisibleManualBlocks(manual, manual.sections[0].topics[0].blocks)).toEqual([
      paragraph(duplicatedQuote),
    ])
  })

  it("removes a callout paragraph contained within a longer body paragraph", () => {
    const manual = createManual([
      paragraph(longerBodyParagraph),
      callout([paragraph(duplicatedQuote)]),
    ])

    expect(getVisibleManualBlocks(manual, manual.sections[0].topics[0].blocks)).toEqual([
      paragraph(longerBodyParagraph),
    ])
  })

  it("recognizes duplicated prose from another topic", () => {
    const manual = createManual(
      [paragraph(duplicatedQuote)],
      [
        {
          id: "task-1-second",
          title: "Segundo tema",
          blocks: [callout([paragraph(duplicatedQuote)])],
        },
      ],
    )

    expect(getVisibleManualBlocks(manual, manual.sections[0].topics[1].blocks)).toEqual([])
  })

  it("recognizes duplicated prose from another section", () => {
    const manual = createManual([paragraph(duplicatedQuote)])
    manual.sections.push({
      id: "task-2",
      title: "Segunda tarea",
      topics: [
        {
          id: "task-2-first",
          title: "Tema de otra tarea",
          blocks: [callout([paragraph(duplicatedQuote)])],
        },
      ],
    })

    expect(getVisibleManualBlocks(manual, manual.sections[1].topics[0].blocks)).toEqual([])
  })

  it("normalizes accents, punctuation, case, and whitespace before comparison", () => {
    const body =
      "La participación ciudadana garantiza también la representación democrática en las instituciones públicas de España."
    const repeated =
      "  LA PARTICIPACION   ciudadana garantiza tambien la representacion democratica en las instituciones publicas de Espana! "
    const manual = createManual([paragraph(body), callout([paragraph(repeated)])])

    expect(getVisibleManualBlocks(manual, manual.sections[0].topics[0].blocks)).toEqual([
      paragraph(body),
    ])
  })

  it("keeps short repeated fragments that could match incidentally", () => {
    const shortFragment = "Madrid es la capital de España."
    const manual = createManual([
      paragraph(`El manual recuerda que ${shortFragment}`),
      callout([paragraph(shortFragment)]),
    ])

    expect(getVisibleManualBlocks(manual, manual.sections[0].topics[0].blocks)).toEqual([
      paragraph(`El manual recuerda que ${shortFragment}`),
      callout([paragraph(shortFragment)]),
    ])
  })

  it("keeps unique blocks while removing duplicated blocks from a mixed callout", () => {
    const manual = createManual([
      paragraph(duplicatedQuote),
      callout([paragraph(duplicatedQuote), paragraph(uniqueQuote)], "Recuerde"),
    ])

    expect(getVisibleManualBlocks(manual, manual.sections[0].topics[0].blocks)).toEqual([
      paragraph(duplicatedQuote),
      callout([paragraph(uniqueQuote)], "Recuerde"),
    ])
  })

  it("filters duplicated items from nested callout lists without hiding unique siblings", () => {
    const uniqueNestedItem =
      "Las personas residentes pueden presentar sus solicitudes en cualquiera de las oficinas públicas habilitadas para este trámite."
    const nestedList: ListBlock = {
      type: "list",
      style: "unordered",
      items: [
        {
          text: uniqueQuote,
          children: {
            type: "list",
            style: "unmarked",
            items: [duplicatedQuote, uniqueNestedItem],
          },
        },
      ],
    }
    const manual = createManual([paragraph(duplicatedQuote), callout([nestedList])])

    expect(getVisibleManualBlocks(manual, manual.sections[0].topics[0].blocks)).toEqual([
      paragraph(duplicatedQuote),
      callout([
        {
          type: "list",
          style: "unordered",
          items: [
            {
              text: uniqueQuote,
              children: {
                type: "list",
                style: "unmarked",
                items: [uniqueNestedItem],
              },
            },
          ],
        },
      ]),
    ])
  })

  it("keeps a genuinely unique callout unchanged", () => {
    const manual = createManual([
      paragraph(duplicatedQuote),
      callout([paragraph(uniqueQuote)], "Importante"),
    ])

    expect(getVisibleManualBlocks(manual, manual.sections[0].topics[0].blocks)).toEqual(
      manual.sections[0].topics[0].blocks,
    )
  })

  it("audits duplicated callouts across all five official tasks", () => {
    const officialManual = manualDraft as Manual
    const audit = officialManual.sections.map(section => {
      const sourceCallouts = section.topics.flatMap(topic =>
        topic.blocks.filter(block => block.type === "callout"),
      ).length
      const visibleCallouts = section.topics.flatMap(topic =>
        getVisibleManualBlocks(officialManual, topic.blocks).filter(
          block => block.type === "callout",
        ),
      ).length

      return {
        sectionId: section.id,
        sourceCallouts,
        hiddenCallouts: sourceCallouts - visibleCallouts,
        visibleCallouts,
      }
    })

    expect(audit).toEqual([
      { sectionId: "task-1", sourceCallouts: 13, hiddenCallouts: 10, visibleCallouts: 3 },
      { sectionId: "task-2", sourceCallouts: 7, hiddenCallouts: 1, visibleCallouts: 6 },
      { sectionId: "task-3", sourceCallouts: 5, hiddenCallouts: 1, visibleCallouts: 4 },
      { sectionId: "task-4", sourceCallouts: 5, hiddenCallouts: 2, visibleCallouts: 3 },
      { sectionId: "task-5", sourceCallouts: 16, hiddenCallouts: 7, visibleCallouts: 9 },
    ])
  })
})

/** Create a compact valid manual for visibility behavior tests. */
function createManual(
  /** Blocks belonging to the first topic */
  blocks: ManualBlock[],
  /** Additional topics in the first section */
  additionalTopics: Manual["sections"][number]["topics"] = [],
): Manual {
  return {
    id: "visibility-fixture",
    title: "Manual de prueba",
    edition: "2026",
    sourceUrl: "https://example.com/manual.pdf",
    assets: [],
    sections: [
      {
        id: "task-1",
        title: "Primera tarea",
        topics: [
          {
            id: "task-1-first",
            title: "Primer tema",
            blocks,
          },
          ...additionalTopics,
        ],
      },
    ],
  }
}

/** Create a semantic paragraph block. */
function paragraph(
  /** Paragraph text */
  text: string,
): ParagraphBlock {
  return { type: "paragraph", text }
}

/** Create a semantic callout block. */
function callout(
  /** Callout contents */
  blocks: CalloutBlock["blocks"],
  /** Optional callout title */
  title?: string,
): CalloutBlock {
  return { type: "callout", blocks, ...(title ? { title } : {}) }
}
