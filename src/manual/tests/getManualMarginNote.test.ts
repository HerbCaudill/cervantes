import { describe, expect, it } from "vitest"
import { getManualMarginNote } from "@/manual/getManualMarginNote"

describe("getManualMarginNote", () => {
  it("compacts article numbers to fit the marginal column", () => {
    expect(getManualMarginNote("Artículo 14")).toBe("Art.14")
  })

  it("places a key date in the marginal column without altering the source text", () => {
    expect(
      getManualMarginNote(
        "La Constitución española fue aprobada en referéndum por los españoles el 6 de diciembre de 1978.",
      ),
    ).toBe("1978")
  })

  it("does not invent a note when the source has no article or date", () => {
    expect(getManualMarginNote("La Constitución es la ley fundamental de España.")).toBeNull()
  })
})
