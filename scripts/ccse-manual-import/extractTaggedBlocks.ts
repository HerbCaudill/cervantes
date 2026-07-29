import { attachTableCaptions } from "./attachTableCaptions.ts"
import { convertTaggedNode } from "./convertTaggedNode.ts"
import { normalizePopulationTableBlock } from "./normalizePopulationTableBlock.ts"
import type { DraftManualBlock, TaggedNode, TaggedTextById } from "./types.ts"

/** Extract semantic manual blocks from one tagged PDF page. */
export function extractTaggedBlocks(
  /** Root tagged PDF structure node */
  tree: TaggedNode,
  /** Extracted text keyed by structure content ID */
  textById: TaggedTextById,
): DraftManualBlock[] {
  const blocks = convertTaggedNode(tree, textById).map(({ block }) => block)
  return attachTableCaptions(blocks).map(normalizePopulationTableBlock)
}
