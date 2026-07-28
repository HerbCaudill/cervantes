import { describe, expect, it } from "vitest"
import { formatManualDraft } from "../formatManualDraft.ts"

describe("formatManualDraft", () => {
  it("produces output that is unchanged by a second formatting pass", async () => {
    const draft = {
      id: "ccse-manual-2026",
      sections: [{ id: "task-1", topics: [{ id: "topic", blocks: [] }] }],
    }

    const first = await formatManualDraft(draft, "src/manual/manual.draft.json")
    const second = await formatManualDraft(JSON.parse(first), "src/manual/manual.draft.json")

    expect(second).toBe(first)
  })
})
