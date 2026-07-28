import { getVisibleManualListBlock } from "@/manual/getVisibleManualListBlock"
import { getVisibleManualCalloutTextFragments } from "@/manual/getVisibleManualCalloutTextFragments"
import type { CalloutContentBlock } from "@/manual/types"

/** Remove repeated prose from one semantic block nested inside a callout. */
export function getVisibleManualCalloutContentBlocks(
  /** Source content block nested inside a callout */
  block: CalloutContentBlock,
  /** Normalized searchable strings from non-callout blocks */
  bodySearchSegments: readonly string[],
): CalloutContentBlock[] {
  switch (block.type) {
    case "heading":
    case "paragraph":
      return getVisibleManualCalloutTextFragments(block.text, bodySearchSegments).map(text => ({
        ...block,
        text,
      }))
    case "list": {
      const list = getVisibleManualListBlock(block, bodySearchSegments)
      return list ? [list] : []
    }
    case "table":
    case "figure":
      return [block]
  }
}
