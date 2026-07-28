import { describe, expect, it } from "vitest"
import { getManualMarginNote } from "@/manual/getManualMarginNote"

describe("getManualMarginNote", () => {
  it("compacts article numbers to fit the marginal column", () => {
    expect(getManualMarginNote("Artículo 14")).toBe("Art.14")
  })

  it("detects article references anywhere in the source text", () => {
    expect(
      getManualMarginNote(
        "El artículo 22 de la Constitución española reconoce el derecho de asociación.",
      ),
    ).toBe("Art.22")
    expect(getManualMarginNote("Los partidos políticos (artículo 6) expresan el pluralismo.")).toBe(
      "Art.6",
    )
  })

  it("compacts article ranges and paired references", () => {
    expect(getManualMarginNote("Los artículos 7 y 28 regulan estas organizaciones.")).toBe("7–28")
    expect(getManualMarginNote("Artículos 14 al 29")).toBe("14–29")
  })

  it("does not mistake an unnumbered use of artículo for a legal reference", () => {
    expect(getManualMarginNote("Es un artículo publicado en la prensa.")).toBeNull()
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
