import { getVisibleManualCalloutContentBlocks } from "@/manual/getVisibleManualCalloutContentBlocks"
import type { CalloutBlock } from "@/manual/types"

/** Remove duplicated prose from a callout and suppress it when nothing visible remains. */
export function getVisibleManualCallout(
  /** Source callout */
  block: CalloutBlock,
  /** Normalized searchable strings from non-callout blocks */
  bodySearchSegments: readonly string[],
): CalloutBlock | null {
  const blocks = block.blocks.flatMap(nestedBlock =>
    getVisibleManualCalloutContentBlocks(nestedBlock, bodySearchSegments),
  )

  return blocks.length > 0 ? { ...block, blocks } : null
}
