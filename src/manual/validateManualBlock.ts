import { assertNonBlank } from "@/manual/assertNonBlank"
import type { ManualAssetId, ManualBlock } from "@/manual/types"

/** Validate one semantic manual block. */
export function validateManualBlock(
  /** Semantic source block to validate */
  block: ManualBlock,
  /** IDs of locally bundled assets */
  assetIds: ReadonlySet<ManualAssetId>,
  /** Human-readable block location included in errors */
  location: string,
): void {
  switch (block.type) {
    case "heading":
      assertNonBlank(block.text, `${location} heading text`)
      return

    case "paragraph":
      assertNonBlank(block.text, `${location} paragraph text`)
      return

    case "list":
      if (block.items.length === 0) throw new Error(`${location} list is empty`)
      block.items.forEach((item, index) => {
        const itemLocation = `${location} list item ${index + 1}`
        if (typeof item === "string") {
          assertNonBlank(item, itemLocation)
          return
        }
        if (
          !item ||
          typeof item !== "object" ||
          typeof item.text !== "string" ||
          !item.children ||
          item.children.type !== "list" ||
          !Array.isArray(item.children.items) ||
          (item.children.style !== "ordered" &&
            item.children.style !== "unordered" &&
            item.children.style !== "unmarked")
        ) {
          throw new Error(`${itemLocation} is an invalid nested list item`)
        }
        assertNonBlank(item.text, `${itemLocation} text`)
        validateManualBlock(item.children, assetIds, `${itemLocation} child list`)
      })
      return

    case "table": {
      if (block.headers.length === 0) throw new Error(`${location} table has no headers`)
      if (block.rows.length === 0) throw new Error(`${location} table has no rows`)
      block.headers.forEach((header, index) =>
        assertNonBlank(header, `${location} table header ${index + 1}`),
      )
      if (block.caption !== undefined) assertNonBlank(block.caption, `${location} table caption`)

      block.rows.forEach((row, rowIndex) => {
        if (row.length !== block.headers.length) {
          throw new Error(
            `${location} table row ${rowIndex + 1} must have ${block.headers.length} cells`,
          )
        }
        row.forEach((cell, cellIndex) => {
          if (cell !== null) {
            assertNonBlank(cell, `${location} table row ${rowIndex + 1} cell ${cellIndex + 1}`)
          }
        })
      })
      return
    }

    case "figure":
      assertNonBlank(block.assetId, `${location} figure asset ID`)
      assertNonBlank(block.caption, `${location} figure caption`)
      if (!assetIds.has(block.assetId)) {
        throw new Error(`${location} figure refers to unknown asset "${block.assetId}"`)
      }
      return

    default:
      throw new Error(`${location} has an unsupported block type`)
  }
}
