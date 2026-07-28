import { getVisibleManualCalloutContentBlocks } from "@/manual/getVisibleManualCalloutContentBlocks"
import type { CalloutBlock, ManualBodyTextIndex } from "@/manual/types"

/** Remove duplicated prose from a callout and suppress it when nothing visible remains. */
export function getVisibleManualCallout(
  /** Source callout */
  block: CalloutBlock,
  /** Fixed-width normalized body-window index */
  bodyTextIndex: ManualBodyTextIndex,
): CalloutBlock | null {
  const blocks = block.blocks.flatMap(nestedBlock =>
    getVisibleManualCalloutContentBlocks(nestedBlock, bodyTextIndex),
  )

  return blocks.length > 0 ? { ...block, blocks } : null
}
