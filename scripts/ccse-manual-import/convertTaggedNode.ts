import { extractListBlock } from "./extractListBlock.ts"
import { extractTableBlock } from "./extractTableBlock.ts"
import { findTaggedNodesByRole } from "./findTaggedNodesByRole.ts"
import { getTaggedNodeText } from "./getTaggedNodeText.ts"
import { getTaggedNodeX } from "./getTaggedNodeX.ts"
import type { LocatedManualBlock, TaggedNode, TaggedTextById } from "./types.ts"

/** Convert one tagged PDF node and its children into semantic manual blocks. */
export function convertTaggedNode(
  /** Tagged PDF structure node */
  node: TaggedNode,
  /** Extracted text keyed by structure content ID */
  textById: TaggedTextById,
): LocatedManualBlock[] {
  if (node.role === "Figure") return []

  if (node.role === "Table") {
    const table = extractTableBlock(node, textById)
    return table ? [{ block: table, x: getTaggedNodeX(node, textById) }] : []
  }

  if (node.role === "L") {
    const list = extractListBlock(node, textById)
    return list ? [{ block: list, x: getTaggedNodeX(node, textById) }] : []
  }

  const hasNestedSemanticNode = (node.children ?? []).some(
    child =>
      findTaggedNodesByRole(child, "Table").length > 0 ||
      findTaggedNodesByRole(child, "L").length > 0,
  )
  if (hasNestedSemanticNode) {
    return (node.children ?? []).flatMap(child => convertTaggedNode(child, textById))
  }

  if (/^H[1-6]$/.test(node.role ?? "")) {
    const text = getTaggedNodeText(node, textById)
    if (!text) return []
    return [
      {
        block: {
          type: "heading",
          level: node.role === "H1" || node.role === "H2" ? 2 : 3,
          text,
        },
        x: getTaggedNodeX(node, textById),
      },
    ]
  }

  if (node.role === "P") {
    const text = getTaggedNodeText(node, textById)
    if (!text) return []
    const x = getTaggedNodeX(node, textById)
    const figure = text.match(/^FIGURA\s*(\d+)\.?\s*/i)
    if (figure) {
      return [
        {
          block: {
            type: "figure",
            assetId: `figure-${Number(figure[1])}`,
            caption: text,
          },
          x,
        },
      ]
    }

    const paragraph = { type: "paragraph" as const, text }
    if (x >= 410) return []
    return [{ block: paragraph, x }]
  }

  return (node.children ?? []).flatMap(child => convertTaggedNode(child, textById))
}
