import type { TaggedNode, TaggedTextById } from "./types.ts"

/** Find the highest text or explicit bounding-box coordinate in a structure node. */
export function getTaggedNodeY(
  /** Structure node or content reference */
  node: TaggedNode,
  /** Extracted text keyed by structure content ID */
  textById: TaggedTextById,
): number {
  if (node.bbox) return node.bbox[3]
  if (node.type === "content" && node.id) {
    return Math.max(...(textById.get(node.id) ?? []).map(fragment => fragment.y), -Infinity)
  }
  return Math.max(...(node.children ?? []).map(child => getTaggedNodeY(child, textById)), -Infinity)
}
