import { describe, expect, it } from "vitest"
import { extractTaggedBlocks } from "../extractTaggedBlocks.ts"
import type { TaggedNode, TaggedTextById } from "../types.ts"

describe("extractTaggedBlocks", () => {
  it("retains tagged headings, prose, lists, and tables in source order", () => {
    const textById = createTextById({
      heading: "PODERES DEL ESTADO",
      prose: "La Constitución española fue aprobada en referéndum.",
      itemOne: "El respeto a los derechos humanos y las leyes.",
      itemTwo: "La protección de las diferencias de los pueblos de España.",
      headerOne: "Lengua",
      headerTwo: "Organismo",
      cellOne: "Castellano o español",
      cellTwo: "Real Academia Española",
    })
    const tree = node("Root", [
      node("H2", [content("heading")]),
      node("P", [content("prose")]),
      node("L", [
        node("LI", [node("LBody", [content("itemOne")])]),
        node("LI", [node("LBody", [content("itemTwo")])]),
      ]),
      node("Table", [
        node("TR", [node("TH", [content("headerOne")]), node("TH", [content("headerTwo")])]),
        node("TR", [node("TD", [content("cellOne")]), node("TD", [content("cellTwo")])]),
      ]),
    ])

    expect(extractTaggedBlocks(tree, textById)).toEqual([
      { type: "heading", level: 2, text: "PODERES DEL ESTADO" },
      {
        type: "paragraph",
        text: "La Constitución española fue aprobada en referéndum.",
      },
      {
        type: "list",
        style: "unordered",
        items: [
          "El respeto a los derechos humanos y las leyes.",
          "La protección de las diferencias de los pueblos de España.",
        ],
      },
      {
        type: "table",
        headers: ["Lengua", "Organismo"],
        rows: [["Castellano o español", "Real Academia Española"]],
      },
    ])
  })

  it("uses table captions and numbered figure captions as semantic metadata", () => {
    const textById = createTextById({
      tableCaption: "TABLA 1. Instituciones para la normalización de las lenguas españolas",
      header: "Lengua",
      cell: "Gallego",
      figureCaption: "FIGURA 14. Volcán de El Teide, Tenerife, Islas Canarias.",
    })
    const tree = node("Root", [
      node("P", [content("tableCaption")]),
      node("Table", [
        node("TR", [node("TH", [content("header")])]),
        node("TR", [node("TD", [content("cell")])]),
      ]),
      node("P", [content("figureCaption")]),
    ])

    expect(extractTaggedBlocks(tree, textById)).toEqual([
      {
        type: "table",
        caption: "TABLA 1. Instituciones para la normalización de las lenguas españolas",
        headers: ["Lengua"],
        rows: [["Gallego"]],
      },
      {
        type: "figure",
        assetId: "figure-14",
        caption: "FIGURA 14. Volcán de El Teide, Tenerife, Islas Canarias.",
      },
    ])
  })

  it("retains a figure caption whose source omits the space after FIGURA", () => {
    const textById = createTextById({
      figureCaption: "FIGURA90 AVE son los trenes de alta velocidad de Renfe.",
    })

    expect(
      extractTaggedBlocks(node("Root", [node("P", [content("figureCaption")])]), textById),
    ).toEqual([
      {
        type: "figure",
        assetId: "figure-90",
        caption: "FIGURA90 AVE son los trenes de alta velocidad de Renfe.",
      },
    ])
  })

  it("retains right-column source text as a callout", () => {
    const textById: TaggedTextById = new Map([
      [
        "callout",
        [
          {
            text: "El Reino de España es un Estado social y democrático de Derecho.",
            x: 440,
            y: 700,
          },
        ],
      ],
    ])

    expect(extractTaggedBlocks(node("Root", [node("P", [content("callout")])]), textById)).toEqual([
      {
        type: "callout",
        blocks: [
          {
            type: "paragraph",
            text: "El Reino de España es un Estado social y democrático de Derecho.",
          },
        ],
      },
    ])
  })
})

/** Build a structure tree node for a focused extraction fixture. */
function node(
  /** Tagged PDF role */
  role: string,
  /** Ordered child nodes */
  children: TaggedNode[],
): TaggedNode {
  return { role, children }
}

/** Build a tagged PDF content reference. */
function content(
  /** Text-layer content ID */
  id: string,
): TaggedNode {
  return { type: "content", id }
}

/** Build tagged text at the main-column coordinate. */
function createTextById(
  /** Text keyed by tagged PDF content ID */
  values: Record<string, string>,
): TaggedTextById {
  return new Map(
    Object.entries(values).map(([id, text], index) => [id, [{ text, x: 34, y: 700 - index * 20 }]]),
  )
}
