import { findTaggedNodesByRole } from "./findTaggedNodesByRole.ts"
import { getTaggedNodeText } from "./getTaggedNodeText.ts"
import type { DraftListBlock, TaggedNode, TaggedTextById } from "./types.ts"

/** Convert a tagged PDF list into ordered source items. */
export function extractListBlock(
  /** Tagged list node */
  list: TaggedNode,
  /** Extracted text keyed by structure content ID */
  textById: TaggedTextById,
): DraftListBlock | null {
  const items = findTaggedNodesByRole(list, "LI")
    .map(item => getTaggedNodeText(item, textById).replace(/^[•·]\s*/, ""))
    .filter(Boolean)

  if (items.length === 0) return null
  const style = items.every(item => /^\d+[.)]\s/.test(item)) ? "ordered" : "unordered"
  return { type: "list", style, items }
}
