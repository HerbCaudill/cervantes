import { getVisibleManualListBlock } from "@/manual/getVisibleManualListBlock"
import { getVisibleManualCalloutTextFragments } from "@/manual/getVisibleManualCalloutTextFragments"
import type { CalloutContentBlock, ManualBodyTextIndex } from "@/manual/types"

/** Remove repeated prose from one semantic block nested inside a callout. */
export function getVisibleManualCalloutContentBlocks(
  /** Source content block nested inside a callout */
  block: CalloutContentBlock,
  /** Fixed-width normalized body-window index */
  bodyTextIndex: ManualBodyTextIndex,
): CalloutContentBlock[] {
  switch (block.type) {
    case "heading":
    case "paragraph":
      return getVisibleManualCalloutTextFragments(block.text, bodyTextIndex).map(text => ({
        ...block,
        text,
      }))
    case "list": {
      const list = getVisibleManualListBlock(block, bodyTextIndex)
      return list ? [list] : []
    }
    case "table":
    case "figure":
      return [block]
  }
}
