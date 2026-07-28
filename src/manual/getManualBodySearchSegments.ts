import { getManualBlockSearchSegments } from "@/manual/search/getManualBlockSearchSegments"
import { normalizeManualSearchText } from "@/manual/search/normalizeManualSearchText"
import type { Manual } from "@/manual/types"

/** Collect normalized searchable prose from every non-callout manual block. */
export function getManualBodySearchSegments(
  /** Complete structured manual */
  manual: Manual,
): string[] {
  const bodySearchSegments: string[] = []

  for (const section of manual.sections) {
    for (const topic of section.topics) {
      for (const block of topic.blocks) {
        if (block.type === "callout") continue
        for (const sourceText of getManualBlockSearchSegments(block)) {
          const normalizedText = normalizeManualSearchText(sourceText)
          if (normalizedText) bodySearchSegments.push(normalizedText)
        }
      }
    }
  }

  return bodySearchSegments
}
