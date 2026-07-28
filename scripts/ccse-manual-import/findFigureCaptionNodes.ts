import { getTaggedNodeText } from "./getTaggedNodeText.ts"
import type { TaggedNode, TaggedTextById } from "./types.ts"

/** Find numbered figure-caption paragraphs in semantic source order. */
export function findFigureCaptionNodes(
  /** Root tagged PDF structure node */
  node: TaggedNode,
  /** Extracted text keyed by structure content ID */
  textById: TaggedTextById,
): TaggedNode[] {
  const isCaption = node.role === "P" && /^FIGURA\s*\d+\.?/i.test(getTaggedNodeText(node, textById))
  if (isCaption) return [node]
  return [...(node.children ?? []).flatMap(child => findFigureCaptionNodes(child, textById))]
}
