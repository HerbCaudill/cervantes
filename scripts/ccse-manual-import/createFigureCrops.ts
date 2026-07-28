import type { PDFPageProxy } from "pdfjs-dist/legacy/build/pdf.mjs"
import { NUMBERED_FIGURE_CROP_OVERRIDES, STANDALONE_FIGURE_CROPS } from "./constants.ts"
import { createArtworkFigureCrops } from "./createArtworkFigureCrops.ts"
import { extractPaintedImages } from "./extractPaintedImages.ts"
import { findFigureCaptionNodes } from "./findFigureCaptionNodes.ts"
import { findTaggedNodesByRole } from "./findTaggedNodesByRole.ts"
import { getTaggedNodeText } from "./getTaggedNodeText.ts"
import { getTaggedNodeX } from "./getTaggedNodeX.ts"
import { getTaggedNodeY } from "./getTaggedNodeY.ts"
import type { FigureCrop, PdfBounds, TaggedNode, TaggedTextById } from "./types.ts"
import { unionPdfBounds } from "./unionPdfBounds.ts"

/** Infer render crops for numbered figures, artwork grids, and audited standalone visuals. */
export async function createFigureCrops(
  /** Loaded PDF page */
  page: PDFPageProxy,
  /** Root tagged PDF structure node */
  tree: TaggedNode,
  /** Extracted text keyed by structure content ID */
  textById: TaggedTextById,
): Promise<FigureCrop[]> {
  const captions = findFigureCaptionNodes(tree, textById).map(node => {
    const caption = getTaggedNodeText(node, textById)
    const match = caption.match(/^FIGURA\s*(\d+)\.?/i)
    if (!match) throw new Error(`Could not parse figure caption "${caption}"`)
    return {
      assetId: `figure-${page.pageNumber}-${Number(match[1])}`,
      caption,
      x: getTaggedNodeX(node, textById),
      y: getTaggedNodeY(node, textById),
      bounds: [] as PdfBounds[],
    }
  })
  const taggedFigures = findTaggedNodesByRole(tree, "Figure").filter(node => node.bbox)
  const paintedImages = await extractPaintedImages(page)
  const artworkCrops = createArtworkFigureCrops(tree, textById, paintedImages, page.pageNumber)
  const unassignedImages = paintedImages.filter(
    image =>
      !artworkCrops.some(
        crop =>
          crop.bounds[0] + 4 === image.bounds[0] &&
          crop.bounds[1] + 4 === image.bounds[1] &&
          crop.bounds[2] - 4 === image.bounds[2] &&
          crop.bounds[3] - 4 === image.bounds[3],
      ),
  )

  for (const visual of [
    ...taggedFigures.map(node => ({ bounds: node.bbox! })),
    ...unassignedImages,
  ]) {
    if (captions.length === 0) continue
    const centerX = (visual.bounds[0] + visual.bounds[2]) / 2
    const closest = captions.reduce((best, caption) => {
      const bestDistance =
        Math.abs((best.x < 410 ? 205 : 500) - centerX) + Math.abs(best.y - visual.bounds[1])
      const distance =
        Math.abs((caption.x < 410 ? 205 : 500) - centerX) + Math.abs(caption.y - visual.bounds[1])
      return distance < bestDistance ? caption : best
    })
    closest.bounds.push(visual.bounds)
  }

  const [, , pageWidth, pageHeight] = page.view
  const numberedCrops = captions.map(caption => {
    const inferred: PdfBounds =
      caption.x < 410 ?
        [30, caption.y + 14, Math.min(390, pageWidth - 20), Math.min(caption.y + 300, 775)]
      : [430, caption.y + 14, Math.min(570, pageWidth - 20), Math.min(caption.y + 120, 775)]
    const bounds = caption.bounds.length > 0 ? unionPdfBounds(caption.bounds) : inferred
    const padded: PdfBounds = [
      Math.max(0, bounds[0] - 4),
      Math.max(0, bounds[1] - 4),
      Math.min(pageWidth, bounds[2] + 4),
      Math.min(pageHeight, bounds[3] + 18),
    ]
    return {
      assetId: caption.assetId,
      caption: caption.caption,
      pageNumber: page.pageNumber,
      bounds: NUMBERED_FIGURE_CROP_OVERRIDES[caption.assetId] ?? padded,
    }
  })

  const standaloneCrops = STANDALONE_FIGURE_CROPS.filter(
    crop => crop.pageNumber === page.pageNumber,
  )

  return [...numberedCrops, ...artworkCrops, ...standaloneCrops].sort((left, right) => {
    const topDifference = right.bounds[3] - left.bounds[3]
    return Math.abs(topDifference) <= 30 ? left.bounds[0] - right.bounds[0] : topDifference
  })
}
