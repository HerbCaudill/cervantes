import { getVisibleManualCalloutContentBlock } from "@/manual/getVisibleManualCalloutContentBlock"
import type { CalloutBlock } from "@/manual/types"

/** Remove duplicated prose from a callout and suppress it when nothing visible remains. */
export function getVisibleManualCallout(
  /** Source callout */
  block: CalloutBlock,
  /** Normalized searchable strings from non-callout blocks */
  bodySearchSegments: readonly string[],
): CalloutBlock | null {
  const blocks = block.blocks
    .map(nestedBlock => getVisibleManualCalloutContentBlock(nestedBlock, bodySearchSegments))
    .filter(nestedBlock => nestedBlock !== null)

  return blocks.length > 0 ? { ...block, blocks } : null
}
