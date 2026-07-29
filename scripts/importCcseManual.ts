import { mkdtemp, mkdir, readdir, rm, unlink, writeFile } from "node:fs/promises"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { getDocument } from "pdfjs-dist/legacy/build/pdf.mjs"
import { createFigureCrops } from "./ccse-manual-import/createFigureCrops.ts"
import { createTaggedTextById } from "./ccse-manual-import/createTaggedTextById.ts"
import { embedTableRowFigures } from "./ccse-manual-import/embedTableRowFigures.ts"
import { MANUAL_CONTENT_RANGES } from "./ccse-manual-import/constants.ts"
import { extractTaggedBlocks } from "./ccse-manual-import/extractTaggedBlocks.ts"
import { getManualFigureAlt } from "./ccse-manual-import/getManualFigureAlt.ts"
import { insertArtworkFigureBlocks } from "./ccse-manual-import/insertArtworkFigureBlocks.ts"
import { renderFigureCrop } from "./ccse-manual-import/renderFigureCrop.ts"
import type {
  DraftManual,
  DraftManualAsset,
  DraftManualSection,
  DraftManualTopic,
  FigureCrop,
  TaggedNode,
} from "./ccse-manual-import/types.ts"
import { validateGeneratedManual } from "./ccse-manual-import/validateGeneratedManual.ts"
import { writeManualDraft } from "./ccse-manual-import/writeManualDraft.ts"
import { EXPECTED_MANUAL_SHA256, EXPECTED_PAGE_COUNT, MANUAL_URL } from "./ccse-import/constants.ts"
import { downloadCcseManual } from "./ccse-import/downloadCcseManual.ts"
import { hashBytes } from "./ccse-import/hashBytes.ts"

const assetDirectoryUrl = new URL("../public/manual/figures/", import.meta.url)
const temporaryDirectory = await mkdtemp(join(tmpdir(), "cervantes-manual-"))
const temporaryPdfPath = join(temporaryDirectory, "manual.pdf")

try {
  console.log(`Downloading pinned source: ${MANUAL_URL}`)
  const pdfData = await downloadCcseManual()
  const sourceHash = hashBytes(pdfData)
  if (sourceHash !== EXPECTED_MANUAL_SHA256) {
    throw new Error(
      `Downloaded manual has SHA-256 ${sourceHash}; expected ${EXPECTED_MANUAL_SHA256}`,
    )
  }
  await writeFile(temporaryPdfPath, pdfData)

  const loadingTask = getDocument({ data: pdfData })
  const pdf = await loadingTask.promise
  if (pdf.numPages !== EXPECTED_PAGE_COUNT) {
    throw new Error(`Downloaded manual has ${pdf.numPages} pages; expected ${EXPECTED_PAGE_COUNT}`)
  }

  const sections: DraftManualSection[] = []
  const crops: FigureCrop[] = []

  for (const range of MANUAL_CONTENT_RANGES) {
    const topics: DraftManualTopic[] = []
    for (let pageNumber = range.firstPage; pageNumber <= range.lastPage; pageNumber += 1) {
      const page = await pdf.getPage(pageNumber)
      const textContent = await page.getTextContent({ includeMarkedContent: true })
      const textById = createTaggedTextById(textContent.items)
      const tree = (await page.getStructTree()) as TaggedNode
      const extractedBlocks = extractTaggedBlocks(tree, textById).map(block => {
        if (block.type !== "figure") return block
        const sourceNumber = Number(block.assetId.replace("figure-", ""))
        return { ...block, assetId: `figure-${pageNumber}-${sourceNumber}` }
      })
      const pageCrops = await createFigureCrops(page, tree, textById)
      const blocks = insertArtworkFigureBlocks(extractedBlocks, pageCrops)
      if (blocks.length === 0)
        throw new Error(`No semantic content extracted from page ${pageNumber}`)

      const firstHeading = blocks.find(block => block.type === "heading")
      topics.push({
        id: `${range.id}-draft-page-${pageNumber}`,
        title: firstHeading?.type === "heading" ? firstHeading.text : range.title,
        blocks,
      })
      crops.push(...pageCrops)
      page.cleanup()
    }
    sections.push({ id: range.id, title: range.title, topics })
  }

  const duplicateFigure = crops.find(
    (crop, index) => crops.findIndex(candidate => candidate.assetId === crop.assetId) !== index,
  )
  if (duplicateFigure) throw new Error(`Extracted duplicate caption for ${duplicateFigure.assetId}`)

  const assets: DraftManualAsset[] = crops.map(crop => ({
    id: crop.assetId,
    src: `/manual/figures/${crop.assetId}.jpg`,
    alt: getManualFigureAlt(crop.assetId, crop.caption),
  }))
  const manual: DraftManual = {
    id: "ccse-manual-2026",
    title:
      "Manual de preparación de la prueba de conocimientos constitucionales y socioculturales de España (CCSE)",
    edition: "2026",
    sourceUrl: MANUAL_URL,
    assets,
    sections: embedTableRowFigures(sections),
  }
  validateGeneratedManual(manual)

  await mkdir(assetDirectoryUrl, { recursive: true })
  const oldAssets = await readdir(assetDirectoryUrl)
  await Promise.all(
    oldAssets
      .filter(name => /^figure-\d+-(?:\d+|artwork-\d+)\.(?:jpg|png)$/.test(name))
      .map(name => unlink(new URL(name, assetDirectoryUrl))),
  )

  for (const crop of crops) {
    const page = await pdf.getPage(crop.pageNumber)
    await renderFigureCrop(
      temporaryPdfPath,
      crop,
      new URL(crop.assetId, assetDirectoryUrl).pathname,
      page.view[3],
    )
    page.cleanup()
  }

  await writeManualDraft(manual)
  await loadingTask.destroy()

  const blockCount = sections
    .flatMap(section => section.topics)
    .reduce((total, topic) => total + topic.blocks.length, 0)
  console.log(
    `Wrote ${sections.length} tasks, ${sections.flatMap(section => section.topics).length} page drafts, ${blockCount} semantic blocks, and ${assets.length} figures.`,
  )
} finally {
  await rm(temporaryDirectory, { recursive: true, force: true })
}
