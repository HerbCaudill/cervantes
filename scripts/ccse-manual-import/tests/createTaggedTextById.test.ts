import { describe, expect, it } from "vitest"
import { createTaggedTextById } from "../createTaggedTextById.ts"

describe("createTaggedTextById", () => {
  it("keeps semantic marked content and removes untagged page furniture", () => {
    const textById = createTaggedTextById([
      { type: "beginMarkedContentProps", id: null, tag: "Artifact" },
      textItem("Manual de preparación de la prueba CCSE", 310, 794),
      { type: "endMarkedContent" },
      { type: "beginMarkedContentProps", id: "paragraph-1", tag: "P" },
      textItem("La Constitución española", 34, 700),
      textItem(" fue aprobada en referéndum.", 150, 700),
      { type: "endMarkedContent" },
    ])

    expect([...textById.entries()]).toEqual([
      [
        "paragraph-1",
        [
          { text: "La Constitución española", x: 34, y: 700 },
          { text: " fue aprobada en referéndum.", x: 150, y: 700 },
        ],
      ],
    ])
  })
})

/** Build the subset of a PDF.js text item used by the extractor. */
function textItem(
  /** Source text */
  str: string,
  /** Horizontal PDF coordinate */
  x: number,
  /** Vertical PDF coordinate */
  y: number,
) {
  return {
    str,
    dir: "ltr" as const,
    width: str.length,
    height: 12,
    transform: [12, 0, 0, 12, x, y],
    fontName: "fixture",
    hasEOL: false,
  }
}
