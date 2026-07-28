import { describe, expect, it } from "vitest"
import { getVisibleManualBlocks } from "@/manual/getVisibleManualBlocks"
import { getManualBodyTextIndex } from "@/manual/getManualBodyTextIndex"
import { isDuplicatedManualCalloutText } from "@/manual/isDuplicatedManualCalloutText"
import manualDraft from "@/manual/manual.draft.json"
import { getManualBlockSearchSegments } from "@/manual/search/getManualBlockSearchSegments"
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

  it("removes contained body prose while retaining a meaningful unique callout suffix", () => {
    const uniqueSuffix =
      "La solicitud extraordinaria se presenta únicamente en la oficina provincial durante el mes de septiembre."
    const manual = createManual([
      paragraph(duplicatedQuote),
      callout([paragraph(`${duplicatedQuote} ${uniqueSuffix}`)]),
    ])

    expect(getVisibleManualBlocks(manual, manual.sections[0].topics[0].blocks)).toEqual([
      paragraph(duplicatedQuote),
      callout([paragraph(uniqueSuffix)]),
    ])
  })

  it("retains meaningful text on both sides of a substantial partial overlap", () => {
    const uniquePrefix =
      "La guía municipal añade una excepción aplicable solamente a solicitudes presentadas por correo."
    const sharedText =
      "Las personas interesadas deben acreditar su identidad y entregar la documentación original en el registro correspondiente."
    const uniqueSuffix =
      "La oficina devolverá los originales una vez que haya terminado formalmente la comprobación."
    const manual = createManual([
      paragraph(`El procedimiento general establece lo siguiente: ${sharedText}`),
      callout([paragraph(`${uniquePrefix} ${sharedText} ${uniqueSuffix}`)]),
    ])

    expect(getVisibleManualBlocks(manual, manual.sections[0].topics[0].blocks)).toEqual([
      paragraph(`El procedimiento general establece lo siguiente: ${sharedText}`),
      callout([paragraph(uniquePrefix), paragraph(uniqueSuffix)]),
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

  it("promotes unique children when their repeated parent is removed", () => {
    const uniqueChild =
      "La solicitud extraordinaria puede presentarse durante septiembre en la oficina provincial."
    const manual = createManual([
      paragraph(duplicatedQuote),
      callout([
        {
          type: "list",
          style: "unordered",
          items: [
            {
              text: duplicatedQuote,
              children: {
                type: "list",
                style: "unmarked",
                items: [uniqueChild],
              },
            },
          ],
        },
      ]),
    ])

    expect(getVisibleManualBlocks(manual, manual.sections[0].topics[0].blocks)).toEqual([
      paragraph(duplicatedQuote),
      callout([
        {
          type: "list",
          style: "unordered",
          items: [uniqueChild],
        },
      ]),
    ])
  })

  it("promotes unique descendants through multiple repeated list parents", () => {
    const secondRepeatedParent =
      "Las administraciones coordinan sus registros electrónicos para tramitar solicitudes presentadas desde cualquier provincia española."
    const uniqueGrandchild =
      "Las personas solicitantes reciben un justificante firmado al finalizar la entrega presencial."
    const manual = createManual([
      paragraph(duplicatedQuote),
      paragraph(secondRepeatedParent),
      callout([
        {
          type: "list",
          style: "unordered",
          items: [
            {
              text: duplicatedQuote,
              children: {
                type: "list",
                style: "unmarked",
                items: [
                  {
                    text: secondRepeatedParent,
                    children: {
                      type: "list",
                      style: "unmarked",
                      items: [uniqueGrandchild],
                    },
                  },
                ],
              },
            },
          ],
        },
      ]),
    ])

    expect(getVisibleManualBlocks(manual, manual.sections[0].topics[0].blocks)).toEqual([
      paragraph(duplicatedQuote),
      paragraph(secondRepeatedParent),
      callout([
        {
          type: "list",
          style: "unordered",
          items: [uniqueGrandchild],
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
    const bodyTextIndex = getManualBodyTextIndex(officialManual)
    const audit = officialManual.sections.map(section => {
      const sourceCallouts = section.topics.flatMap(topic =>
        topic.blocks.filter(block => block.type === "callout"),
      ).length
      const visibleCallouts = section.topics.flatMap(topic =>
        getVisibleManualBlocks(officialManual, topic.blocks, bodyTextIndex).filter(
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
      { sectionId: "task-1", sourceCallouts: 13, hiddenCallouts: 11, visibleCallouts: 2 },
      { sectionId: "task-2", sourceCallouts: 7, hiddenCallouts: 4, visibleCallouts: 3 },
      { sectionId: "task-3", sourceCallouts: 5, hiddenCallouts: 2, visibleCallouts: 3 },
      { sectionId: "task-4", sourceCallouts: 5, hiddenCallouts: 3, visibleCallouts: 2 },
      { sectionId: "task-5", sourceCallouts: 16, hiddenCallouts: 11, visibleCallouts: 5 },
    ])
  })

  it.each([
    ["task-1-comunidades-y-ciudades-autonomas", "La ley institucional básica de cada comunidad"],
    [
      "task-5-identificacion-personal-y-tramites-administrativos",
      "En España existen los permisos laborales por nacimiento",
    ],
    [
      "task-5-transporte-urbano-e-interurbano-en-espana",
      "En los últimos años hay menos accidentes mortales",
    ],
  ])("removes stitched pull quotes from %s", (topicId, duplicateText) => {
    const officialManual = manualDraft as Manual
    const topic = officialManual.sections
      .flatMap(section => section.topics)
      .find(candidate => candidate.id === topicId)

    expect(topic).toBeDefined()
    expect(
      getVisibleManualBlocks(officialManual, topic!.blocks)
        .filter(block => block.type === "callout")
        .flatMap(getManualBlockSearchSegments)
        .some(segment => segment.includes(duplicateText)),
    ).toBe(false)
  })

  it("leaves no visible callout segment with a substantial corpus overlap", () => {
    const officialManual = manualDraft as Manual
    const bodyTextIndex = getManualBodyTextIndex(officialManual)

    for (const section of officialManual.sections) {
      for (const topic of section.topics) {
        const calloutSegments = getVisibleManualBlocks(officialManual, topic.blocks, bodyTextIndex)
          .filter(block => block.type === "callout")
          .flatMap(getManualBlockSearchSegments)

        expect(
          calloutSegments.filter(segment => isDuplicatedManualCalloutText(segment, bodyTextIndex)),
          topic.id,
        ).toEqual([])
      }
    }
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
