import { assertNonBlank } from "@/manual/assertNonBlank"
import { registerManualId } from "@/manual/registerManualId"
import { validateManualBlock } from "@/manual/validateManualBlock"
import type { Manual } from "@/manual/types"

/** Validate a structured manual before it is rendered or serialized. */
export function validateManual(
  /** Structured manual content to validate */
  manual: Manual,
): void {
  assertNonBlank(manual.id, "Manual ID")
  assertNonBlank(manual.title, "Manual title")
  assertNonBlank(manual.edition, "Manual edition")
  assertNonBlank(manual.sourceUrl, "Manual source URL")

  if (manual.sections.length === 0) throw new Error("Manual has no sections")

  const seenIds = new Set<string>()
  registerManualId(manual.id, "Manual", seenIds)

  for (const asset of manual.assets) {
    registerManualId(asset.id, "Manual asset", seenIds)
    assertNonBlank(asset.src, `Manual asset "${asset.id}" source`)
    assertNonBlank(asset.alt, `Manual asset "${asset.id}" alt text`)
  }

  const assetIds = new Set(manual.assets.map(asset => asset.id))

  for (const section of manual.sections) {
    registerManualId(section.id, "Manual section", seenIds)
    assertNonBlank(section.title, `Manual section "${section.id}" title`)
    if (section.topics.length === 0) {
      throw new Error(`Manual section "${section.id}" has no topics`)
    }

    for (const topic of section.topics) {
      registerManualId(topic.id, "Manual topic", seenIds)
      assertNonBlank(topic.title, `Manual topic "${topic.id}" title`)
      if (topic.blocks.length === 0) {
        throw new Error(`Manual topic "${topic.id}" is an empty topic`)
      }
      topic.blocks.forEach((block, index) =>
        validateManualBlock(block, assetIds, `Manual topic "${topic.id}" block ${index + 1}`),
      )
    }
  }
}
