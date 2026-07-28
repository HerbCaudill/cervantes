import { getManualBlockSearchSegments } from "@/manual/search/getManualBlockSearchSegments"
import { normalizeManualSearchText } from "@/manual/search/normalizeManualSearchText"
import type { Manual } from "@/manual/types"

/** Collect normalized searchable prose from every non-callout manual block. */
export function getManualBodySearchSegments(
  /** Complete structured manual */
  manual: Manual,
): string[] {
  return manual.sections.flatMap(section =>
    section.topics.flatMap(topic =>
      topic.blocks
        .filter(block => block.type !== "callout")
        .flatMap(getManualBlockSearchSegments)
        .map(normalizeManualSearchText)
        .filter(Boolean),
    ),
  )
}
