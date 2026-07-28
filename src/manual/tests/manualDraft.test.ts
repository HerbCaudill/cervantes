import { describe, expect, it } from "vitest"
import manualDraft from "@/manual/manual.draft.json"
import type { Manual } from "@/manual/types"
import { validateManual } from "@/manual/validateManual"

describe("manual extraction draft", () => {
  it("matches the reader schema after deterministic extraction", () => {
    expect(() => validateManual(manualDraft as Manual)).not.toThrow()
  })
})
