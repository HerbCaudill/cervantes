import type { PDFPageProxy } from "pdfjs-dist/legacy/build/pdf.mjs"
import { describe, expect, it } from "vitest"
import { createFigureCrops } from "../createFigureCrops.ts"
import type { TaggedNode, TaggedTextById } from "../types.ts"

describe("createFigureCrops", () => {
  it.each([
    [7, 1, [440, 688.89, 562, 770.39]],
    [13, 7, [34, 79.89, 562, 440.39]],
    [15, 8, [34.0157471, 379.0954075, 380.7874088, 606.2870139]],
  ] as const)(
    "uses the audited source bounds for figure-%s-%s",
    async (pageNumber, figureNumber, expectedBounds) => {
      const id = `caption-${pageNumber}-${figureNumber}`
      const page = createPage(pageNumber)
      const tree: TaggedNode = {
        role: "Root",
        children: [{ role: "P", children: [{ type: "content", id }] }],
      }
      const textById: TaggedTextById = new Map([
        [
          id,
          [
            {
              text: `FIGURA ${figureNumber}. Source caption`,
              x: pageNumber === 7 ? 430 : 34,
              y: 100,
            },
          ],
        ],
      ])

      const [crop] = await createFigureCrops(page, tree, textById)

      expect(crop.bounds).toEqual(expectedBounds)
    },
  )
})

/** Build the PDF.js surface used by crop inference without loading a document. */
function createPage(
  /** One-based source PDF page number */
  pageNumber: number,
): PDFPageProxy {
  return {
    pageNumber,
    view: [0, 0, 595.276, 841.89],
    getOperatorList: async () => ({ fnArray: [], argsArray: [] }),
  } as unknown as PDFPageProxy
}
