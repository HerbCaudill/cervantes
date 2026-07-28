import type { TaggedNode, TaggedTextById } from "./types.ts"

/** Reconstruct normalized source text from a tagged PDF structure node. */
export function getTaggedNodeText(
  /** Structure node or content reference */
  node: TaggedNode,
  /** Extracted text keyed by structure content ID */
  textById: TaggedTextById,
): string {
  if (node.alt !== undefined) {
    if (node.alt === "\u00ad") return "\u00ad"
    return node.alt
  }

  if (node.type === "content" && node.id) {
    return (textById.get(node.id) ?? []).map(fragment => fragment.text).join("")
  }

  const text = (node.children ?? [])
    .map(child => getTaggedNodeText(child, textById))
    .join(" ")
    .replace(/\s*\u00ad\s*/g, "")
    .replace(/\s+([,.;:!?%)»])/g, "$1")
    .replace(/([¿¡(«])\s+/g, "$1")
    .replace(/\s+/g, " ")
    .trim()

  return text
}
