import { findTaggedNodesByRole } from "./findTaggedNodesByRole.ts"
import { getTaggedNodeText } from "./getTaggedNodeText.ts"
import type { DraftTableBlock, TaggedNode, TaggedTextById } from "./types.ts"

/** Convert a tagged PDF table into explicit headers and rows. */
export function extractTableBlock(
  /** Tagged table node */
  table: TaggedNode,
  /** Extracted text keyed by structure content ID */
  textById: TaggedTextById,
): DraftTableBlock | null {
  const rows = findTaggedNodesByRole(table, "TR").map(row =>
    (row.children ?? [])
      .filter(cell => cell.role === "TH" || cell.role === "TD")
      .map(cell => getTaggedNodeText(cell, textById) || null),
  )
  const populatedRows = rows.filter(row => row.length > 0)
  if (populatedRows.length === 0) return null

  const headerCells = populatedRows[0]
  const columnCount = Math.max(...populatedRows.map(row => row.length))
  const headers = Array.from({ length: columnCount }, (_, index) => {
    const value = headerCells[index]
    return value ?? `Columna ${index + 1}`
  })
  const sourceDataRows = populatedRows.length === 1 ? populatedRows : populatedRows.slice(1)
  const dataRows = sourceDataRows.map(row =>
    Array.from({ length: columnCount }, (_, index) => row[index] ?? null),
  )

  return { type: "table", headers, rows: dataRows }
}
