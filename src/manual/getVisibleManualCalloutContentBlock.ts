import { getVisibleManualListBlock } from "@/manual/getVisibleManualListBlock"
import { isDuplicatedManualCalloutText } from "@/manual/isDuplicatedManualCalloutText"
import type { CalloutContentBlock } from "@/manual/types"

/** Remove repeated prose from one semantic block nested inside a callout. */
export function getVisibleManualCalloutContentBlock(
  /** Source content block nested inside a callout */
  block: CalloutContentBlock,
  /** Normalized searchable strings from non-callout blocks */
  bodySearchSegments: readonly string[],
): CalloutContentBlock | null {
  switch (block.type) {
    case "heading":
    case "paragraph":
      return isDuplicatedManualCalloutText(block.text, bodySearchSegments) ? null : block
    case "list":
      return getVisibleManualListBlock(block, bodySearchSegments)
    case "table":
    case "figure":
      return block
  }
}
