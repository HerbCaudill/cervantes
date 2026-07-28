import { extractTableBlock } from "./extractTableBlock.ts"
import { findTaggedNodesByRole } from "./findTaggedNodesByRole.ts"
import type { FigureCrop, PaintedImage, PdfBounds, TaggedNode, TaggedTextById } from "./types.ts"

/** Associate unnumbered artwork images with the caption metadata in nearby table columns. */
export function createArtworkFigureCrops(
  /** Root tagged PDF structure node */
  tree: TaggedNode,
  /** Extracted text keyed by structure content ID */
  textById: TaggedTextById,
  /** Located raster images on the page */
  paintedImages: PaintedImage[],
  /** Physical PDF page number */
  pageNumber: number,
): FigureCrop[] {
  const crops: FigureCrop[] = []

  for (const table of findTaggedNodesByRole(tree, "Table")) {
    if (!table.bbox) continue
    const tableHead = findTaggedNodesByRole(table, "THead")[0]
    if (!tableHead || findTaggedNodesByRole(tableHead, "TR").length !== 2) continue
    const block = extractTableBlock(table, textById)
    if (!block) continue
    const [left, , right, top] = table.bbox
    const candidates = paintedImages.filter(image => {
      const centerX = (image.bounds[0] + image.bounds[2]) / 2
      const verticalGap = image.bounds[1] - top
      return centerX >= left && centerX <= right && verticalGap >= 0 && verticalGap <= 200
    })
    if (candidates.length === 0) continue

    const available = [...candidates]
    for (let column = 0; column < block.headers.length; column += 1) {
      const columnLeft = left + (column / block.headers.length) * (right - left)
      const columnRight = left + ((column + 1) / block.headers.length) * (right - left)
      const expectedX = (columnLeft + columnRight) / 2
      const columnImages = available.filter(image => {
        const centerX = (image.bounds[0] + image.bounds[2]) / 2
        return centerX >= columnLeft && centerX <= columnRight
      })
      const closest = columnImages.reduce<PaintedImage | undefined>((best, image) => {
        if (!best) return image
        const bestX = (best.bounds[0] + best.bounds[2]) / 2
        const imageX = (image.bounds[0] + image.bounds[2]) / 2
        return Math.abs(imageX - expectedX) < Math.abs(bestX - expectedX) ? image : best
      }, undefined)
      if (closest) available.splice(available.indexOf(closest), 1)

      const metadata = [
        block.headers[column],
        ...block.rows.map(row => row[column]).filter((value): value is string => value !== null),
      ]
      const bounds: PdfBounds =
        closest ?
          [
            Math.max(0, closest.bounds[0] - 4),
            Math.max(0, closest.bounds[1] - 4),
            closest.bounds[2] + 4,
            closest.bounds[3] + 4,
          ]
        : [
            columnLeft,
            top + 8,
            columnRight,
            Math.max(...candidates.map(candidate => candidate.bounds[3])) + 7,
          ]
      crops.push({
        assetId: `figure-${pageNumber}-artwork-${crops.length + 1}`,
        caption: metadata.join(" — "),
        pageNumber,
        bounds,
      })
    }
  }

  return crops
}
