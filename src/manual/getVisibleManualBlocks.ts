import { getManualBodySearchSegments } from "@/manual/getManualBodySearchSegments"
import { getVisibleManualCallout } from "@/manual/getVisibleManualCallout"
import type { Manual, ManualBlock } from "@/manual/types"

/** Derive reader and search blocks without source-level duplicated pull quotes. */
export function getVisibleManualBlocks(
  /** Complete structured manual */
  manual: Manual,
  /** Source blocks for one topic */
  blocks: ManualBlock[],
  /** Precomputed normalized body strings for repeated topic-level calls */
  bodySearchSegments = getManualBodySearchSegments(manual),
): ManualBlock[] {
  return blocks.flatMap<ManualBlock>(block => {
    if (block.type !== "callout") return [block]

    const callout = getVisibleManualCallout(block, bodySearchSegments)
    return callout ? [callout] : []
  })
}
