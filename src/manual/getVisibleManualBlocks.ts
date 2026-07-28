import { getManualBodyTextIndex } from "@/manual/getManualBodyTextIndex"
import { getVisibleManualCallout } from "@/manual/getVisibleManualCallout"
import type { Manual, ManualBlock, ManualBodyTextIndex } from "@/manual/types"

/** Derive reader and search blocks without source-level duplicated pull quotes. */
export function getVisibleManualBlocks(
  /** Complete structured manual */
  manual: Manual,
  /** Source blocks for one topic */
  blocks: ManualBlock[],
  /** Precomputed body-window index for repeated topic-level calls */
  bodyTextIndex: ManualBodyTextIndex = getManualBodyTextIndex(manual),
): ManualBlock[] {
  return blocks.flatMap<ManualBlock>(block => {
    if (block.type !== "callout") return [block]

    const callout = getVisibleManualCallout(block, bodyTextIndex)
    return callout ? [callout] : []
  })
}
