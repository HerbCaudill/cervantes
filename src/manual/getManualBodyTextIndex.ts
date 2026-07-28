import { MANUAL_CALLOUT_DEDUPLICATION_MIN_LENGTH } from "@/manual/constants"
import { createManualBodyTextIndex } from "@/manual/createManualBodyTextIndex"
import { getManualBodySearchSegments } from "@/manual/getManualBodySearchSegments"
import type { Manual, ManualBodyTextIndex } from "@/manual/types"

/** Build the normalized body-window index for one complete manual projection. */
export function getManualBodyTextIndex(
  /** Complete structured manual */
  manual: Manual,
): ManualBodyTextIndex {
  return createManualBodyTextIndex(
    getManualBodySearchSegments(manual),
    MANUAL_CALLOUT_DEDUPLICATION_MIN_LENGTH,
  )
}
