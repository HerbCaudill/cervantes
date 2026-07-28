import { OPS } from "pdfjs-dist/legacy/build/pdf.mjs"
import type { PDFPageProxy } from "pdfjs-dist/legacy/build/pdf.mjs"
import { multiplyPdfMatrices } from "./multiplyPdfMatrices.ts"
import type { PaintedImage } from "./types.ts"

/** Locate raster paint operations on a PDF page without decoding their pixels. */
export async function extractPaintedImages(
  /** Loaded PDF page */
  page: PDFPageProxy,
): Promise<PaintedImage[]> {
  const operations = await page.getOperatorList()
  const matrices: number[][] = []
  let matrix = [1, 0, 0, 1, 0, 0]
  const images: PaintedImage[] = []

  for (let index = 0; index < operations.fnArray.length; index += 1) {
    const operation = operations.fnArray[index]
    if (operation === OPS.save) {
      matrices.push([...matrix])
    } else if (operation === OPS.restore) {
      matrix = matrices.pop() ?? matrix
    } else if (operation === OPS.transform) {
      matrix = multiplyPdfMatrices(matrix, operations.argsArray[index])
    } else if (
      operation === OPS.paintImageXObject ||
      operation === OPS.paintInlineImageXObject ||
      operation === OPS.paintImageXObjectRepeat
    ) {
      const corners = [
        [matrix[4], matrix[5]],
        [matrix[0] + matrix[4], matrix[1] + matrix[5]],
        [matrix[2] + matrix[4], matrix[3] + matrix[5]],
        [matrix[0] + matrix[2] + matrix[4], matrix[1] + matrix[3] + matrix[5]],
      ]
      const xs = corners.map(([x]) => x)
      const ys = corners.map(([, y]) => y)
      images.push({
        bounds: [Math.min(...xs), Math.min(...ys), Math.max(...xs), Math.max(...ys)],
      })
    }
  }

  return images
}
