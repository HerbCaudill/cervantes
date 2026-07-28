import type { TaggedNode, TaggedTextById } from "./types.ts"

/** Find the leftmost text or explicit bounding-box coordinate in a structure node. */
export function getTaggedNodeX(
  /** Structure node or content reference */
  node: TaggedNode,
  /** Extracted text keyed by structure content ID */
  textById: TaggedTextById,
): number {
  if (node.bbox) return node.bbox[0]
  if (node.type === "content" && node.id) {
    return Math.min(...(textById.get(node.id) ?? []).map(fragment => fragment.x), Infinity)
  }
  return Math.min(...(node.children ?? []).map(child => getTaggedNodeX(child, textById)), Infinity)
}
