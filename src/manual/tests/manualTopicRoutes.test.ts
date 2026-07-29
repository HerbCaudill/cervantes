import { describe, expect, it } from "vitest"
import manualDraft from "@/manual/manual.draft.json"
import { getManualTopicSlug } from "@/manual/getManualTopicSlug"
import type { Manual } from "@/manual/types"

const manual = manualDraft as Manual

describe("manual topic routes", () => {
  it("gives every topic a unique semantic public slug without draft page IDs", () => {
    for (const section of manual.sections) {
      const slugs = section.topics.map(topic => getManualTopicSlug(section, topic))

      expect(new Set(slugs).size).toBe(section.topics.length)
      expect(slugs.every(slug => !slug.includes("draft-page"))).toBe(true)
      expect(slugs.every(slug => /[a-z]/.test(slug))).toBe(true)
    }
  })
})
